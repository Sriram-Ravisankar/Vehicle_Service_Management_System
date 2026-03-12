<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

require_once "config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/* -----------------------------------------------------
    Decode Token
----------------------------------------------------- */
function decode_token($token, $secret) {
    try {
        return (array) JWT::decode($token, new Key($secret, 'HS256'));
    } catch (Exception $e) {
        return null;
    }
}

$headers = function_exists("apache_request_headers") ? apache_request_headers() : [];
$token   = isset($headers["Authorization"]) ? str_replace("Bearer ", "", $headers["Authorization"]) : "";

$decoded = $token ? decode_token($token, $jwt_secret) : null;

$user_guid = $decoded["user_guid"] ?? null;
$admin_guid = null;

if ($user_guid) {
    if (isset($decoded["role_id"]) && $decoded["role_id"] == 1) {
        $admin_guid = $user_guid;
    } else {
        $userGuidEscaped = $conn->real_escape_string($user_guid);
        $result = $conn->query("
            SELECT admin_guid 
            FROM users
            WHERE user_guid = '$userGuidEscaped'
            AND isDeleted = FALSE
            LIMIT 1
        ");
        if ($result && $row = $result->fetch_assoc()) {
            $admin_guid = $row["admin_guid"];
        }
    }
}

if (!$admin_guid) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];

/* -----------------------------------------------------
    Generate Unique Invoice Number: INV-0001
----------------------------------------------------- */
function generateInvoiceNo($conn) {
    $res = $conn->query("SELECT invoice_no FROM invoice ORDER BY id DESC LIMIT 1");
    $row = $res ? $res->fetch_assoc() : null;

    if ($row && preg_match("/INV-(\d+)/", $row["invoice_no"], $m)) {
        $next = intval($m[1]) + 1;
    } else {
        $next = 1;
    }

    return "INV-" . str_pad($next, 4, "0", STR_PAD_LEFT);
}

/* -----------------------------------------------------
    LIST INVOICES
----------------------------------------------------- */
if ($method === "GET" && isset($_GET["list"])) {

    $sql = "
        SELECT i.*, 
               CONCAT(u.first_name,' ',u.last_name) AS customer_name,
               u.mobile AS customer_mobile,
               COALESCE(v.registration_number, '') AS vehicle_number
        FROM invoice i
        LEFT JOIN users u ON u.user_guid = i.customer_guid
        LEFT JOIN vehicles v ON v.vehicle_guid = i.vehicle_guid
        WHERE i.isdelete = 0 AND i.admin_guid = ?
        ORDER BY i.id DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $admin_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($r = $result->fetch_assoc()) {
        $r["items"]  = json_decode($r["items"], true) ?: [];
        $r["totals"] = json_decode($r["totals"], true) ?: [];
        $rows[] = $r;
    }

    echo json_encode($rows);
    exit;
}

/* -----------------------------------------------------
    GET SINGLE INVOICE
----------------------------------------------------- */
if ($method === "GET" && isset($_GET["invoice_guid"])) {

    $guid = $_GET["invoice_guid"];

    $sql = "
        SELECT i.*,
               CONCAT(u.first_name,' ',u.last_name) AS customer_name,
               u.mobile AS customer_mobile,
               COALESCE(v.registration_number, '') AS vehicle_number
        FROM invoice i
        LEFT JOIN users u ON u.user_guid = i.customer_guid
        LEFT JOIN vehicles v ON v.vehicle_guid = i.vehicle_guid
        WHERE i.invoice_guid = ? AND i.admin_guid = ? AND i.isdelete = 0
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $guid, $admin_guid);
    $stmt->execute();
    $data = $stmt->get_result()->fetch_assoc();

    if ($data) {
        $data["items"]  = json_decode($data["items"], true) ?: [];
        $data["totals"] = json_decode($data["totals"], true) ?: [];
    }
     $adminSql = "
    SELECT 
        p.userName,
        p.address,
        p.city_id,
        c.city_name,
        p.state_id,
        s.state_name,
        p.email,
        p.phone_number,
        p.pincode,
        p.profile_image
    FROM profile_crud p
    LEFT JOIN cities c ON c.city_id = p.city_id
    LEFT JOIN state_master s ON s.state_id = p.state_id
    WHERE p.user_guid = ?
";

$st = $conn->prepare($adminSql);
$st->bind_param("s", $admin_guid);
$st->execute();
$adminData = $st->get_result()->fetch_assoc();

// Attach to API response
$data["admin"] = $adminData ?: [];

    echo json_encode($data);
    exit;
}

/* -----------------------------------------------------
    GET INVOICE BY QUOTATION GUID (CHECK EXISTING)
----------------------------------------------------- */
if ($method === "GET" && isset($_GET["quotation_guid"])) {

    $quotation_guid = $_GET["quotation_guid"];

    $sql = "
        SELECT invoice_guid
        FROM invoice
        WHERE quotation_guid = ?
          AND admin_guid = ?
          AND isdelete = 0
        ORDER BY id DESC
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $quotation_guid, $admin_guid);
    $stmt->execute();

    $row = $stmt->get_result()->fetch_assoc();

    echo json_encode($row ?: []);
    exit;
}


/* -----------------------------------------------------
    CREATE INVOICE
----------------------------------------------------- */
if ($method === "POST" && !isset($_GET["invoice_guid"])) {

    // Extract FormData or JSON
    $body = $_POST;

    if (empty($body)) {
        $raw = file_get_contents("php://input");
        $body = json_decode($raw, true) ?: [];
    }

        // 🔒 CHECK: invoice already exists for this job
    $job_guid = $_POST["job_guid"] ?? null;

    if (!$job_guid) {
        $raw = file_get_contents("php://input");
        $tmp = json_decode($raw, true) ?: [];
        $job_guid = $tmp["job_guid"] ?? null;
    }

    if ($job_guid) {
        $checkSql = "
            SELECT invoice_guid 
            FROM invoice 
            WHERE job_guid = ? 
              AND admin_guid = ? 
              AND isdelete = 0
            ORDER BY id DESC
            LIMIT 1
        ";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ss", $job_guid, $admin_guid);
        $checkStmt->execute();
        $existing = $checkStmt->get_result()->fetch_assoc();

        if ($existing) {
            // ✅ Return existing invoice instead of creating new
            echo json_encode([
                "success" => true,
                "message" => "Invoice already exists",
                "invoice_guid" => $existing["invoice_guid"],
                "mode" => "edit"
            ]);
            exit;
        }
    }

    $invoice_guid   = uniqid("IN");
    $invoice_no     = generateInvoiceNo($conn);

    $quotation_guid = $body["quotation_guid"] ?? null;
    $job_guid       = $body["job_guid"] ?? null;
    $customer_guid  = $body["customer_guid"] ?? null;
    $vehicle_guid   = $body["vehicle_guid"] ?? null;

// ITEMS
$itemsRaw = $body["items"] ?? "[]";

try {
    $itemsArray = json_decode($itemsRaw, true, 512, JSON_THROW_ON_ERROR);
} catch (Exception $e) {
    $itemsArray = []; // fallback if decode fails
}

$items = json_encode($itemsArray, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// TOTALS
$totalsRaw = $body["totals"] ?? "{}";

try {
    $totalsArray = json_decode($totalsRaw, true, 512, JSON_THROW_ON_ERROR);
} catch (Exception $e) {
    $totalsArray = [];
}

$totals = json_encode($totalsArray, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    $paid_amount    = $body["paid_amount"] ?? "0";
    $payment_method = $body["payment_method"] ?? "";
    $notes          = $body["notes"] ?? "";

    $sql = "
        INSERT INTO invoice
        (invoice_guid, invoice_no, quotation_guid, job_guid, customer_guid, vehicle_guid, 
         items, totals, payment_method, paid_amount, notes, created_by, admin_guid)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ";

    $stmt = $conn->prepare($sql);

    // 13 strings → "sssssssssssss"
    $stmt->bind_param(
        "sssssssssssss",
        $invoice_guid,
        $invoice_no,
        $quotation_guid,
        $job_guid,
        $customer_guid,
        $vehicle_guid,
        $items,
        $totals,
        $payment_method,
        $paid_amount,
        $notes,
        $user_guid,
        $admin_guid
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Invoice Created",
            "invoice_guid" => $invoice_guid,
            "invoice_no"   => $invoice_no
        ]);
        exit;
    }

    echo json_encode(["success" => false, "message" => $stmt->error]);
    exit;
}

/* -----------------------------------------------------
    UPDATE INVOICE
----------------------------------------------------- */
if ($method === "POST" && isset($_GET["invoice_guid"])) {

    $body = $_POST;
    $invoice_guid = $_GET["invoice_guid"];

    // ITEMS
    $itemsArr = json_decode($body["items"] ?? "[]", true) ?: [];
    $items = json_encode($itemsArr, JSON_UNESCAPED_UNICODE);

    // TOTALS
    $totalsArr = json_decode($body["totals"] ?? "{}", true) ?: [];
    $totals = json_encode($totalsArr, JSON_UNESCAPED_UNICODE);

    $paid_amount    = $body["paid_amount"] ?? "0";
    $payment_method = $body["payment_method"] ?? "";
    $notes          = $body["notes"] ?? "";

    $sql = "
        UPDATE invoice SET
            items = ?,
            totals = ?,
            paid_amount = ?,
            payment_method = ?,
            notes = ?
        WHERE invoice_guid = ?
          AND admin_guid = ?
          AND isdelete = 0
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssss",
        $items,
        $totals,
        $paid_amount,
        $payment_method,
        $notes,
        $invoice_guid,
        $admin_guid
    );

    echo json_encode(
        $stmt->execute()
        ? ["success" => true, "message" => "Invoice Updated"]
        : ["success" => false, "message" => $stmt->error]
    );
    exit;
}




/* -----------------------------------------------------
    DELETE INVOICE (SOFT DELETE)
----------------------------------------------------- */
if ($method === "DELETE" && isset($_GET["invoice_guid"])) {

    $guid = $_GET["invoice_guid"];

    $sql = "UPDATE invoice SET isdelete = 1 WHERE invoice_guid = ? AND admin_guid = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $guid, $admin_guid);

    echo json_encode(
        $stmt->execute()
            ? ["success" => true, "message" => "Invoice Deleted"]
            : ["success" => false, "message" => $stmt->error]
    );
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid Request"]);
exit;

?>
