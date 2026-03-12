<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'config.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Read Input
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Validation
$errors = [];
if (!$email) $errors[] = "Email is required";
if (!$password) $errors[] = "Password is required";

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Check login in profile_crud (roles now stored here)
$stmt = $conn->prepare("
    SELECT *
    FROM profile_crud
    WHERE email = ? AND isActive = 1 AND isDeleted = 0
    LIMIT 1
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or account not found']);
    exit;
}

$loginData = $result->fetch_assoc();
$stmt->close();

// Verify Password
if (!password_verify($password, $loginData['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Incorrect password']);
    exit;
}

// *******************************
// ROLE + PERMISSIONS LOGIC HERE
// *******************************
$role_id = $loginData['role_id'] ?? null;
$roleName = null;
$permissionsArr = [];

// Fetch role name
if ($role_id) {
    $roleQuery = $conn->query("SELECT role_name FROM roles WHERE id = $role_id LIMIT 1");
    if ($roleQuery && $roleQuery->num_rows > 0) {
        $roleRow = $roleQuery->fetch_assoc();
        $roleName = $roleRow['role_name'];
    }
}

// Fetch permissions for the role
if ($role_id) {
    $permQuery = $conn->query("
        SELECT p.permission_name
        FROM role_permissions rp
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = $role_id
    ");

    while ($row = $permQuery->fetch_assoc()) {
        $permissionsArr[] = $row["permission_name"];
    }
}

// Fetch user basic info from users table
$stmt = $conn->prepare("SELECT id, first_name, last_name FROM users WHERE user_guid = ? LIMIT 1");
$stmt->bind_param("s", $loginData['user_guid']);
$stmt->execute();
$userInfo = $stmt->get_result()->fetch_assoc();
$stmt->close();

// *******************************
// PREPARE JWT PAYLOAD
// *******************************
$payload = [
    'iat' => time(),
    'exp' => time() + (3600 * 24), // 1 day
    'user_guid' => $loginData['user_guid'],
    'email' => $loginData['email'],
    'userName' => $loginData['userName'],
    'first_name' => $userInfo['first_name'] ?? null,
    'last_name'  => $userInfo['last_name']  ?? null,
    'role_id' => $role_id,
    'role_name' => $roleName,
    'permissions' => $permissionsArr
];

// Generate JWT
$jwt = JWT::encode($payload, $jwt_secret, $jwt_algorithm);

// Return response
echo json_encode([
    'success' => true,
    'token' => $jwt,
    'user' => $payload
]);

$conn->close();
?>
