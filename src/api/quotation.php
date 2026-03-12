<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

require_once "config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/* -------------------------------------------------------
    JWT Decode
---------------------------------------------------------*/
function decode_token($token, $secret)
{
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

/* -------------------------------------------------------
    Generate Quotation Number Q-0001
---------------------------------------------------------*/
function generateQuotationNo($conn)
{
    $res = $conn->query("SELECT quotation_no FROM quotation ORDER BY id DESC LIMIT 1")->fetch_assoc();

    if ($res && preg_match("/Q-(\d+)/", $res["quotation_no"], $m)) {
        $next = intval($m[1]) + 1;
    } else {
        $next = 1;
    }
    return "Q-" . str_pad($next, 4, "0", STR_PAD_LEFT);
}

/* -------------------------------------------------------
    1. GET LIST OF QUOTATIONS  (GET ?list=1)
---------------------------------------------------------*/
if ($method === "GET" && isset($_GET["list"])) {

   $sql = "
    SELECT 
        q.quotation_guid,
        q.quotation_no,
        q.job_guid,
        q.customer_guid,
        q.vehicle_guid,
        v.registration_number AS vehicle_number,
        q.totals,
        q.parts,
        q.labour,
        q.status,
        q.created_on,

        CONCAT(u.first_name, ' ', u.last_name) AS customer_name,

        (JSON_LENGTH(q.parts) + JSON_LENGTH(q.labour)) AS items_count,

        JSON_UNQUOTE(JSON_EXTRACT(q.totals, '$.grandTotal')) AS grand_total

    FROM quotation q
    LEFT JOIN users u ON u.user_guid = q.customer_guid
    LEFT JOIN vehicles v ON v.vehicle_guid = q.vehicle_guid

    WHERE q.isdelete = 0 AND q.admin_guid = ?
    ORDER BY q.id DESC
";


    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $admin_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($r = $result->fetch_assoc()) {

        // Decode JSON
        $r["parts"]  = json_decode($r["parts"], true) ?: [];
        $r["labour"] = json_decode($r["labour"], true) ?: [];
        $r["totals"] = json_decode($r["totals"], true) ?: [];

        $rows[] = $r;
    }

    echo json_encode($rows);
    exit;
}

/* -------------------------------------------------------
    2. GET SINGLE QUOTATION  (GET ?quotation_guid=XXX)
---------------------------------------------------------*/
if ($method === "GET" && isset($_GET["quotation_guid"])) {

    $guid = $_GET["quotation_guid"];

   $sql = "
   SELECT 
    q.*,
    jc.jobcardNo,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    v.registration_number AS vehicle_number
FROM quotation q
LEFT JOIN job_card jc ON jc.job_guid = q.job_guid
LEFT JOIN users u ON u.user_guid = q.customer_guid
LEFT JOIN vehicles v ON v.vehicle_guid = q.vehicle_guid
WHERE q.quotation_guid = ? AND q.admin_guid = ? AND q.isdelete = 0

";
// Fetch company/admin profile for printing



    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $guid, $admin_guid);
    $stmt->execute();

    $data = $stmt->get_result()->fetch_assoc();

    if ($data) {
        $data["parts"]  = json_decode($data["parts"], true) ?: [];
        $data["labour"] = json_decode($data["labour"], true) ?: [];
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
        p.pincode
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

/* -------------------------------------------------------
    GET QUOTATION BY JOB GUID (CHECK EXISTING)
---------------------------------------------------------*/
if ($method === "GET" && isset($_GET["job_guid"])) {

    $job_guid = $_GET["job_guid"];

    $sql = "
        SELECT quotation_guid
        FROM quotation
        WHERE job_guid = ?
          AND admin_guid = ?
          AND isdelete = 0
        ORDER BY id DESC
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $job_guid, $admin_guid);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    echo json_encode($row ?: []);
    exit;
}

/* -------------------------------------------------------
   SYNC QUOTATION FROM JOB CARD (PRIORITY)
---------------------------------------------------------*/
if (($method === "POST" || $method === "PUT")
    && isset($_GET["job_guid"])
    && isset($_POST["sync_from_job"])) {

    $job_guid = $_GET["job_guid"];

    $parts  = $_POST["parts"] ?? null;
    $labour = $_POST["labour"] ?? null;
    $totals = $_POST["totals"] ?? null;

    if (!$parts || !$labour || !$totals) {
        echo json_encode(["success" => false, "message" => "Invalid sync data"]);
        exit;
    }

    $sql = "UPDATE quotation 
            SET parts = ?, labour = ?, totals = ?, updated_on = NOW()
            WHERE job_guid = ? 
              AND admin_guid = ? 
              AND isdelete = 0";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $parts, $labour, $totals, $job_guid, $admin_guid);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Quotation synced from job card"
    ]);
    exit;
}


/* -------------------------------------------------------
    3. CREATE QUOTATION
---------------------------------------------------------*/
if ($method === "POST" && !isset($_GET["quotation_guid"])) {
    // 🔒 CHECK: quotation already exists for this job
    $job_guid = $_POST["job_guid"] ?? null;

    if ($job_guid) {
        $checkSql = "
            SELECT quotation_guid 
            FROM quotation 
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
            // ✅ Return existing quotation instead of creating new
            echo json_encode([
                "success" => true,
                "message" => "Quotation already exists",
                "quotation_guid" => $existing["quotation_guid"],
                "mode" => "edit"
            ]);
            exit;
        }
    }

    $quotation_guid = uniqid("QT");
    $quotation_no   = generateQuotationNo($conn);

    $job_guid      = $_POST["job_guid"];
    $customer_guid = $_POST["customer_guid"];
    $vehicle_guid  = $_POST["vehicle_guid"];
    $parts         = $_POST["parts"];
    $labour        = $_POST["labour"];
    $totals        = $_POST["totals"];
    $notes         = $_POST["notes"] ?? "";
    $status        = "Approval Pending";

    $sql = "INSERT INTO quotation
            (quotation_guid, quotation_no, job_guid, customer_guid, vehicle_guid,
             parts, labour, totals, notes, status, created_by, admin_guid)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssssssssssss",
        $quotation_guid,
        $quotation_no,
        $job_guid,
        $customer_guid,
        $vehicle_guid,
        $parts,
        $labour,
        $totals,
        $notes,
        $status,
        $user_guid,
        $admin_guid
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Quotation Created",
            "quotation_guid" => $quotation_guid,
            "quotation_no"   => $quotation_no
        ]);
    } else {
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }

    exit;
}

/* -------------------------------------------------------
    4. UPDATE QUOTATION (PUT or POST)
---------------------------------------------------------*/
if (($method === "PUT" || $method === "POST") && isset($_GET["quotation_guid"])) {

    // Handle both FormData + JSON PUT
    if (!empty($_POST)) {
        $data = $_POST;
    } else {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        if (!is_array($data)) parse_str($raw, $data);
    }

    $guid = $_GET["quotation_guid"];

/* --- CASE 1: Only STATUS update --- */
if (isset($data["status"]) &&
    !isset($data["parts"]) &&
    !isset($data["labour"]) &&
    !isset($data["totals"])) {

    $status = $data["status"];

    // If rejected → soft delete
    if ($status === "Rejected") {

        $sql = "UPDATE quotation 
                SET status = ?, isdelete = 1 
                WHERE quotation_guid = ? AND admin_guid = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $status, $guid, $admin_guid);
        $stmt->execute();

    } else {
        // Normal status update
        $sql = "UPDATE quotation 
                SET status = ? 
                WHERE quotation_guid = ? AND admin_guid = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $status, $guid, $admin_guid);
        $stmt->execute();
    }

    /* 🔁 ALWAYS sync job_card status */
    $sqlJ = "SELECT job_guid FROM quotation WHERE quotation_guid = ?";
    $sJ = $conn->prepare($sqlJ);
    $sJ->bind_param("s", $guid);
    $sJ->execute();
    $job = $sJ->get_result()->fetch_assoc();

    if ($job && $job["job_guid"]) {
        $sqlJC = "UPDATE job_card SET status = ? WHERE job_guid = ?";
        $sJC = $conn->prepare($sqlJC);
        $sJC->bind_param("ss", $status, $job["job_guid"]);
        $sJC->execute();
    }

    echo json_encode([
        "success" => true,
        "message" => $status === "Rejected"
            ? "Quotation Rejected"
            : "Status Updated"
    ]);
    exit;
}


    /* --- CASE 2: FULL QUOTATION UPDATE --- */
    $parts  = $data["parts"]  ?? null;
    $labour = $data["labour"] ?? null;
    $totals = $data["totals"] ?? null;
    $notes  = $data["notes"]  ?? "";
    $status = $data["status"] ?? "Approval Pending";

    $sql = "UPDATE quotation SET 
                parts = ?, 
                labour = ?, 
                totals = ?, 
                notes = ?, 
                status = ?
            WHERE quotation_guid = ? AND admin_guid = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssss", $parts, $labour, $totals, $notes, $status, $guid, $admin_guid);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Quotation Updated"]);
    exit;
}

/* -------------------------------------------------------
    5. SOFT DELETE
---------------------------------------------------------*/
if ($method === "DELETE" && isset($_GET["quotation_guid"])) {

    $guid = $_GET["quotation_guid"];

    $sql = "UPDATE quotation SET isdelete = 1 
            WHERE quotation_guid = ? AND admin_guid = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $guid, $admin_guid);
    
    echo json_encode(
        $stmt->execute()
            ? ["success" => true, "message" => "Quotation Deleted"]
            : ["success" => false, "message" => $stmt->error]
    );
    exit;
}



echo json_encode(["success" => false, "message" => "Invalid Request"]);
exit;

?>