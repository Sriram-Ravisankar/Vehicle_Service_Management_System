<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Invalid request method. Use POST"]);
    exit;
}

function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    // Only require essential fields
    // $requiredFields = ['userName', 'email', 'phone_number', 'password', 'address', 'city', 'state', 'pincode'];
    $user_guid = generateUUID();
    $requiredFields = ['userName', 'email',  'password'];
    $missingFields = [];
    
    // Get JSON input if Content-Type is application/json
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $_POST = array_merge($_POST, $input);
    }

    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        throw new Exception("Missing required fields: " . implode(', ', $missingFields));
    }

    // Sanitize input
    $userName = $conn->real_escape_string($_POST['userName']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role_id = isset($_POST['role_id']) ? intval($_POST['role_id']) : null;
    // $phone_number = $conn->real_escape_string($_POST['phone_number']);
    // $address = $conn->real_escape_string($_POST['address']);
    // $city = $conn->real_escape_string($_POST['city']);
    // $state = $conn->real_escape_string($_POST['state']);
    // $pincode = $conn->real_escape_string($_POST['pincode']);

    // Handle image upload
    $profile_image = null;
    if (!empty($_FILES['profile_image']['name'])) {
        $file = $_FILES['profile_image'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Image upload error: " . $file['error']);
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileType = mime_content_type($file['tmp_name']);
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception("Only JPG, PNG, and GIF images are allowed");
        }

        if ($file['size'] > 2 * 1024 * 1024) {
            throw new Exception("Image exceeds 2MB size limit");
        }

        $uploadDir = 'uploads/jobposters/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'poster_' . uniqid() . '.' . $ext;
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception("Failed to save uploaded image");
        }

        $profile_image = $targetPath;
    }

    // Use DEFAULT values for these fields as defined in your table
    $isActive = 1;
    $isDeleted = 0;
    $createdOn = date('Y-m-d H:i:s');
    $modifiedOn = $createdOn;

    // Check for existing email
    $emailCheck = $conn->prepare("SELECT email FROM profile_crud WHERE email = ?");
    $emailCheck->bind_param("s", $email);
    $emailCheck->execute();
    $emailCheck->store_result();

    if ($emailCheck->num_rows > 0) {
    throw new Exception("Email already exists");
    }
    $emailCheck->close();

    $sql = "INSERT INTO profile_crud (
    user_guid, role_id, userName, email, password, phone_number, address, state_id, city_id, pincode, 
    profile_image, isActive, isDeleted, createdOn, modifiedOn
    ) VALUES (
    '$user_guid','$role_id','$userName', '$email', '$password', 
    NULL, NULL, NULL, NULL, NULL, 
    " . ($profile_image ? "'$profile_image'" : "NULL") . ",
    $isActive, $isDeleted, '$createdOn', '$modifiedOn'
    )";



    if ($conn->query($sql)) {
        echo json_encode([
            "success" => true
        ]);
    } else {
        throw new Exception("Database error: " . $conn->error);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>