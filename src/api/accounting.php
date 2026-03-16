<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once "./config.php";
require_once "./middleware.php";

// Initialize tables if they don't exist
$sql_init = [
    "CREATE TABLE IF NOT EXISTS tax_rates (
        tax_guid VARCHAR(50) PRIMARY KEY,
        admin_guid VARCHAR(50) NOT NULL,
        tax_name VARCHAR(100) NOT NULL,
        tax_rate DECIMAL(10, 2) NOT NULL,
        tax_number VARCHAR(50),
        isDeleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS payment_methods (
        method_guid VARCHAR(50) PRIMARY KEY,
        admin_guid VARCHAR(50) NOT NULL,
        method_name VARCHAR(100) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        isDeleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS income (
        income_guid VARCHAR(50) PRIMARY KEY,
        admin_guid VARCHAR(50) NOT NULL,
        invoice_no VARCHAR(50),
        main_label VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        outstanding_amount DECIMAL(15, 2) DEFAULT 0,
        payment_type VARCHAR(50),
        branch VARCHAR(100),
        isDeleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS income_items (
        item_guid VARCHAR(50) PRIMARY KEY,
        income_guid VARCHAR(50) NOT NULL,
        label VARCHAR(255),
        value VARCHAR(255)
    )",
    "CREATE TABLE IF NOT EXISTS expenses (
        expense_guid VARCHAR(50) PRIMARY KEY,
        admin_guid VARCHAR(50) NOT NULL,
        main_label VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        total_amount DECIMAL(15, 2) DEFAULT 0,
        branch VARCHAR(100),
        isDeleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS expense_items (
        item_guid VARCHAR(50) PRIMARY KEY,
        expense_guid VARCHAR(50) NOT NULL,
        label VARCHAR(255),
        amount DECIMAL(15, 2)
    )"
];

foreach ($sql_init as $query) {
    if (!$conn->query($query)) {
        // Log error or handle it silently if tables exist
    }
}

// Token validation
$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$validation = validateJWTAndGetGuid($token);
if (!$validation['success']) {
    http_response_code($validation['code'] ?? 401);
    echo json_encode(["error" => $validation['error']]);
    exit;
}

$userGuid = $validation['data']->user_guid;
// Get admin_guid
$adminSql = "SELECT admin_guid FROM users WHERE user_guid = '$userGuid'";
$adminRes = $conn->query($adminSql);
$adminRow = $adminRes->fetch_assoc();
$adminGuid = $adminRow['admin_guid'] ?? $userGuid; // Fallback to userGuid if admin not found (e.g. they are admin)

$type = $_GET['type'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function generateGuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

if ($type === 'tax_rates') {
    if ($method === 'GET') {
        $sql = "SELECT tax_guid as id, tax_name as accountTaxName, tax_rate, tax_number FROM tax_rates WHERE admin_guid = '$adminGuid' AND isDeleted = FALSE";
        $res = $conn->query($sql);
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        echo json_encode($data);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $guid = $data['id'] ?? generateGuid();
        $name = $conn->real_escape_string($data['accountTaxName']);
        $rate = (float)$data['tax_rate'];
        $number = $conn->real_escape_string($data['tax_number']);

        $sql = "INSERT INTO tax_rates (tax_guid, admin_guid, tax_name, tax_rate, tax_number) 
                VALUES ('$guid', '$adminGuid', '$name', $rate, '$number')
                ON DUPLICATE KEY UPDATE tax_name='$name', tax_rate=$rate, tax_number='$number'";
        if ($conn->query($sql)) echo json_encode(["success" => true, "id" => $guid]);
        else echo json_encode(["success" => false, "error" => $conn->error]);
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $sql = "UPDATE tax_rates SET isDeleted = TRUE WHERE tax_guid = '$id' AND admin_guid = '$adminGuid'";
        $conn->query($sql);
        echo json_encode(["success" => true]);
    }
} elseif ($type === 'payment_methods') {
    if ($method === 'GET') {
        $sql = "SELECT method_guid as id, method_name as paymentType FROM payment_methods WHERE admin_guid = '$adminGuid' AND isDeleted = FALSE";
        $res = $conn->query($sql);
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        echo json_encode($data);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $guid = $data['id'] ?? generateGuid();
        $name = $conn->real_escape_string($data['paymentType']);

        $sql = "INSERT INTO payment_methods (method_guid, admin_guid, method_name) 
                VALUES ('$guid', '$adminGuid', '$name')
                ON DUPLICATE KEY UPDATE method_name='$name'";
        if ($conn->query($sql)) echo json_encode(["success" => true, "id" => $guid]);
        else echo json_encode(["success" => false, "error" => $conn->error]);
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $sql = "UPDATE payment_methods SET isDeleted = TRUE WHERE method_guid = '$id' AND admin_guid = '$adminGuid'";
        $conn->query($sql);
        echo json_encode(["success" => true]);
    }
} elseif ($type === 'income') {
    if ($method === 'GET') {
        $sql = "SELECT income_guid as id, invoice_no as invoice, main_label, date, status, outstanding_amount as outstandingAmount, payment_type as paymentType, branch FROM income WHERE admin_guid = '$adminGuid' AND isDeleted = FALSE";
        $res = $conn->query($sql);
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $guid = $row['id'];
            $itemsSql = "SELECT label as incomeEntry, value as incomeLabel FROM income_items WHERE income_guid = '$guid'";
            $itemsRes = $conn->query($itemsSql);
            $items = [];
            while ($item = $itemsRes->fetch_assoc()) $items[] = $item;
            $row['incomeFields'] = $items;
            $data[] = $row;
        }
        echo json_encode($data);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $guid = $data['id'] ?? generateGuid();
        $invoice = $conn->real_escape_string($data['invoice'] ?? '');
        $label = $conn->real_escape_string($data['mainLabel'] ?? '');
        $date = $conn->real_escape_string($data['date'] ?? '');
        $status = $conn->real_escape_string($data['status'] ?? '');
        $amount = (float)($data['outstandingAmount'] ?? 0);
        $ptype = $conn->real_escape_string($data['paymentType'] ?? '');
        $branch = $conn->real_escape_string($data['branch'] ?? '');

        $sql = "INSERT INTO income (income_guid, admin_guid, invoice_no, main_label, date, status, outstanding_amount, payment_type, branch) 
                VALUES ('$guid', '$adminGuid', '$invoice', '$label', '$date', '$status', $amount, '$ptype', '$branch')
                ON DUPLICATE KEY UPDATE invoice_no='$invoice', main_label='$label', date='$date', status='$status', outstanding_amount=$amount, payment_type='$ptype', branch='$branch'";
        
        if ($conn->query($sql)) {
            $conn->query("DELETE FROM income_items WHERE income_guid = '$guid'");
            if (isset($data['incomeFields'])) {
                foreach ($data['incomeFields'] as $item) {
                    $itemGuid = generateGuid();
                    $iLabel = $conn->real_escape_string($item['incomeEntry']);
                    $iValue = $conn->real_escape_string($item['incomeLabel']);
                    $conn->query("INSERT INTO income_items (item_guid, income_guid, label, value) VALUES ('$itemGuid', '$guid', '$iLabel', '$iValue')");
                }
            }
            echo json_encode(["success" => true, "id" => $guid]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $sql = "UPDATE income SET isDeleted = TRUE WHERE income_guid = '$id' AND admin_guid = '$adminGuid'";
        $conn->query($sql);
        echo json_encode(["success" => true]);
    }
} elseif ($type === 'expenses') {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
             // Detail view logic
        }
        $sql = "SELECT expense_guid as id, main_label, date, status, total_amount as totalAmount, branch FROM expenses WHERE admin_guid = '$adminGuid' AND isDeleted = FALSE";
        $res = $conn->query($sql);
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $guid = $row['id'];
            $itemsSql = "SELECT label as expenseLabel, amount as expenseAmount FROM expense_items WHERE expense_guid = '$guid'";
            $itemsRes = $conn->query($itemsSql);
            $items = [];
            while ($item = $itemsRes->fetch_assoc()) $items[] = $item;
            $row['expenses'] = $items;
            $data[] = $row;
        }
        echo json_encode($data);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $guid = $data['id'] ?? generateGuid();
        $label = $conn->real_escape_string($data['mainLabel'] ?? '');
        $date = $conn->real_escape_string($data['date'] ?? '');
        $status = $conn->real_escape_string($data['status'] ?? '');
        $branch = $conn->real_escape_string($data['branch'] ?? '');
        
        // Calculate total amount from items if not provided
        $total = 0;
        if (isset($data['expenses'])) {
            foreach ($data['expenses'] as $item) $total += (float)$item['expenseAmount'];
        }

        $sql = "INSERT INTO expenses (expense_guid, admin_guid, main_label, date, status, total_amount, branch) 
                VALUES ('$guid', '$adminGuid', '$label', '$date', '$status', $total, '$branch')
                ON DUPLICATE KEY UPDATE main_label='$label', date='$date', status='$status', total_amount=$total, branch='$branch'";
        
        if ($conn->query($sql)) {
            $conn->query("DELETE FROM expense_items WHERE expense_guid = '$guid'");
            if (isset($data['expenses'])) {
                foreach ($data['expenses'] as $item) {
                    $itemGuid = generateGuid();
                    $eLabel = $conn->real_escape_string($item['expenseLabel']);
                    $eAmount = (float)$item['expenseAmount'];
                    $conn->query("INSERT INTO expense_items (item_guid, expense_guid, label, amount) VALUES ('$itemGuid', '$guid', '$eLabel', $eAmount)");
                }
            }
            echo json_encode(["success" => true, "id" => $guid]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $sql = "UPDATE expenses SET isDeleted = TRUE WHERE expense_guid = '$id' AND admin_guid = '$adminGuid'";
        $conn->query($sql);
        echo json_encode(["success" => true]);
    }
}
?>
