<?php
// purchase_api.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Composer autoload for firebase/php-jwt
require_once __DIR__ . '/vendor/autoload.php';
require_once 'config.php'; // must define $conn (mysqli) and $jwt_secret

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    // CORS preflight
    http_response_code(200);
    exit();
}

/**
 * Safely get Authorization header value (works under many server setups)
 * @return string|null
 */
function getAuthorizationHeader() {
    $headers = null;
    if (function_exists('getallheaders')) {
        $all = getallheaders();
        foreach ($all as $name => $value) {
            // Normalize header name case
            if (strtolower($name) === 'authorization') {
                return $value;
            }
        }
    }

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    return null;
}

/**
 * Decode JWT and return admin_guid
 * @throws Exception on failure
 * @return string admin_guid
 */
function getAdminGUIDFromToken() {
    global $jwt_secret;
    $authHeader = getAuthorizationHeader();
    if (!$authHeader) {
        throw new Exception("Authorization header missing");
    }

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception("Invalid Authorization header format");
    }

    $jwt = $matches[1];

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        // Hide internal JWT errors but return a clean message
        throw new Exception("Invalid or expired token");
    }

    if (!isset($decoded->user_guid)) {
        throw new Exception("admin_guid missing in token");
    }

    return (string)$decoded->user_guid;
}

/**
 * Helper: respond JSON and exit
 */
function respond($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Helper: safe move upload file
 */
function moveUploadedFile($fileField, $dir, $prefix) {
    if (!isset($_FILES[$fileField]) || empty($_FILES[$fileField]['name'])) {
        return null;
    }
    if ($_FILES[$fileField]['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Upload error for {$fileField}");
    }
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        throw new Exception("Failed to create directory: {$dir}");
    }
    $filename = $prefix . time() . '_' . basename($_FILES[$fileField]['name']);
    $path = rtrim($dir, '/') . '/' . $filename;
    if (!move_uploaded_file($_FILES[$fileField]['tmp_name'], $path)) {
        throw new Exception("Failed to move uploaded file: {$fileField}");
    }
    return $path;
}

function generatePurchaseNumber($conn) {
    // Get the highest purchase_no
    $query = "SELECT purchase_no FROM purchases ORDER BY purchase_id DESC LIMIT 1";
    $result = $conn->query($query);

    if ($result && $row = $result->fetch_assoc()) {
        // last number: PUR-0007
        $parts = explode("-", $row['purchase_no']);
        $lastNum = intval($parts[1]); // 7
        $nextNum = str_pad($lastNum + 1, 4, '0', STR_PAD_LEFT);
    } else {
        // No records — start at 0001
        $nextNum = "0001";
    }

    return "PUR-" . $nextNum;
}


// --- POST: Insert or Update Purchase ---
// --- POST: Insert or Update Purchase ---
if ($method === 'POST') {
    try {
        $admin_guid = getAdminGUIDFromToken();

        $isUpdate = isset($_POST['purchase_id']) && !empty($_POST['purchase_id']);
        $purchase_id = $isUpdate ? intval($_POST['purchase_id']) : null;

        // Fetch existing file paths if updating
        $currentImage = null;
        $currentNoteFile = null;

        if ($isUpdate) {
            $stmt = $conn->prepare("SELECT purchase_no, image_path, note_file_path, admin_guid 
                                    FROM purchases 
                                    WHERE purchase_id = ? AND isDeleted = 0");
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param("i", $purchase_id);
            $stmt->execute();
            $res = $stmt->get_result();

            if ($res->num_rows !== 1) throw new Exception("Purchase not found");
            $row = $res->fetch_assoc();

            if ($row['admin_guid'] !== $admin_guid) {
                throw new Exception("Unauthorized: You cannot edit this purchase.");
            }

            // Preserve the ORIGINAL purchase number
            $existingPurchaseNo = $row['purchase_no'];

            $currentImage = $row['image_path'];
            $currentNoteFile = $row['note_file_path'];
            $stmt->close();
        }

        // Image upload
        $imagePath = $currentImage;
        if (!empty($_FILES['image_path']['name'] ?? '')) {
            $newImage = moveUploadedFile('image_path', __DIR__ . '/uploads/purchases/images', 'img_');
            $imagePath = $newImage;

            if ($currentImage && file_exists($currentImage)) {
                @unlink($currentImage);
            }
        }

        // Note file upload
        $noteFilePath = $currentNoteFile;
        if (!empty($_FILES['note_file_path']['name'] ?? '')) {
            $newNote = moveUploadedFile('note_file_path', __DIR__ . '/uploads/purchases/notes', 'note_');
            $noteFilePath = $newNote;

            if ($currentNoteFile && file_exists($currentNoteFile)) {
                @unlink($currentNoteFile);
            }
        }

        // Common fields (insert & update)
        $fields = [
            'supplier'              => $_POST['supplier'] ?? null,
            'purchase_date'         => $_POST['purchase_date'] ?? null,
            'landline_no'           => $_POST['landline_no'] ?? null,
            'mobile_no'             => $_POST['mobile_no'] ?? null,
            'email'                 => $_POST['email'] ?? null,
            'billing_address'       => $_POST['billing_address'] ?? null,
            'branch'                => $_POST['branch'] ?? null,
            'image_path'            => $imagePath,
            'note_text'             => $_POST['note_text'] ?? null,
            'note_file_path'        => $noteFilePath,
            'internal_note'         => isset($_POST['internal_note']) ? intval($_POST['internal_note']) : 0,
            'shared_with_customer'  => isset($_POST['shared_with_customer']) ? intval($_POST['shared_with_customer']) : 0,
            'isActive'              => isset($_POST['isActive']) ? intval($_POST['isActive']) : 1,
            'isDeleted'             => 0
        ];

        // ✅ HANDLE UPDATE
        if ($isUpdate) {

            // IMPORTANT: keep existing purchase_no
            $fields['purchase_no'] = $existingPurchaseNo;

            $setParts = [];
            $types = '';
            $values = [];

            foreach ($fields as $key => $val) {
                $setParts[] = "$key = ?";
                if (in_array($key, ['internal_note', 'shared_with_customer', 'isActive', 'isDeleted'])) {
                    $types .= 'i';
                    $values[] = $val;
                } else {
                    $types .= 's';
                    $values[] = $val ?? '';
                }
            }

            $sql = "UPDATE purchases SET " . implode(', ', $setParts) . ", modifiedOn = NOW() 
                    WHERE purchase_id = ? AND admin_guid = ?";
            $types .= 'is';
            $values[] = $purchase_id;
            $values[] = $admin_guid;

            $stmt = $conn->prepare($sql);
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param($types, ...$values);
            $stmt->execute();

            respond(['success' => true, 'message' => 'Purchase updated successfully']);
        }

        // ✅ HANDLE INSERT
        else {

            // Generate purchase number ONLY once
            $fields['purchase_no'] = generatePurchaseNumber($conn);
            $fields['admin_guid']  = $admin_guid;

            $columns = implode(', ', array_keys($fields));
            $placeholders = implode(', ', array_fill(0, count($fields), '?'));

            $types = '';
            $values = [];

            foreach ($fields as $key => $val) {
                if (in_array($key, ['internal_note', 'shared_with_customer', 'isActive', 'isDeleted'])) {
                    $types .= 'i';
                    $values[] = $val;
                } else {
                    $types .= 's';
                    $values[] = $val ?? '';
                }
            }

            $sql = "INSERT INTO purchases ($columns, createdOn, modifiedOn) 
                    VALUES ($placeholders, NOW(), NOW())";

            $stmt = $conn->prepare($sql);
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param($types, ...$values);
            $stmt->execute();

            $newId = $stmt->insert_id;
            respond(['success' => true, 'message' => 'Purchase created successfully', 'id' => $newId]);
        }

    } catch (Exception $e) {
        respond(['success' => false, 'error' => $e->getMessage()], 400);
    }
}


// --- GET: All or by ID ---
if ($method === 'GET') {
    try {
        $admin_guid = getAdminGUIDFromToken();

        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("
                SELECT p.*, s.supplier_name 
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier = s.supplier_id
                WHERE p.purchase_id = ? AND p.admin_guid = ? AND p.isDeleted = 0
            ");
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param("is", $id, $admin_guid);
            $stmt->execute();
            $res = $stmt->get_result();
            $data = $res->fetch_assoc();
            $stmt->close();

            if (!$data) {
                respond(['success' => false, 'message' => 'Purchase not found or unauthorized'], 404);
            }

            respond(['success' => true, 'data' => $data]);
        } else {
            // Return all purchases for this admin_guid
            // Note: this returns flattened rows including purchase_items; you can change to group by purchase if desired
            $sql = "
                SELECT 
                    p.*, 
                    s.supplier_name, 
                    pi.item_id,
                    pi.product_id,
                    pi.quantity,
                    pi.price AS item_price,
                    pi.amount,
                    pr.product_name,
                    pr.product_number,
                    pr.image,
                    pr.price AS product_price
                FROM purchases p
                LEFT JOIN suppliers s ON p.supplier = s.supplier_id
                LEFT JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
                LEFT JOIN products pr ON pi.product_id = pr.id
                WHERE p.isDeleted = 0 AND p.admin_guid = ?
                ORDER BY p.purchase_id DESC
            ";
            $stmt = $conn->prepare($sql);
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param("s", $admin_guid);
            $stmt->execute();
            $result = $stmt->get_result();

            $purchases = [];
            while ($row = $result->fetch_assoc()) {
                $purchases[] = $row;
            }
            $stmt->close();

            respond(['success' => true, 'data' => $purchases]);
        }
    } catch (Exception $e) {
        respond(['success' => false, 'error' => $e->getMessage()], 400);
    }
}

// --- DELETE: Hard Delete by ID ---
if ($method === 'DELETE') {
    try {
        parse_str(file_get_contents("php://input"), $deleteVars); 
        if (!isset($deleteVars['id']) && !isset($_GET['id'])) {
            throw new Exception("Purchase ID required for delete");
        }
        $id = isset($deleteVars['id']) ? intval($deleteVars['id']) : intval($_GET['id']);

        $admin_guid = getAdminGUIDFromToken();

        // 1️⃣ Delete purchase
        $stmt = $conn->prepare("DELETE FROM purchases WHERE purchase_id = ? AND admin_guid = ?");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param("is", $id, $admin_guid);
        $stmt->execute();

        if ($stmt->affected_rows === 0) {
            throw new Exception("Unauthorized or purchase not found.");
        }

        // 2️⃣ Delete related stock rows
        $stockDelete = $conn->prepare("DELETE FROM stock WHERE purchase_id = ? AND admin_guid = ?");
        $stockDelete->bind_param("is", $id, $admin_guid);
        $stockDelete->execute();

        respond(['success' => true, 'message' => 'Purchase and related stock deleted successfully.']);

    } catch (Exception $e) {
        respond(['success' => false, 'error' => $e->getMessage()], 400);
    }
}


// If method not handled
respond(['success' => false, 'message' => 'Method not allowed'], 405);