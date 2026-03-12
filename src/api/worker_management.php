<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . "/config.php";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$database;charset=utf8mb4",
        $user,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed", "details" => $e->getMessage()]);
    exit;
}

function decode_jwt($jwt)
{
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return null;
    $payload = $parts[1];
    return json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
}

// ------------------------------
// GET JWT FROM HEADERS
$headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
$token = null;
if (isset($headers['Authorization']) && preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
    $token = $matches[1];
}
$user_guid = null;
if ($token) {
    $decoded = decode_jwt($token);
    if ($decoded && isset($decoded['user_guid'])) {
        if ($decoded['role_id'] === 1) {
            $user_guid = $decoded['user_guid'];
        } else {
            $userGuid = $decoded['user_guid'];
            $result = $conn->query("
                SELECT admin_guid 
                FROM users
                WHERE user_guid = '$userGuid'
                AND isDeleted = FALSE
                LIMIT 1
            ");
            if ($result && $row = $result->fetch_assoc()) {
                $user_guid = $row['admin_guid'];
            }
        }
    }
}

// AES Encryption key (from config.php)
$encKey = $encryption_key;

function encryptPassword($pdo, $plain, $Key) {
    $stmt = $pdo->prepare("SELECT AES_ENCRYPT(:p, :k) AS ep");
    $stmt->execute([":p" => $plain, ":k" => $Key]);
    return $stmt->fetchColumn();
}


function generate_guid() {
    return bin2hex(random_bytes(16));
}


if ($_GET["action"] === "create_worker" && $_SERVER["REQUEST_METHOD"] === "POST") {

    $body = json_decode(file_get_contents("php://input"), true);

    $first_name   = $body["first_name"] ?? "";
    $last_name    = $body["last_name"] ?? "";
    $email        = $body["email"] ?? "";
    $mobile       = $body["mobile"] ?? "";
    $role_id      = $body["role_id"] ?? null;
    $create_login = !empty($body["create_login"]);
    $login_email  = $body["login_email"] ?? null;
    $login_pass   = $body["login_password"] ?? null;

    if (!$first_name || !$email) {
        http_response_code(400);
        echo json_encode(["error" => "First name and email are required"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $guid = generate_guid();

        // Insert worker
        $pdo->prepare("
            INSERT INTO users (user_guid, first_name, last_name, email, mobile)
            VALUES (:ug, :fn, :ln, :em, :mb)
        ")->execute([
            ":ug" => $guid,
            ":fn" => $first_name,
            ":ln" => $last_name,
            ":em" => $email,
            ":mb" => $mobile
        ]);

        // If login requested
        if ($create_login) {

            // Validate
            if (!$login_email || !$login_pass) {
                throw new Exception("Login email and password required.");
            }

            // Does email already exist?
            $chk = $pdo->prepare("SELECT id FROM profile_crud WHERE email = :e LIMIT 1");
            $chk->execute([":e" => $login_email]);
            if ($chk->fetch()) {
                throw new Exception("Login email already exists.");
            }

            $hash = password_hash($login_pass, PASSWORD_BCRYPT);
            $encrypted = encryptPassword($pdo, $login_pass, $encKey);
            $username = substr($first_name . "_" . $last_name, 0, 20);

            $pdo->prepare("
                INSERT INTO profile_crud
                    (user_guid, userName, email, phone_number, password, encrypted_password, role_id, isActive, isDeleted, createdOn, modifiedOn)
                VALUES
                    (:ug, :un, :em, :ph, :pw, :ep, :rid, 1, 0, NOW(), NOW())
            ")->execute([
                ":ug" => $guid,
                ":un" => $username,
                ":em" => $login_email,
                ":ph" => $mobile,
                ":pw" => $hash,
                ":ep" => $encrypted,
                ":rid" => $role_id
            ]);
        }

        $pdo->commit();
        echo json_encode(["success" => true, "user_guid" => $guid]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

    exit;
}

if ($_GET["action"] === "workers" && $_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "
        SELECT 
            u.id,
            u.user_guid,
            u.first_name,
            u.last_name,
            u.email,
            u.mobile,

            p.id AS profile_id,
            p.email AS login_email,
            AES_DECRYPT(p.encrypted_password, :k) AS login_password,
            p.role_id

        FROM users u
        LEFT JOIN profile_crud p ON p.user_guid = u.user_guid
        WHERE u.admin_guid = '$user_guid'
        ORDER BY u.first_name, u.last_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":k" => $encKey]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$u) {
        $u["has_login"] = !empty($u["profile_id"]);
        if ($u["login_password"] !== null) {
            $u["login_password"] = $u["login_password"]; // decrypted
        }
    }

    echo json_encode($rows);
    exit;
}


if ($_GET["action"] === "roles") {
    $stmt = $pdo->query("SELECT id, role_name, description FROM roles ORDER BY id");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_GET["action"] === "permissions") {

    $perms = $pdo->query("SELECT id, permission_name, description FROM permissions ORDER BY id")
                ->fetchAll(PDO::FETCH_ASSOC);

    $rp = $pdo->query("
        SELECT rp.role_id, p.permission_name
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
    ")->fetchAll(PDO::FETCH_ASSOC);

    $map = [];
    foreach ($rp as $r) $map[$r["role_id"]][] = $r["permission_name"];

    echo json_encode(["permissions" => $perms, "role_permissions" => $map]);
    exit;
}

if ($_GET["action"] === "update_role_permissions" && $_SERVER["REQUEST_METHOD"] === "PUT") {

    $body = json_decode(file_get_contents("php://input"), true);

    if (empty($body["role_id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing role_id"]);
        exit;
    }

    $role_id = $body["role_id"];
    $perms   = $body["permissions"] ?? [];

    try {
        $pdo->beginTransaction();

        $pdo->prepare("DELETE FROM role_permissions WHERE role_id = :rid")
            ->execute([":rid" => $role_id]);

        if ($perms) {
            $ins = $pdo->prepare("
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES (:rid, :pid)
            ");

            foreach ($perms as $p)
                $ins->execute([":rid" => $role_id, ":pid" => $p]);
        }

        $pdo->commit();
        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

    exit;
}

if ($_GET["action"] === "update_worker" && $_SERVER["REQUEST_METHOD"] === "PUT") {

    $id = $_GET["id"] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing user ID"]);
        exit;
    }

    $body = json_decode(file_get_contents("php://input"), true);

    $role_id      = $body["role_id"] ?? null;
    $create_login = !empty($body["create_login"]);
    $login_email  = $body["login_email"] ?? null;
    $login_pass   = $body["login_password"] ?? null;

    // Fetch user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Fetch existing profile
        $p = $pdo->prepare("SELECT * FROM profile_crud WHERE user_guid = :ug LIMIT 1");
        $p->execute([":ug" => $user["user_guid"]]);
        $profile = $p->fetch(PDO::FETCH_ASSOC);

        // Update role if exists
        if ($role_id !== null && $profile) {
            $pdo->prepare("
                UPDATE profile_crud SET role_id = :rid WHERE user_guid = :ug
            ")->execute([
                ":rid" => $role_id,
                ":ug"  => $user["user_guid"]
            ]);
        }

        // If login checkbox is enabled
        if ($create_login) {

            if (!$login_email || !$login_pass) {
                throw new Exception("Login email and password are required.");
            }

            $encrypted = encryptPassword($pdo, $login_pass, $encKey);
            $hash = password_hash($login_pass, PASSWORD_BCRYPT);

            if ($profile) {
                $pdo->prepare("
                    UPDATE profile_crud
                    SET email = :em,
                        password = :pw,
                        encrypted_password = :ep,
                        role_id = :rid,
                        modifiedOn = NOW()
                    WHERE user_guid = :ug
                ")->execute([
                    ":em"  => $login_email,
                    ":pw"  => $hash,
                    ":ep"  => $encrypted,
                    ":rid" => $role_id,
                    ":ug"  => $user["user_guid"]
                ]);
            }

            else {
                $username = substr($user["first_name"] . "_" . $user["last_name"], 0, 20);

                $pdo->prepare("
                    INSERT INTO profile_crud
                        (user_guid, userName, email, phone_number, password, encrypted_password, role_id, isActive, isDeleted, createdOn, modifiedOn)
                    VALUES
                        (:ug, :un, :em, :ph, :pw, :ep, :rid, 1, 0, NOW(), NOW())
                ")->execute([
                    ":ug"  => $user["user_guid"],
                    ":un"  => $username,
                    ":em"  => $login_email,
                    ":ph"  => $user["mobile"],
                    ":pw"  => $hash,
                    ":ep"  => $encrypted,
                    ":rid" => $role_id
                ]);
            }
        }

        $pdo->commit();
        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

    exit;
}

http_response_code(400);
echo json_encode(["error" => "Invalid action"]);
exit;

?>
