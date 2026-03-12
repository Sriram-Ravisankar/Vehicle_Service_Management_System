<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


// --- Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'config.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// --- JWT Auth
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token missing or invalid']);
    exit;
}

$jwt = $matches[1];
try {
    $decoded = JWT::decode($jwt, new Key($jwt_secret, $jwt_algorithm));
    $userGuid = $decoded->user_guid ?? null;
    if (!$userGuid) {
        throw new Exception("Invalid token: user_guid missing");
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token decode failed: ' . $e->getMessage()]);
    exit;
}

// --- GET: Fetch Profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT userName, email, phone_number, address, city_id, state_id, pincode, profile_image, isActive 
                            FROM profile_crud 
                            WHERE user_guid = ? AND isdeleted = 0");
    $stmt->bind_param("s", $userGuid);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
    } else {
        echo json_encode(['success' => true, 'data' => $result->fetch_assoc()]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

// --- POST: Update Profile + Image Upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $stmt = $conn->prepare("SELECT profile_image FROM profile_crud WHERE user_guid = ?");
        $stmt->bind_param("s", $userGuid);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows !== 1) {
            throw new Exception("User not found");
        }
        $existingData = $result->fetch_assoc();
        $currentImg = $existingData['profile_image'];
        $newImgPath = $currentImg;

$input = json_decode(file_get_contents("php://input"), true) ?? [];



$newImgPath = $currentImg;

$newImgPath = $currentImg;

if (
    isset($input['profile_image']) &&
    is_string($input['profile_image']) &&
    str_starts_with($input['profile_image'], 'data:image/')
) {
    if (!preg_match('/^data:image\/(png|jpg|jpeg|gif);base64,/', $input['profile_image'], $matches)) {
        throw new Exception("Invalid image format");
    }

    $extension = $matches[1];

    $imageData = base64_decode(
        substr($input['profile_image'], strpos($input['profile_image'], ',') + 1)
    );

    if ($imageData === false) {
        throw new Exception("Base64 decode failed");
    }

    if (strlen($imageData) > 2 * 1024 * 1024) {
        throw new Exception("Image size exceeds 2MB");
    }

    $dir = "uploads/profile/";
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    $filename = "profile_{$userGuid}_" . time() . ".{$extension}";
    $filepath = $dir . $filename;

    file_put_contents($filepath, $imageData);

    if ($currentImg && file_exists($currentImg)) {
        unlink($currentImg);
    }

    $newImgPath = $filepath;
}



        // Gather fields
        $fields = [
            'userName'      => $input['userName'] ?? null,
            'email'         => $input['email'] ?? null,
            'phone_number'  => $input['phone_number'] ?? null,
            'address'       => $input['address'] ?? null,
            'state_id'      => $input['state_id'] ?? null,
            'city_id'       => $input['city_id'] ?? null,
            'pincode'       => $input['pincode'] ?? null,
            'isActive'      => $input['isActive'] ?? 1,
        ];

        $fields = array_filter($fields, fn($v) => !is_null($v));
        if (empty($fields)) throw new Exception("No fields provided");

        // Build dynamic query
        $setParts = [];
        $types = '';
        $values = [];

        foreach ($fields as $key => $val) {
            $setParts[] = "$key = ?";
            $types .= is_int($val) ? 'i' : 's';
            $values[] = $val;
        }

        if ($newImgPath !== $currentImg) {
    $setParts[] = "profile_image = ?";
    $types .= 's';
    $values[] = $newImgPath;
}


        $sql = "UPDATE profile_crud 
                SET " . implode(', ', $setParts) . ", modifiedOn = NOW() 
                WHERE user_guid = ?";
        $types .= 's';
        $values[] = $userGuid;

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        if (!$stmt->execute()) throw new Exception("Update failed: " . $stmt->error);


        echo json_encode([
    'success' => true,
    'message' => 'Updated successfully',
    'profile_image' => $newImgPath
]);


    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }

    $conn->close();
    exit;
}

// --- Default: Method Not Allowed
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
