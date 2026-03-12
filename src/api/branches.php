    <?php
    // branches.php

    ini_set('display_errors', '0');
    error_reporting(E_ALL);

    // Ensure responses are JSON unless otherwise changed below
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Convert uncaught exceptions into JSON
    set_exception_handler(function ($ex) {
        http_response_code(500);
        error_log("[branches.php] Uncaught exception: " . $ex->getMessage());
        echo json_encode(["success" => false, "error" => "Internal server error", "details" => $ex->getMessage()]);
        exit();
    });

    // Convert fatal errors into JSON (useful for DB/require failures)
    register_shutdown_function(function () {
        $err = error_get_last();
        if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
            if (!headers_sent()) {
                header("Content-Type: application/json; charset=UTF-8");
                http_response_code(500);
            }
            $msg = isset($err['message']) ? $err['message'] : 'Unknown fatal error';
            error_log("[branches.php] Shutdown fatal error: " . $msg . " in " . ($err['file'] ?? '') . " on line " . ($err['line'] ?? ''));
            // Keep the error message in "details" to help devs; you can remove details in production.
            echo json_encode(["success" => false, "error" => "Fatal error", "details" => $msg]);
            exit();
        }
    });

    // Ensure config.php inclusion errors are returned as JSON instead of HTML
    $configIncluded = false;
    try {
        require_once 'config.php';
        $configIncluded = true;
    } catch (Throwable $t) {
        error_log("[branches.php] config.php include failed: " . $t->getMessage());
        if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to include config.php", "details" => $t->getMessage()]);
        exit();
    }

    // Validate $conn existence and type
    if (!isset($conn) || !($conn instanceof mysqli)) {
        error_log("[branches.php] Missing or invalid \$conn from config.php");
        if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database connection not configured", "details" => "Expected \$conn (mysqli) from config.php"]);
        exit();
    }
        // existing logic follows (preserved behavior) ---------------------------------------------------
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    require_once 'middleware.php'; // must contain decode_jwt()
$authHeader = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (function_exists('getallheaders')) {
    $headers = getallheaders();
    $headers = array_change_key_case($headers, CASE_LOWER);
    if (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }
}

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit();
}

$validation = validateJWTAndGetGuid($matches[1]);

if (!$validation['success']) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => $validation['error']
    ]);
    exit();
}

$decoded = (array)$validation['data'];

$user_guid = $decoded['user_guid'] ?? null;
$role_id   = isset($decoded['role_id']) ? (int)$decoded['role_id'] : null;

if (!$user_guid || $role_id === null) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => "Invalid token payload"
    ]);
    exit();
}


/**
 * FINAL resolved scope value
 */
$admin_guid = null;

if ($role_id === 1) {
    // Admin user
    $admin_guid = $user_guid;
} else {
    // Staff user → find admin
    $stmt = $conn->prepare("
        SELECT admin_guid 
        FROM users 
        WHERE user_guid = ? AND isDeleted = 0 
        LIMIT 1
    ");
    $stmt->bind_param("s", $user_guid);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows !== 1) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Admin mapping not found"]);
        exit();
    }

    $admin_guid = $res->fetch_assoc()['admin_guid'];
}

if (!$admin_guid) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => "Admin scope resolution failed"
    ]);
    exit();
}


    try {
        if ($method === 'GET') {
            $id = isset($_GET['id']) ? intval($_GET['id']) : null;

            if ($id) {
                  $stmt = $conn->prepare("
        SELECT * FROM branches 
        WHERE branch_id = ? 
        AND admin_guid = ? 
        AND isDeleted = 0 
        LIMIT 1
    ");
                if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
                $stmt->bind_param("is", $id, $admin_guid);
            } else {
                 $stmt = $conn->prepare("
        SELECT * FROM branches 
        WHERE admin_guid = ? 
        AND isDeleted = 0 
        ORDER BY createdOn DESC
    ");
                if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
                $stmt->bind_param("s", $admin_guid);
            }

            $stmt->execute();
            $result = $stmt->get_result();
            $branches = [];
            while ($row = $result->fetch_assoc()) {
                $branches[] = $row;
            }

            echo json_encode([
                "success" => true,
                "data" => $id ? ($branches[0] ?? null) : $branches
            ]);
            exit();
        }

        if ($method === 'POST') {
            // Determine update vs create
            $isUpdate = isset($_POST['branch_id']) && $_POST['branch_id'] !== '';
            $branch_id = $isUpdate ? intval($_POST['branch_id']) : null;

            // If update, fetch current image path for potential deletion
            $currentImage = null;
            if ($isUpdate) {
                $sel = $conn->prepare("SELECT image_path FROM branches WHERE branch_id = ? AND admin_guid = ? LIMIT 1");
                if ($sel === false) throw new Exception("Prepare failed: " . $conn->error);
                $sel->bind_param("is", $branch_id, $admin_guid);
                $sel->execute();
                $res = $sel->get_result();
                if ($res->num_rows === 1) {
                    $row = $res->fetch_assoc();
                    $currentImage = $row['image_path'];
                } else {
                    throw new Exception("Branch not found");
                }
            }

            // Handle image upload if provided
            $imagePath = $currentImage;
            if (!empty($_FILES['image']['name'])) {
                if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception("Image upload error");
                }
                $tmp = $_FILES['image']['tmp_name'];
                $mime = mime_content_type($tmp);
                if (!in_array($mime, ['image/jpeg', 'image/png', 'image/gif'])) {
                    throw new Exception("Invalid image type");
                }

                $dir = __DIR__ . '/uploads/branches/images/';
                if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
                    throw new Exception("Failed to create upload directory");
                }

                // sanitize filename
                $original = pathinfo($_FILES['image']['name'], PATHINFO_BASENAME);
                $safe = preg_replace('/[^a-zA-Z0-9._-]/', '_', $original);
                $filename = 'img_' . time() . '_' . $safe;
                $imagePathRel = 'uploads/branches/images/' . $filename; // relative path to store in DB
                $target = $dir . $filename;

                if (!move_uploaded_file($tmp, $target)) {
                    throw new Exception("Failed to move uploaded image");
                }

                // remove old image if exists and different
                if ($currentImage && file_exists(__DIR__ . '/' . $currentImage) && $currentImage !== $imagePathRel) {
                    @unlink(__DIR__ . '/' . $currentImage);
                }

                $imagePath = $imagePathRel;
            }

            // Map incoming fields; accept both snake_case and legacy camelCase for compatibility
            $branch_name     = isset($_POST['branch_name']) ? trim($_POST['branch_name']) : (isset($_POST['branchName']) ? trim($_POST['branchName']) : null);
            $branch_code     = isset($_POST['branch_code']) ? trim($_POST['branch_code']) : (isset($_POST['branchCode']) ? trim($_POST['branchCode']) : null);
            $contact_number  = isset($_POST['contact_number']) ? trim($_POST['contact_number']) : (isset($_POST['contactNumber']) ? trim($_POST['contactNumber']) : null);
            $email           = isset($_POST['email']) ? trim($_POST['email']) : null;
            $address         = isset($_POST['address']) ? trim($_POST['address']) : null;
            $city            = isset($_POST['city']) ? trim($_POST['city']) : null;
            $state           = isset($_POST['state']) ? trim($_POST['state']) : null;
            $country         = isset($_POST['country']) ? trim($_POST['country']) : null;
            // accept either is_head_office or legacy isHeadOffice
            $is_head_office  = null;
            if (isset($_POST['is_head_office'])) {
                $is_head_office = intval($_POST['is_head_office']);
            } elseif (isset($_POST['isHeadOffice'])) {
                $is_head_office = intval($_POST['isHeadOffice']);
            } else {
                $is_head_office = 0;
            }

            // Basic validation for required create fields
            if (!$isUpdate) {
                if ($branch_name === null || $branch_name === '') throw new Exception("branch_name is required");
                if ($contact_number === null || $contact_number === '') throw new Exception("contact_number is required");
                if ($address === null || $address === '') throw new Exception("address is required");
            }

            // Prepare fields map for DB (snake_case matching your schema)
            $fields = [
                'admin_guid'    => $admin_guid,
                'branch_name'    => $branch_name,
                'branch_code'    => $branch_code,
                'contact_number' => $contact_number,
                'email'          => $email,
                'address'        => $address,
                'city'           => $city,
                'state'          => $state,
                'country'        => $country,
                'image_path'     => $imagePath,
                'is_head_office' => $is_head_office,
                'isDeleted'      => 0
            ];

            // Build prepared statement data
            $columns = array_keys($fields);
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $types = '';
            $values = [];

            foreach ($fields as $k => $v) {
                // integers: is_head_office, isDeleted
                if ($k === 'is_head_office' || $k === 'isDeleted') {
                    $types .= 'i';
                    $values[] = $v !== null ? intval($v) : 0;
                } else {
                    $types .= 's';
                    $values[] = $v !== null ? (string)$v : '';
                }
            }

            if ($isUpdate) {
                // Build update SET clause
                $setParts = [];
                foreach ($columns as $col) {
                    $setParts[] = "$col = ?";
                }
                $sql = "UPDATE branches SET " . implode(', ', $setParts) . ", modifiedOn = NOW() WHERE branch_id = ? AND admin_guid = ?";
                $stmt = $conn->prepare($sql);
                if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);

                // bind types + branch_id + admin_guid at end
                $types_update = $types . 'is';
                $values_update = array_merge($values, [$branch_id, $admin_guid]);
                $stmt->bind_param($types_update, ...$values_update);
                $stmt->execute();

                if ($stmt->affected_rows === 0) {
                    // could still be success if no change; return success nonetheless
                }

                echo json_encode([
                    "success" => true,
                    "message" => "Branch updated successfully",
                    "image_path" => $imagePath
                ]);
                exit();
            } else {
                // INSERT path
                $cols_sql = implode(', ', $columns);
                // createdOn & modifiedOn handled by NOW() in VALUES
                $sql = "INSERT INTO branches ($cols_sql, createdOn, modifiedOn) VALUES ($placeholders, NOW(), NOW())";
                $stmt = $conn->prepare($sql);
                if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);

                $stmt->bind_param($types, ...$values);
                $stmt->execute();
                $insertedId = $conn->insert_id;

                echo json_encode([
                    "success" => true,
                    "message" => "Branch added successfully",
                    "branch_id" => $insertedId,
                    "image_path" => $imagePath
                ]);
                exit();
            }
        }

        if ($method === 'DELETE') {
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing branch ID"]);
                exit();
            }
            $id = intval($_GET['id']);

            // Soft delete
            $stmt = $conn->prepare("UPDATE branches SET isDeleted = 1, isActive = 0, modifiedOn = NOW() WHERE branch_id = ? AND admin_guid = ?");
            if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param("is", $id, $admin_guid);
            $stmt->execute();

            echo json_encode(["success" => true, "message" => "Branch deleted"]);
            exit();
        }

        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
        exit();
    } catch (Exception $e) {
        error_log("[branches.php] Exception: " . $e->getMessage());
        if (!headers_sent()) header("Content-Type: application/json; charset=UTF-8");
        http_response_code(400);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
        exit();
    }