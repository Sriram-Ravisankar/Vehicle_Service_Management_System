<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception("Invalid request method.");

    $action = $_POST['action'] ?? null;
    $table = $_POST['table'] ?? null;

    if (!$action || !$table) throw new Exception("Missing action or table.");

    // ✅ Whitelist allowed tables (IMPORTANT for security)
    $allowedTables = ['suppliers', 'products', 'purchases']; // add as needed
    if (!in_array($table, $allowedTables)) throw new Exception("Invalid table name.");

   // ✅ Whitelist and map allowed tables and primary keys
$allowedTables = ['suppliers', 'products', 'purchases'];
$primaryKeys = [
    'suppliers' => 'supplier_id',
    'products' => 'id',
    'purchases' => 'purchase_id'
];

if (!in_array($table, $allowedTables)) throw new Exception("Invalid table name.");
$primaryKey = $primaryKeys[$table] ?? null;
if (!$primaryKey) throw new Exception("Unknown primary key for table: $table");


    $note_text = $_POST['note_text'] ?? null;
    $internal_note = isset($_POST['internal_note']) ? 1 : 0;
    $shared_with_customer = isset($_POST['shared_with_customer']) ? 1 : 0;

    $dir = "uploads/$table/notes/";
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    // Handle file upload
    $noteFilePath = null;
    if (!empty($_FILES['note_file']['name'])) {
        if ($_FILES['note_file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Note file upload error");
        }
        $noteFilePath = $dir . 'note_' . time() . '_' . basename($_FILES['note_file']['name']);
        move_uploaded_file($_FILES['note_file']['tmp_name'], $noteFilePath);
    }

    // 👉 INSERT
    if ($action === 'insert') {
        $stmt = $conn->prepare("INSERT INTO `$table` (note_text, note_file_path, internal_note, shared_with_customer, createdOn) VALUES (?, ?, ?, ?, NOW())");
        $stmt->bind_param("ssii", $note_text, $noteFilePath, $internal_note, $shared_with_customer);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Inserted successfully', 'id' => $stmt->insert_id]);
    }

    // 👉 UPDATE
    elseif ($action === 'update') {
        $id = $_POST['id'] ?? null;
        if (!$id) throw new Exception("Missing ID for update");
         $internal_note = isset($_POST['internal_note']) ? (int)$_POST['internal_note'] : 0;
        $shared_with_customer = isset($_POST['shared_with_customer']) ? (int)$_POST['shared_with_customer'] : 0;

        // Fetch existing note file
        $stmt = $conn->prepare("SELECT note_file_path FROM `$table` WHERE `$primaryKey` = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows !== 1) throw new Exception("Record not found");

        $row = $result->fetch_assoc();
        $existingPath = $row['note_file_path'];

        if ($noteFilePath && $existingPath && file_exists($existingPath)) {
            unlink($existingPath);
        }

        if (!$noteFilePath) $noteFilePath = $existingPath;

        $stmt = $conn->prepare("UPDATE `$table` SET note_text = ?, note_file_path = ?, internal_note = ?, shared_with_customer = ?, modifiedOn = NOW() WHERE `$primaryKey` = ?");
        $stmt->bind_param("ssiii", $note_text, $noteFilePath, $internal_note, $shared_with_customer, $id);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Updated successfully']);
    }

    // 👉 DELETE
    elseif ($action === 'delete') {
        $id = $_POST['id'] ?? null;
        if (!$id) throw new Exception("Missing ID for delete");

        $stmt = $conn->prepare("SELECT note_file_path FROM `$table` WHERE `$primaryKey` = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows !== 1) throw new Exception("Record not found");

        $row = $result->fetch_assoc();
        if (!empty($row['note_file_path']) && file_exists($row['note_file_path'])) {
            unlink($row['note_file_path']);
        }

        $stmt = $conn->prepare("DELETE FROM `$table` WHERE `$primaryKey` = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Deleted successfully']);
    }

    else {
        throw new Exception("Invalid action value");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
