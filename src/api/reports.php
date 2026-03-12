<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

/* =====================================================
   TOKEN + ROLE + ADMIN LOGIC
===================================================== */

// Get Bearer token
function getBearerToken()
{
    $headers = getallheaders();
    $headers = array_change_key_case($headers, CASE_LOWER);
    if (!isset($headers['authorization'])) {
        return null;
    }

    $authHeader = $headers['authorization'];

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }

    return null;
}

function validateJWTAndGetGuid($token)
{
    global $jwt_secret, $jwt_algorithm;
    $secret = $jwt_secret;
    $algorithm = $jwt_algorithm;

    try {
        // Make sure the JWT library is available
        require_once 'vendor/autoload.php';
        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($secret, $algorithm));

        // Check token expiration
        $currentTime = time();
        if (isset($decoded->exp) && $decoded->exp < $currentTime) {
            return ['success' => false, 'error' => 'Token has expired', 'code' => 401];
        }

        return ['success' => true, 'message' => 'Valid Token', 'data' => $decoded];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage(), 'code' => 401];
    }
}

// Main token validation logic
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

// Extract user_guid from token
$decodedToken = $validation['data'];
$adminGuid = null;
if ($decodedToken && isset($decodedToken->user_guid)) {

    if ($decodedToken->role_id == 1) {
        $adminGuid = $decodedToken->user_guid;
    } else {

        $adminGuid = $decodedToken->user_guid;

        $result = $conn->query("
            SELECT admin_guid 
            FROM users
            WHERE user_guid = '$adminGuid'
            AND isDeleted = FALSE
            LIMIT 1
        ");

        if ($result && $row = $result->fetch_assoc()) {
            $adminGuid = $row['admin_guid'];
        }
    }
}

if (!$adminGuid) {
    echo json_encode(["success" => false, "message" => "Admin not found"]);
    exit;
}

/* =====================================================
   HELPER: ADMIN FILTER FOR ALL TABLES
===================================================== */
function adminFilter($alias, $adminGuid)
{
    return "
        INNER JOIN users u ON u.user_guid = {$alias}.user_guid
        INNER JOIN profile_crud a ON a.user_guid = u.admin_guid
        WHERE a.user_guid = '$adminGuid'
    ";
}

/* =====================================================
   MAIN ACTION HANDLER
===================================================== */

try {
    $action = $_GET['action'] ?? '';

    /* =====================================================
       🔹 ACTION: DASHBOARD REPORTS (NEW)
    ====================================================== */
    if ($action === 'dashboard') {

        // Total Revenue
        $revenueSql = "
            SELECT 
                SUM(JSON_UNQUOTE(JSON_EXTRACT(i.totals, '$.grandTotal'))) AS totalRevenue
            FROM invoice i
            WHERE admin_guid = '$adminGuid'
              AND i.isdelete = 0
        ";
        $revenueRow = $conn->query($revenueSql)->fetch_assoc();

        // Total Purchase Cost
        $purchaseSql = "
            SELECT SUM(pi.amount) AS totalPurchase 
            FROM purchase_items pi
            LEFT JOIN purchases p ON p.purchase_id = pi.purchase_id
            WHERE p.admin_guid = '$adminGuid'
        ";
        $purchaseRow = $conn->query($purchaseSql)->fetch_assoc();
        // Fetch all invoices to process items in PHP (avoid JSON_TABLE for MariaDB compatibility)
        $invoiceItemsSql = "SELECT items FROM invoice WHERE admin_guid = '$adminGuid' AND isdelete = 0";
        $invoiceItemsRes = $conn->query($invoiceItemsSql);

        $totalProductQuantity = 0;
        $categoryTotals = [];

        if ($invoiceItemsRes) {
            while ($inv = $invoiceItemsRes->fetch_assoc()) {
                $items = json_decode($inv['items'], true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $qty = isset($item['qty']) ? (int) $item['qty'] : 0;
                        $totalProductQuantity += $qty;

                        $cat = isset($item['category']) ? $item['category'] : 'Other';
                        // Use 'amount' as saved in the DB, not 'total'
                        $amt = isset($item['amount']) ? (float) $item['amount'] : (isset($item['total']) ? (float) $item['total'] : 0);

                        if (!isset($categoryTotals[$cat])) {
                            $categoryTotals[$cat] = 0;
                        }
                        $categoryTotals[$cat] += $amt;
                    }
                }
            }
        }

        // Format for frontend (matches original API structure)
        $productLineData = [];
        foreach ($categoryTotals as $name => $value) {
            $productLineData[] = ["name" => $name, "value" => $value];
        }
        // Sort by value DESC
        usort($productLineData, fn($a, $b) => $b['value'] <=> $a['value']);

        // productTypeData currently uses the same logic
        $productTypeData = $productLineData;



        // Year-wise Revenue Trend
        $trendSql = "
           SELECT 
    DATE_FORMAT(i.created_on, '%b') AS period,
    MONTH(i.created_on) AS month_no,
    SUM(JSON_UNQUOTE(JSON_EXTRACT(i.totals, '$.grandTotal'))) AS revenue
FROM invoice i
WHERE i.admin_guid = '$adminGuid'
  AND i.isdelete = 0
  AND YEAR(i.created_on) = YEAR(CURDATE())
GROUP BY MONTH(i.created_on)
ORDER BY month_no;

        ";
        $trendData = $conn->query($trendSql)->fetch_all(MYSQLI_ASSOC);

        echo json_encode([
            "success" => true,
            "totalRevenue" => (float) ($revenueRow['totalRevenue'] ?? 0),
            "totalPurchase" => (float) ($purchaseRow['totalPurchase'] ?? 0),
            "totalProductQuantity" => $totalProductQuantity,
            "estimatedProfit" =>
                (float) ($revenueRow['totalRevenue'] ?? 0) -
                (float) ($purchaseRow['totalPurchase'] ?? 0),
            "productLineData" => $productLineData,
            "productTypeData" => $productTypeData,
            "trendData" => $trendData
        ]);

    }

    /* =====================================================
       🔹 ACTION: PENDING JOBS
    ====================================================== */ elseif ($action === 'pending_jobs') {

        $pendingQuery = "
            SELECT 
                jc.jobcardNo AS job_no,
                CONCAT(u.first_name, ' ', u.last_name) AS customer_name, 
                jc.EntryDate AS entry_date,
                rc.name AS repair_category
                FROM job_card jc
                LEFT JOIN repair_category rc ON jc.repair_category_id = rc.id
                left join users u ON u.user_guid = jc.customer_guid
                where jc.admin_guid = '$adminGuid'
                AND jc.status = 'Approval Pending'
                AND jc.isDeleted = 0
                AND jc.isActive = 1
                ORDER BY jc.EntryDate DESC
        ";

        $result = $conn->query($pendingQuery);
        $jobs = [];
        $sno = 1;
        while ($row = $result->fetch_assoc()) {
            $jobs[] = [
                "S.No" => $sno++,
                "Job No" => $row["job_no"],
                "Customer Name" => $row["customer_name"],
                "Date" => $row["entry_date"],
                "Subject" => $row["repair_category"] ?? "N/A",
                "Status" => "Pending"
            ];
        }

        echo json_encode(["success" => true, "pending_jobs" => $jobs]);
    }

    /* =====================================================
       🔹 ACTION: EMPLOYEE JOBS
    ====================================================== */ elseif ($action === 'employee_jobs') {

        $empQuery = "
            SELECT 
                e.employee_code,
                rc.name AS repair_category,
                jc.arrival_date,
                jc.estimate_date,
                jc.status
            FROM job_card jc
            LEFT JOIN employees e ON e.user_guid = jc.assign_to
            LEFT JOIN repair_category rc ON rc.id = jc.repair_category_id
            WHERE jc.admin_guid = '$adminGuid' and jc.isActive = 1 AND jc.isDeleted = 0
            ORDER BY jc.EntryDate DESC
        ";

        $result = $conn->query($empQuery);
        $empJobs = [];
        $sno = 1;

        while ($row = $result->fetch_assoc()) {
            $empJobs[] = [
                "S.No" => $sno++,
                "Employee Code" => $row["employee_code"] ?? "N/A",
                "Repair Category" => $row["repair_category"] ?? "N/A",
                "Arrival Date" => $row["arrival_date"] ?? "N/A",
                "Estimated Date" => $row["estimate_date"] ?? "N/A",
                "Status" => $row["status"]
            ];
        }

        echo json_encode(["success" => true, "employee_jobs" => $empJobs]);
    }

    /* =====================================================
       🔹 DEFAULT REPORTS (JOB + STOCK)
    ====================================================== */ else {

        $jobQuery = "
            SELECT 
                jc.jobcardNo AS job_no,
                CONCAT(u.first_name, ' ', u.last_name) AS customer_name, 
                jc.EntryDate AS entry_date,
                rc.name AS repair_category,
                jc.status
            FROM job_card jc
            LEFT JOIN repair_category rc ON jc.repair_category_id = rc.id
            LEFT JOIN users u ON u.user_guid = jc.customer_guid
            WHERE jc.admin_guid = '$adminGuid'
           AND jc.status != 'Approval Pending'
              AND jc.isDeleted = 0
              AND jc.isActive = 1
            ORDER BY jc.EntryDate DESC
        ";

        $jobResult = $conn->query($jobQuery);
        $jobReports = [];
        $sno = 1;

        while ($row = $jobResult->fetch_assoc()) {
            $jobReports[] = [
                "S.No" => $sno++,
                "Job No" => $row["job_no"],
                "Customer Name" => $row["customer_name"],
                "Date" => $row["entry_date"],
                "Subject" => $row["repair_category"] ?? "N/A",
                "Status" => $row["status"]
            ];
        }

        $stockQuery = "
            SELECT product_number, supplier_name, purchase_date,
                   product_name, available_quantity, quantity_sold
            FROM stock st
            where admin_guid = '$adminGuid'
            ORDER BY purchase_date DESC
        ";

        $stockResult = $conn->query($stockQuery);
        $stockReports = [];
        $sno2 = 1;

        while ($row = $stockResult->fetch_assoc()) {
            $stockReports[] = [
                "S.No" => $sno2++,
                "Product Number" => $row["product_number"],
                "Supplier Name" => $row["supplier_name"],
                "Purchase Date" => $row["purchase_date"],
                "Product Name" => $row["product_name"],
                "Available Quantity" => $row["available_quantity"],
                "Quantity Sold" => $row["quantity_sold"]
            ];
        }

        echo json_encode([
            "success" => true,
            "job_reports" => $jobReports,
            "stock_reports" => $stockReports
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching reports",
        "error" => $e->getMessage()
    ]);
}

$conn->close();
