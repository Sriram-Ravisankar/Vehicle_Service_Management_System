<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
    }
}

try {
    // Decode token
    $decoded = JWT::decode($token, new Key($jwt_secret, 'HS256'));
    $tokenGuid = $decoded->user_guid ?? null;
    $roleId = $decoded->role_id ?? 0;

    if (!$tokenGuid) {
        echo json_encode(["success" => false, "message" => "Invalid token (no user_guid)"]);
        exit;
    }

    // Resolve primary admin_guid for data visibility
    $admin_guid = getAdminGuid($conn, $tokenGuid, $roleId);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid or expired token"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// // GET admin_guid from token sent by frontend
// $admin_guid = $_GET['admin_guid'] ?? $_POST['admin_guid'] ?? null;

// if (!$admin_guid && $method != 'OPTIONS') {
//     echo json_encode(["success" => false, "message" => "Missing admin_guid"]);
//     exit;
// }

// --- GET: All or single supplier
if ($method === 'GET') {

    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if ($id) {
        // Fetch single supplier belonging to particular admin_guid
        $stmt = $conn->prepare("
            SELECT * FROM suppliers 
            WHERE supplier_id = ? AND admin_guid = ? AND isDeleted = 0
        ");
        $stmt->bind_param("is", $id, $admin_guid);

    } else {
        // Fetch list only for this admin_guid
        $stmt = $conn->prepare("
            SELECT 
                s.*,
                GROUP_CONCAT(p.product_name ORDER BY p.product_name SEPARATOR ', ') AS products
            FROM suppliers s
            LEFT JOIN products p ON s.supplier_id = p.supplier
            WHERE s.admin_guid = ? AND s.isDeleted = 0
            GROUP BY s.supplier_id
            ORDER BY s.createdOn DESC
        ");
        $stmt->bind_param("s", $admin_guid);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $suppliers = [];

    while ($row = $result->fetch_assoc()) {
        $suppliers[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $id ? ($suppliers[0] ?? null) : $suppliers
    ]);
    exit;
}

// --- POST: Insert or Update supplier
if ($method === 'POST') {
    try {
        $isUpdate = isset($_POST['supplier_id']) && !empty($_POST['supplier_id']);
        $supplier_id = $isUpdate ? intval($_POST['supplier_id']) : null;

        $currentImage = null;

        if ($isUpdate) {
            // Ensure supplier belongs to this admin_guid
            $stmt = $conn->prepare("
                SELECT image_path FROM suppliers 
                WHERE supplier_id = ? AND admin_guid = ?
            ");
            $stmt->bind_param("is", $supplier_id, $admin_guid);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows !== 1) {
                throw new Exception("Supplier not found or unauthorized");
            }

            $row = $result->fetch_assoc();
            $currentImage = $row['image_path'];
        }

        // Handle image upload
        $imagePath = $currentImage;
        if (!empty($_FILES['image']['name'])) {
            if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) throw new Exception("Image upload error");

            $mime = mime_content_type($_FILES['image']['tmp_name']);
            if (!in_array($mime, ['image/jpeg', 'image/png', 'image/gif'])) {
                throw new Exception("Invalid image type");
            }

            $dir = 'uploads/suppliers/images/';
            if (!is_dir($dir)) mkdir($dir, 0755, true);

            $imagePath = $dir . 'img_' . time() . '_' . basename($_FILES['image']['name']);
            move_uploaded_file($_FILES['image']['tmp_name'], $imagePath);

            if ($currentImage && file_exists($currentImage) && $currentImage !== $imagePath) {
                unlink($currentImage);
            }
        }

        // Supplier table fields
        $fields = [
            'admin_guid'       => $admin_guid,  // ALWAYS associate with logged in user
            'supplier_name'    => $_POST['supplier_name'] ?? null,
            'company_name'     => $_POST['company_name'] ?? null,
            'email'            => $_POST['email'] ?? null,
            'mobile_no'        => $_POST['mobile_no'] ?? null,
            'landline_no'      => $_POST['landline_no'] ?? null,
            'gender'           => $_POST['gender'] ?? null,
            'image_path'       => $imagePath,
            'gstin'            => $_POST['gstin'] ?? null,
            'country'          => $_POST['country'] ?? null,
            'state'            => $_POST['state'] ?? null,
            'city'             => $_POST['city'] ?? null,
            'address'          => $_POST['address'] ?? null,
            'bank_name'        => $_POST['bank_name'] ?? null,
            'account_number'   => $_POST['account_number'] ?? null,
            'ifsc_code'        => $_POST['ifsc_code'] ?? null,
            'isActive'         => isset($_POST['isActive']) ? intval($_POST['isActive']) : 1,
            'isDeleted'        => 0
        ];

        $setParts = [];
        $columns = [];
        $placeholders = [];
        $types = '';
        $values = [];

        foreach ($fields as $key => $val) {
            if ($isUpdate && $key === "admin_guid") continue; // prevent admin_guid change

            $setParts[] = "$key = ?";
            $columns[] = $key;
            $placeholders[] = '?';

            $types .= is_int($val) ? 'i' : 's';
            $values[] = $val;
        }

        if ($isUpdate) {
            $sql = "UPDATE suppliers SET " . implode(', ', $setParts) . ", modifiedOn = NOW()
                    WHERE supplier_id = ? AND admin_guid = ?";
            $types .= "is";
            $values[] = $supplier_id;
            $values[] = $admin_guid;
        } else {
            $sql = "INSERT INTO suppliers (" . implode(', ', $columns) . ") 
                    VALUES (" . implode(', ', $placeholders) . ")";
        }

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => $isUpdate ? 'Supplier updated successfully' : 'Supplier added successfully',
            'image_path' => $imagePath
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}


// --- DELETE: Soft Delete supplier 
if ($method === 'DELETE') {

    if (!isset($_GET['id'])) {
        echo json_encode(["success" => false, "message" => "Missing supplier ID"]);
        exit;
    }

    $id = intval($_GET['id']);

    $stmt = $conn->prepare("
        UPDATE suppliers SET isDeleted = 1
        WHERE supplier_id = ? AND admin_guid = ?
    ");
    $stmt->bind_param("is", $id, $admin_guid);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Supplier deleted successfully (soft delete)"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
exit;

