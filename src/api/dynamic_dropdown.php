<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// JWT DECODE & ADMIN RESOLVE
$headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
$token = null;
if (isset($headers['Authorization']) && preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
    $token = $matches[1];
}

$admin_guid = null;
if ($token) {
    try {
        $decoded = JWT::decode($token, new Key($jwt_secret, 'HS256'));
        $decoded = (array) $decoded;
        $user_guid = $decoded['user_guid'] ?? null;
        $role_id = isset($decoded['role_id']) ? (int) $decoded['role_id'] : null;

        if ($user_guid && $role_id !== null) {
            if ($role_id === 1) {
                $admin_guid = $user_guid;
            } else {
                $stmt = $conn->prepare("SELECT admin_guid FROM users WHERE user_guid = ? AND isDeleted = 0 LIMIT 1");
                $stmt->bind_param("s", $user_guid);
                $stmt->execute();
                $res = $stmt->get_result();
                if ($row = $res->fetch_assoc()) {
                    $admin_guid = $row['admin_guid'];
                }
            }
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["status" => false, "message" => "Invalid Token"]);
        exit;
    }
}

if (!$admin_guid) {
    http_response_code(401);
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if (!isset($_GET['table']) || empty($_GET['table'])) {
    echo json_encode(["status" => false, "message" => "Table name is required"]);
    exit;
}

$table = preg_replace("/[^a-zA-Z0-9_]/", "", $_GET['table']); // sanitize table name
$todo = isset($_GET['todo']) ? $_GET['todo'] : '';
$user_type = isset($_GET['usertype']) ? $_GET['usertype'] : '';

// Get JSON input for POST requests
$input = json_decode(file_get_contents('php://input'), true);
if ($method === 'POST' && empty($input)) {
    $input = $_POST;
}

// --- MAIN ROUTES ---
switch ($method) {
    case 'GET':
        if ($todo === 'dropdown') {
            $columns = isset($_GET['columns']) ? $_GET['columns'] : '*';
            getDropdownValues($table, $columns);
        } elseif (isset($_GET['id'])) {
            getRecordById($table, $_GET['id']);
        } else {
            getAllRecords($table);
        }
        break;

    case 'POST':
        if ($todo === 'update') {
            updateRecord($table, $input);
        } else {
            createRecord($table, $input);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteRecord($table, $_GET['id']);
        }
        break;

    default:
        echo json_encode(["status" => false, "message" => "Invalid Request"]);
}

// --- FUNCTIONS ---
function getAllRecords($table)
{
    global $conn, $user_type, $admin_guid;
    $allowedCols = getTableColumns($table);
    $where = "(isDeleted IS NULL OR isDeleted = 0)";
    if (in_array('admin_guid', $allowedCols) && $admin_guid) {
        $where .= " AND admin_guid = '$admin_guid'";
    }
    if (!empty($user_type)) {
        $where .= " AND user_type = '" . $conn->real_escape_string($user_type) . "'";
    }
    $sql = "SELECT * FROM `$table` WHERE $where";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

function getRecordById($table, $id)
{
    global $conn, $user_type, $admin_guid;
    $allowedCols = getTableColumns($table);
    $where = "(isDeleted IS NULL OR isDeleted = 0)";
    if (in_array('admin_guid', $allowedCols) && $admin_guid) {
        $where .= " AND admin_guid = '$admin_guid'";
    }
    if (!empty($user_type)) {
        $where .= " AND user_type = '" . $conn->real_escape_string($user_type) . "'";
    }
    $stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ? AND $where");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
}

function getDropdownValues($table, $columns)
{
    global $conn, $user_type;

    // Get allowed columns for the table
    $allowedCols = getTableColumns($table);

    // Process requested columns
    $cols = array_map('trim', explode(',', $columns));
    $validCols = array_intersect($cols, $allowedCols);

    // If no valid columns were requested or found, use default columns
    if (empty($validCols)) {
        if ($table === "branches") {
            $validCols = ["branch_id", "branch_name"];
        } elseif ($table === "repair_category") {
            $validCols = ["id", "Name"];
        } elseif ($table === "vehicles") {
            $validCols = ["vehicle_guid", "make", "model", "registration_number"];
        } else {
            $validCols = ["id"];
        }
    }


    // Build WHERE clause
    $where = "(isDeleted IS NULL OR isDeleted = 0) AND (isActive IS NULL OR isActive = 1)";

    // organization level filtering
    global $admin_guid;
    if (in_array('admin_guid', $allowedCols) && $admin_guid) {
        $where .= " AND admin_guid = '$admin_guid'";
    }

    // NEW: filter vehicles by user_guid (owner)
    if ($table === "vehicles" && isset($_GET['user_guid'])) {
        $user_owner_guid = $conn->real_escape_string($_GET['user_guid']);
        $where .= " AND user_guid = '$user_owner_guid'";
    }

    if (!empty($user_type)) {
        $where .= " AND user_type = '" . $conn->real_escape_string($user_type) . "'";
    }

    // Prepare and execute query
    $sql = "SELECT " . implode(", ", $validCols) . " FROM `$table` WHERE $where";
    $result = $conn->query($sql);

    // Return all rows with all requested columns
    if ($result) {
        $data = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data);
    } else {
        echo json_encode(["error" => "Database query failed"]);
    }
}

function createRecord($table, $data)
{
    global $conn;

    // Validate input data
    if (empty($data)) {
        echo json_encode(["status" => false, "message" => "No data provided"]);
        return;
    }

    // Filter out empty values
    $data = array_filter($data, function ($value) {
        return $value !== null && $value !== '';
    });

    if (empty($data)) {
        echo json_encode(["status" => false, "message" => "No valid data provided"]);
        return;
    }

    $columns = array_keys($data);
    $values = array_values($data);
    $placeholders = implode(',', array_fill(0, count($columns), '?'));
    $types = str_repeat('s', count($columns)); // treat all as string for simplicity

    try {
        $stmt = $conn->prepare("INSERT INTO `$table` (" . implode(',', $columns) . ") VALUES ($placeholders)");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param($types, ...$values);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        echo json_encode([
            "status" => true,
            "message" => "Record Created",
            "id" => $stmt->insert_id
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "status" => false,
            "message" => "Error: " . $e->getMessage()
        ]);
    }
}

function updateRecord($table, $data)
{
    global $conn;

    if (!isset($data['id']) || empty($data['id'])) {
        echo json_encode(["status" => false, "message" => "ID is required for update"]);
        return;
    }

    $id = $data['id'];
    unset($data['id']);

    // Filter out empty values
    $data = array_filter($data, function ($value) {
        return $value !== null && $value !== '';
    });

    if (empty($data)) {
        echo json_encode(["status" => false, "message" => "No valid data provided for update"]);
        return;
    }

    $columns = array_keys($data);
    $set = implode(',', array_map(fn($col) => "$col = ?", $columns));
    $types = str_repeat('s', count($columns)) . 'i';

    try {
        $stmt = $conn->prepare("UPDATE `$table` SET $set, modifiedOn = NOW() WHERE id = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $params = array_merge(array_values($data), [$id]);
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        echo json_encode(["status" => true, "message" => "Record Updated"]);
    } catch (Exception $e) {
        echo json_encode([
            "status" => false,
            "message" => "Error: " . $e->getMessage()
        ]);
    }
}

function deleteRecord($table, $id)
{
    global $conn;
    try {
        // Soft delete
        $stmt = $conn->prepare("UPDATE `$table` SET isDeleted = 1, modifiedOn = NOW() WHERE id = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        echo json_encode(["status" => true, "message" => "Record Deleted"]);
    } catch (Exception $e) {
        echo json_encode([
            "status" => false,
            "message" => "Error: " . $e->getMessage()
        ]);
    }
}

function getTableColumns($table)
{
    global $conn;
    $result = $conn->query("SHOW COLUMNS FROM `$table`");
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row['Field'];
    }
    return $columns;
}