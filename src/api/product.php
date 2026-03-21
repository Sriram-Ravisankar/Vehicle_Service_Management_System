<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/vendor/autoload.php';
require_once 'config.php'; // must define $conn (mysqli). Optionally define $secret_key here.

$secret_key = $jwt_secret;

// Utility: read Authorization header (case-insensitive)
function get_bearer_token_from_headers() {
    $headers = null;
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = ['Authorization' => $_SERVER['HTTP_AUTHORIZATION']];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = ['Authorization' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION']];
    }
    if (!$headers) return null;
    foreach ($headers as $k => $v) {
        if (strtolower($k) === 'authorization') return $v;
    }
    return null;
}

// Decode JWT and extract admin_guid
$authHeader = get_bearer_token_from_headers();
if (!$authHeader) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authorization header missing']);
    exit;
}
$token = trim(str_ireplace('Bearer', '', $authHeader));

try {
    $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));
    if (!isset($decoded->user_guid)) {
        throw new Exception("Token doesn't contain user_guid");
    }
    
    $tokenGuid = (string)$decoded->user_guid;
    $roleId = $decoded->role_id ?? 0;
    
    // Resolve primary admin GUID for visibility
    $admin_guid = getAdminGuid($conn, $tokenGuid, $roleId);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid token: ' . $e->getMessage()]);
    exit;
}

// Ensure $conn exists
if (!isset($conn) || !($conn instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection ($conn) not found or invalid. Ensure config.php sets $conn (mysqli).']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ---------- POST: Insert or Update ----------
if ($method === 'POST') {
    try {
        // If updating provide id via POST['id']
        $isUpdate = isset($_POST['id']) && !empty($_POST['id']);
        $product_id = $isUpdate ? intval($_POST['id']) : null;

        // If update: verify product belongs to this admin
        if ($isUpdate) {
            $check = $conn->prepare("SELECT image FROM products WHERE id = ? AND admin_guid = ? AND isDeleted = 0");
            $check->bind_param("is", $product_id, $admin_guid);
            $check->execute();
            $res = $check->get_result();
            if ($res->num_rows !== 1) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Unauthorized or product not found']);
                exit;
            }
            $row = $res->fetch_assoc();
            $currentImage = $row['image'];
            $check->close();
        } else {
            $currentImage = null;
        }

        // Handle image upload (optional)
        $imagePath = $currentImage; // default keep existing if any
        if (!empty($_FILES['image']['name'])) {
            if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Image upload error (code {$_FILES['image']['error']})");
            }
            $tmpPath = $_FILES['image']['tmp_name'];
            $mime = @mime_content_type($tmpPath);
            if (!in_array($mime, ['image/jpeg', 'image/png', 'image/gif'], true)) {
                throw new Exception("Invalid image type. Allowed: jpeg, png, gif");
            }
            $dir = __DIR__ . '/uploads/products/images/';
            if (!is_dir($dir)) {
                if (!mkdir($dir, 0755, true)) {
                    throw new Exception("Failed to create image directory");
                }
            }
            // safe filename
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = 'img_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
            $fullPath = $dir . $filename;
            if (!move_uploaded_file($tmpPath, $fullPath)) {
                throw new Exception("Failed to move uploaded file");
            }
            // store relative path from project root (adjust if needed)
            $imagePath = 'uploads/products/images/' . $filename;

            // delete old image file if updating and different
            if ($currentImage && file_exists(__DIR__ . '/' . $currentImage) && $currentImage !== $imagePath) {
                @unlink(__DIR__ . '/' . $currentImage);
            }
        }

        // Prepare fields for insert/update
        // NOTE: For UPDATE we do NOT change admin_guid (keeps owner)
        $productNumber = $_POST['product_number'] ?? null;
        if (!$isUpdate) {
            $stmtNo = $conn->prepare("SELECT product_number FROM products WHERE admin_guid = ? ORDER BY id DESC LIMIT 1");
            $stmtNo->bind_param("s", $admin_guid);
            $stmtNo->execute();
            $resNo = $stmtNo->get_result();
            if ($rowNo = $resNo->fetch_assoc()) {
                if (preg_match("/PRD-(\d+)/", $rowNo["product_number"], $m)) {
                    $next = intval($m[1]) + 1;
                } else {
                    $next = 1;
                }
            } else {
                $next = 1;
            }
            $productNumber = "PRD-" . str_pad($next, 4, "0", STR_PAD_LEFT);
            $stmtNo->close();
        }

        $input = [
            'product_number' => $productNumber,
            'product_name'   => $_POST['product_name'] ?? null,
            'unit'           => $_POST['unit'] ?? null,
            'image'          => $imagePath,
            'purchase_date'  => $_POST['purchase_date'] ?? null,
            'branch'         => $_POST['branch'] ?? null,
            'price'          => isset($_POST['price']) ? $_POST['price'] : null,
            'warranty'       => $_POST['warranty'] ?? null,
            'isActive'       => isset($_POST['isActive']) ? intval($_POST['isActive']) : 1,
            'isDeleted'      => 0
        ];

        if ($isUpdate) {
            // Build SET parts ignoring admin_guid
            $setParts = [];
            $types = '';
            $values = [];
            foreach ($input as $k => $v) {
                $setParts[] = "$k = ?";
                // determine bind type
                if (in_array($k, ['price'], true)) {
                    $types .= 'd';
                    $values[] = ($v !== null && $v !== '') ? floatval($v) : null;
                } elseif (in_array($k, ['isActive', 'isDeleted'], true)) {
                    $types .= 'i';
                    $values[] = ($v !== null && $v !== '') ? intval($v) : null;
                } else {
                    $types .= 's';
                    $values[] = $v;
                }
            }
            // add id param
            $types .= 'i';
            $values[] = $product_id;

            $sql = "UPDATE products SET " . implode(', ', $setParts) . ", modifiedOn = NOW() WHERE id = ? AND admin_guid = ?";
            // we need to bind admin_guid too (string)
            // so append admin_guid param and type
            // But note admin_guid is used in WHERE, so place accordingly.
            // We'll prepare statement with ... WHERE id = ? AND admin_guid = ?
            $stmt = $conn->prepare($sql . " AND 1=1"); // placeholder; we'll reprepare properly below

            // Rebuild SQL and types to include admin_guid
            $sql = "UPDATE products SET " . implode(', ', $setParts) . ", modifiedOn = NOW() WHERE id = ? AND admin_guid = ?";
            $typesWithGuid = $types . 's';
            $values[] = $admin_guid;

            $stmt = $conn->prepare($sql);
            if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);

            // bind dynamically
            $bind_names[] = $typesWithGuid;
            for ($i = 0; $i < count($values); $i++) {
                $bind_names[] = &$values[$i];
            }
            call_user_func_array([$stmt, 'bind_param'], $bind_names);
            $exec = $stmt->execute();
            if ($exec === false) throw new Exception("Execute failed: " . $stmt->error);

            // check affected
            if ($stmt->affected_rows === 0) {
                // either no change or unauthorized; we already checked ownership earlier, so it's likely no change
            }

            $stmt->close();
            echo json_encode(['success' => true, 'message' => 'Product updated', 'image_path' => $imagePath]);
            exit;

        } else {
            // INSERT -> include admin_guid
            $input['admin_guid'] = $admin_guid;
            $columns = array_keys($input);
            $placeholders = implode(',', array_fill(0, count($columns), '?'));

            $types = '';
            $values = [];
            foreach ($input as $k => $v) {
                if (in_array($k, ['price'], true)) {
                    $types .= 'd';
                    $values[] = ($v !== null && $v !== '') ? floatval($v) : null;
                } elseif (in_array($k, ['isActive', 'isDeleted'], true)) {
                    $types .= 'i';
                    $values[] = ($v !== null && $v !== '') ? intval($v) : null;
                } else {
                    $types .= 's';
                    $values[] = $v;
                }
            }

            $sql = "INSERT INTO products (" . implode(', ', $columns) . ", createdOn) VALUES ($placeholders, NOW())";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);

            // dynamic bind
            $bind_names = [];
            $bind_names[] = $types;
            for ($i = 0; $i < count($values); $i++) {
                $bind_names[] = &$values[$i];
            }
            call_user_func_array([$stmt, 'bind_param'], $bind_names);

            $exec = $stmt->execute();
            if ($exec === false) throw new Exception("Execute failed: " . $stmt->error);

            $newProductId = $conn->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Product added', 'id' => $newProductId, 'image_path' => $imagePath]);
            exit;
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ---------- GET: list or single (only for admin_guid) ----------
if ($method === 'GET') {
    try {
        if (isset($_GET['next_product_number'])) {
            $stmtNo = $conn->prepare("SELECT product_number FROM products WHERE admin_guid = ? ORDER BY id DESC LIMIT 1");
            $stmtNo->bind_param("s", $admin_guid);
            $stmtNo->execute();
            $resNo = $stmtNo->get_result();
            if ($rowNo = $resNo->fetch_assoc()) {
                if (preg_match("/PRD-(\d+)/", $rowNo["product_number"], $m)) {
                    $next = intval($m[1]) + 1;
                } else {
                    $next = 1;
                }
            } else {
                $next = 1;
            }
            $productNumber = "PRD-" . str_pad($next, 4, "0", STR_PAD_LEFT);
            $stmtNo->close();
            echo json_encode(['success' => true, 'next_product_number' => $productNumber]);
            exit;
        } elseif (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("SELECT * FROM products WHERE id = ? AND admin_guid = ? AND isDeleted = 0");
            $stmt->bind_param("is", $id, $admin_guid);
            $stmt->execute();
            $res = $stmt->get_result();
            $data = $res->fetch_assoc();
            $stmt->close();
            if ($data) {
                echo json_encode(['success' => true, 'data' => $data]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Product not found or unauthorized']);
            }
            exit;
        } else {
            $sql = "
                SELECT p.*,
                       COALESCE((SELECT SUM(IFNULL(s.quantity_purchased,0) - IFNULL(s.quantity_sold,0)) 
                        FROM stock s 
                        WHERE (s.product_id = p.id OR s.product_name = p.product_name) AND s.admin_guid = p.admin_guid), 0) AS available_stock
                FROM products p
                WHERE p.isDeleted = 0 AND p.admin_guid = ?
                ORDER BY p.createdOn DESC
            ";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) throw new Exception("Prepare failed: " . $conn->error);
            $stmt->bind_param("s", $admin_guid);
            $stmt->execute();
            $res = $stmt->get_result();
            $products = [];
            while ($row = $res->fetch_assoc()) {
                $products[] = $row;
            }
            $stmt->close();
            echo json_encode(['success' => true, 'data' => $products]);
            exit;
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ---------- DELETE: hard delete by ID (only owner) ----------
if ($method === 'DELETE') {
    try {
        parse_str(file_get_contents("php://input"), $deleteVars);
        $id = isset($deleteVars['id']) ? intval($deleteVars['id']) : (isset($_GET['id']) ? intval($_GET['id']) : null);
        if (!$id) throw new Exception("Product ID required for delete");

        // Delete only where admin_guid matches
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ? AND admin_guid = ?");
        $stmt->bind_param("is", $id, $admin_guid);
        $stmt->execute();
        if ($stmt->affected_rows === 0) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Unauthorized or product not found']);
            exit;
        }
        $stmt->close();
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully.']);
        exit;
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// If method not handled
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
exit;