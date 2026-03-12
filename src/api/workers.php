<?php
// Workers.php
// Hardened version: always return JSON, convert fatal/uncaught errors to JSON,
// validate config.php produced $conn (mysqli), preserve original behavior otherwise.

ini_set('display_errors', '0'); // don't render HTML error pages
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Convert uncaught exceptions to JSON
set_exception_handler(function($ex) {
    http_response_code(500);
    error_log("[Workers.php] Uncaught exception: " . $ex->getMessage());
    echo json_encode(["success" => false, "error" => "Internal server error", "details" => $ex->getMessage()]);
    exit();
});

// Convert fatal errors into JSON (shutdown handler)
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
        http_response_code(500);
        $msg = isset($err['message']) ? $err['message'] : 'Unknown fatal error';
        error_log("[Workers.php] Shutdown fatal error: " . $msg . " in " . ($err['file'] ?? '') . " on line " . ($err['line'] ?? ''));
        echo json_encode(["success" => false, "error" => "Fatal error", "details" => $msg]);
        exit();
    }
});

// include config.php safely
try {
    require_once 'config.php';
} catch (Throwable $t) {
    error_log("[Workers.php] config.php include failed: " . $t->getMessage());
    if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to include config.php", "details" => $t->getMessage()]);
    exit();
}

// validate $conn
if (!isset($conn) || !($conn instanceof mysqli)) {
    error_log("[Workers.php] Missing or invalid \$conn from config.php");
    if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection not configured", "details" => "Expected \$conn (mysqli) from config.php"]);
    exit();
}

// helper: read JSON body for PUT/POST when needed
function read_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $json = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) return [];
    return $json;
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "OK"]);
    exit();
}

try {
    if ($method === 'GET') {
        // GET all or single by id: /api/Workers.php?id=...
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM workers WHERE worker_id = ? AND isDeleted = 0 LIMIT 1");
            if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param("i", $id);
        } else {
            $stmt = $conn->prepare("SELECT * FROM workers WHERE isDeleted = 0 ORDER BY createdOn DESC");
            if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
        }
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($row = $res->fetch_assoc()) {
            // normalize: expose id consistently to frontend (id and worker_id)
            $row['id'] = $row['worker_id'];
            $out[] = $row;
        }

        // Return consistent shape so frontend parsing is straightforward
        if ($id) {
            echo json_encode(["success" => true, "data" => ($out[0] ?? null)]);
        } else {
            echo json_encode(["success" => true, "data" => $out]);
        }
        exit();
    }

    if ($method === 'POST') {
        // Create worker — accept JSON or form data
        $payload = $_POST ?: json_decode(file_get_contents('php://input'), true) ?: [];

        $username = isset($payload['username']) ? trim($payload['username']) : null;
        $display_name = isset($payload['displayName']) ? trim($payload['displayName']) : (isset($payload['display_name']) ? trim($payload['display_name']) : null);
        $email = isset($payload['email']) ? trim($payload['email']) : null;
        $phone = isset($payload['phone']) ? trim($payload['phone']) : null;
        $role = isset($payload['role']) ? trim($payload['role']) : 'technician';
        $permissions = isset($payload['permissions']) ? $payload['permissions'] : (isset($payload['permissions_json']) ? $payload['permissions_json'] : null);
        $branch_id = null;
        if (isset($payload['branchId'])) {
            $branch_id = ($payload['branchId'] === '' || $payload['branchId'] === null) ? null : intval($payload['branchId']);
        } elseif (isset($payload['branch_id'])) {
            $branch_id = ($payload['branch_id'] === '' || $payload['branch_id'] === null) ? null : intval($payload['branch_id']);
        }
        $password = isset($payload['password']) ? $payload['password'] : null;

        // validations
        if (!$username) throw new Exception("username is required");
        if (!$display_name) throw new Exception("displayName is required");
        if (!$password) throw new Exception("password is required");

        // uniqueness check
        $chk = $conn->prepare("SELECT worker_id FROM workers WHERE username = ? LIMIT 1");
        if ($chk === false) throw new Exception("Prepare failed: " . $conn->error);
        $chk->bind_param("s", $username);
        $chk->execute();
        $r = $chk->get_result();
        if ($r->num_rows > 0) throw new Exception("username already exists");

        // prepare insert
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $permissions_json = $permissions ? json_encode($permissions) : json_encode(new stdClass());

        $sql = "INSERT INTO workers (username, display_name, email, phone, password_hash, role, permissions, branch_id, isActive, isDeleted, createdOn, modifiedOn)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);

        // branch param - allow null
        $branch_param = $branch_id !== null ? $branch_id : null;
        // bind_param expects variables; use types "sssssssi" (s x7, i)
        // Note: when binding null as int, mysqli will accept null if type is 'i'
        $stmt->bind_param("sssssssi", $username, $display_name, $email, $phone, $password_hash, $role, $permissions_json, $branch_param);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Worker created", "worker_id" => $conn->insert_id]);
        exit();
    }

    if ($method === 'PUT') {
        // Update — expects ?id=... and JSON body
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id) throw new Exception("Missing id for update");

        $body = read_json_body();
        if (!$body) throw new Exception("Invalid JSON body");

        // Fetch existing
        $sel = $conn->prepare("SELECT * FROM workers WHERE worker_id = ? AND isDeleted = 0 LIMIT 1");
        if ($sel === false) throw new Exception("Prepare failed: " . $conn->error);
        $sel->bind_param("i", $id);
        $sel->execute();
        $r = $sel->get_result();
        if ($r->num_rows !== 1) throw new Exception("Worker not found");

        // Allowed updates: username, displayName, email, phone, role, permissions, branchId, password (optional)
        $updates = [];
        $types = '';
        $values = [];

        if (isset($body['username'])) { $updates[] = "username = ?"; $types .= 's'; $values[] = trim($body['username']); }
        if (isset($body['displayName']) || isset($body['display_name'])) { $updates[] = "display_name = ?"; $types .= 's'; $values[] = trim($body['displayName'] ?? $body['display_name']); }
        if (isset($body['email'])) { $updates[] = "email = ?"; $types .= 's'; $values[] = trim($body['email']); }
        if (isset($body['phone'])) { $updates[] = "phone = ?"; $types .= 's'; $values[] = trim($body['phone']); }
        if (isset($body['role'])) { $updates[] = "role = ?"; $types .= 's'; $values[] = trim($body['role']); }
        if (isset($body['permissions'])) { $updates[] = "permissions = ?"; $types .= 's'; $values[] = json_encode($body['permissions']); }
        if (array_key_exists('branchId', $body) || array_key_exists('branch_id', $body)) {
            $branchVal = array_key_exists('branchId', $body) ? $body['branchId'] : $body['branch_id'];
            $branchParam = ($branchVal === '' || $branchVal === null) ? null : intval($branchVal);
            $updates[] = "branch_id = ?";
            $types .= 'i';
            $values[] = $branchParam;
        }
        if (isset($body['password']) && $body['password']) {
            $updates[] = "password_hash = ?";
            $types .= 's';
            $values[] = password_hash($body['password'], PASSWORD_DEFAULT);
        }

        if (count($updates) === 0) throw new Exception("No updatable fields provided");

        $sql = "UPDATE workers SET " . implode(', ', $updates) . ", modifiedOn = NOW() WHERE worker_id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);

        // bind params (types + id)
        $types .= 'i';
        $values[] = $id;
        // bind_param requires types string and variables passed by reference
        $bind_names = [];
        $bind_names[] = $types;
        for ($i = 0; $i < count($values); $i++) {
            $bind_name = 'bind' . $i;
            $$bind_name = $values[$i];
            $bind_names[] = &$$bind_name;
        }
        call_user_func_array([$stmt, 'bind_param'], $bind_names);

        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Worker updated"]);
        exit();
    }

    if ($method === 'DELETE') {
        // soft delete: /api/Workers.php?id=...
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id) throw new Exception("Missing id for delete");

        $stmt = $conn->prepare("UPDATE workers SET isDeleted = 1, isActive = 0, modifiedOn = NOW() WHERE worker_id = ?");
        if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Worker deleted"]);
        exit();
    }

    // default
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();

} catch (Exception $e) {
    // Return JSON error; preserve message for debugging
    error_log("[Workers.php] Exception: " . $e->getMessage());
    if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
    http_response_code(400);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit();
}
