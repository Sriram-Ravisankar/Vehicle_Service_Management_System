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

// Extract user_guid and role_id from token
$decodedToken = $validation['data'];
$tokenGuid = $decodedToken->user_guid ?? null;
$roleId = $decodedToken->role_id ?? 0;

// Resolve primary admin_guid for reports visibility
$adminGuid = getAdminGuid($conn, $tokenGuid, $roleId);

if (!$adminGuid) {
    http_response_code(400);
    echo json_encode(["error" => "No admin profile found for this user"]);
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
       🔹 ACTION: MECHANIC DASHBOARD (NEW)
    ====================================================== */
    if ($action === 'mechanic_dashboard') {

        // 1. Total Assigned (Active)
        $assignedSql = "SELECT COUNT(*) as count FROM job_card 
                        WHERE assign_to = '$tokenGuid' AND isDeleted = 0 
                        AND status NOT IN ('Completed', 'Cancelled')";
        $assignedCount = $conn->query($assignedSql)->fetch_assoc()['count'] ?? 0;

        // 2. Pending (Assigned but not yet started)
        $pendingSql = "SELECT COUNT(*) as count FROM job_card 
                       WHERE assign_to = '$tokenGuid' AND isDeleted = 0 
                       AND status NOT IN ('Work In Progress', 'Completed', 'Cancelled', 'Delivered')";
        $pendingCount = $conn->query($pendingSql)->fetch_assoc()['count'] ?? 0;

        // 3. Work In Progress
        $wipSql = "SELECT COUNT(*) as count FROM job_card 
                   WHERE assign_to = '$tokenGuid' AND isDeleted = 0 
                   AND status = 'Work In Progress'";
        $wipCount = $conn->query($wipSql)->fetch_assoc()['count'] ?? 0;

        // 4. Completed Today
        $completedTodaySql = "SELECT COUNT(*) as count FROM job_card 
                              WHERE assign_to = '$tokenGuid' AND isDeleted = 0 
                              AND status = 'Completed' AND DATE(completed_date) = CURDATE()";
        $completedTodayCount = $conn->query($completedTodaySql)->fetch_assoc()['count'] ?? 0;

        // 4. Active Job List
        $jobsSql = "
            SELECT 
                jc.job_guid, jc.jobcardNo, jc.status, jc.service_type, jc.arrival_date,
                u.first_name, u.last_name, 
                v.registration_number, v.make, v.model
            FROM job_card jc
            LEFT JOIN users u ON u.user_guid = jc.customer_guid
            LEFT JOIN vehicles v ON v.vehicle_guid = jc.vehicle_guid
            WHERE jc.assign_to = '$tokenGuid' 
              AND jc.isDeleted = 0 
              AND jc.status NOT IN ('Completed', 'Cancelled')
            ORDER BY jc.arrival_date DESC
        ";
        $jobsResult = $conn->query($jobsSql);
        $jobs = [];
        if ($jobsResult) {
            while ($row = $jobsResult->fetch_assoc()) {
                $jobs[] = [
                    "id" => $row["job_guid"],
                    "jobcardNo" => $row["jobcardNo"],
                    "customer" => $row["first_name"] . " " . $row["last_name"],
                    "vehicle" => $row["registration_number"] . " (" . $row["make"] . " " . $row["model"] . ")",
                    "task" => $row["service_type"],
                    "status" => $row["status"],
                    "initials" => strtoupper(substr($row["first_name"], 0, 1)),
                    "statusColor" => ($row["status"] === 'Work In Progress' ? '#f59e0b' : 
                                      ($row["status"] === 'Approved' ? '#4338ca' : '#6b7280'))
                ];
            }
        }

        // 5. All Job List (Recent Jobs)
        $recentJobsSql = "
            SELECT 
                jc.job_guid, jc.jobcardNo, jc.status, jc.service_type, jc.arrival_date,
                u.first_name, u.last_name, 
                v.registration_number, v.make, v.model
            FROM job_card jc
            LEFT JOIN users u ON u.user_guid = jc.customer_guid
            LEFT JOIN vehicles v ON v.vehicle_guid = jc.vehicle_guid
            WHERE jc.assign_to = '$tokenGuid' 
              AND jc.isDeleted = 0 
              AND (DATE(jc.arrival_date) = CURDATE() OR jc.status NOT IN ('Completed', 'Cancelled') OR DATE(jc.completed_date) = CURDATE())
            ORDER BY jc.arrival_date DESC
        ";
        $recentJobsResult = $conn->query($recentJobsSql);
        $recentJobs = [];
        if ($recentJobsResult) {
            while ($row = $recentJobsResult->fetch_assoc()) {
                $recentJobs[] = [
                    "id" => $row["job_guid"],
                    "jobcardNo" => $row["jobcardNo"],
                    "customer" => $row["first_name"] . " " . $row["last_name"],
                    "vehicle" => $row["registration_number"] . " (" . $row["make"] . " " . $row["model"] . ")",
                    "task" => $row["service_type"],
                    "status" => $row["status"],
                    "initials" => strtoupper(substr($row["first_name"], 0, 1)),
                    "statusColor" => ($row["status"] === 'Work In Progress' ? '#f59e0b' : 
                                      ($row["status"] === 'Approved' ? '#4338ca' : '#6b7280'))
                ];
            }
        }

        echo json_encode([
            "success" => true,
            "stats" => [
                ["label" => "Assigned Services", "value" => (int)$assignedCount, "color" => "#3b82f6", "bgColor" => "#eff6ff"],
                ["label" => "Pending Tasks", "value" => (int)$pendingCount, "color" => "#f59e0b", "bgColor" => "#fffbeb"],
                ["label" => "Work In Progress", "value" => (int)$wipCount, "color" => "#0EA5E9", "bgColor" => "#f5f3ff"],
                ["label" => "Completed Today", "value" => (int)$completedTodayCount, "color" => "#10b981", "bgColor" => "#ecfdf5"]
            ],
            "jobs" => $jobs,
            "recent_jobs" => $recentJobs
        ]);
        exit;
    }

    /* =====================================================
       🔹 ACTION: DASHBOARD REPORTS (ADMIN)
    ====================================================== */
    if ($action === 'dashboard') {

        // Total Revenue
        $revenueSql = "
            SELECT 
                SUM(JSON_UNQUOTE(JSON_EXTRACT(i.totals, '$.grandTotal'))) AS totalRevenue
            FROM invoice i
            WHERE admin_guid = '$adminGuid'
              AND i.isdelete = 0
              AND i.paid_amount > 0
        ";
        $revenueRow = $conn->query($revenueSql)->fetch_assoc();

        // Total Purchase Cost
        $purchaseSql = "
            SELECT SUM(pi.amount) AS totalPurchase 
            FROM purchase_items pi
            LEFT JOIN purchases p ON p.purchase_id = pi.purchase_id
            WHERE p.admin_guid = '$adminGuid' AND p.isDeleted = 0
        ";
        $purchaseRow = $conn->query($purchaseSql)->fetch_assoc();

        // Supplier Spend Breakdown
        $supplierSpendSql = "
            SELECT 
                IFNULL(s.supplier_name, 'Unknown Vendor') AS name,
                SUM(pi.amount) AS value
            FROM purchases p
            LEFT JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
            LEFT JOIN suppliers s ON s.supplier_id = p.supplier
            WHERE p.admin_guid = '$adminGuid' AND p.isDeleted = 0
            GROUP BY p.supplier
            ORDER BY value DESC
            LIMIT 5
        ";
        $supplierSpendData = $conn->query($supplierSpendSql);
        $supplierSpend = [];
        if ($supplierSpendData) {
            while ($row = $supplierSpendData->fetch_assoc()) {
                $supplierSpend[] = $row;
            }
        }
        $supplierSpendData = $supplierSpend;
        // Fetch all invoices to process items in PHP (avoid JSON_TABLE for MariaDB compatibility)
        $invoiceItemsSql = "SELECT items FROM invoice WHERE admin_guid = '$adminGuid' AND isdelete = 0 AND paid_amount > 0";
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
  AND i.paid_amount > 0
  AND YEAR(i.created_on) = YEAR(CURDATE())
GROUP BY MONTH(i.created_on)
ORDER BY month_no;

        ";
        $trendDataResult = $conn->query($trendSql);
        $trendData = [];
        if ($trendDataResult) {
            while ($row = $trendDataResult->fetch_assoc()) {
                $trendData[] = $row;
            }
        }

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
            "supplierSpendData" => $supplierSpendData,
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
                CONCAT(e.first_name, ' ', e.last_name) AS mechanic_name,
                jc.EntryDate AS entry_date,
                rc.name AS repair_category,
                jc.status
                FROM job_card jc
                LEFT JOIN repair_category rc ON jc.repair_category_id = rc.id
                LEFT JOIN users u ON u.user_guid = jc.customer_guid
                LEFT JOIN users e ON e.user_guid = jc.assign_to
                WHERE jc.admin_guid = '$adminGuid'
                AND jc.isDeleted = 0
                AND jc.isActive = 1
                AND (jc.status = 'Approval Pending' OR jc.status = 'Pending')
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
                "Assigned Mechanic" => $row["mechanic_name"] ?? "Not Assigned",
                "Date" => $row["entry_date"],
                "Subject" => $row["repair_category"] ?? "N/A",
                "Status" => $row["status"]
            ];
        }

        echo json_encode(["success" => true, "pending_jobs" => $jobs]);
    }

    /* =====================================================
       🔹 ACTION: EMPLOYEE JOBS
    ====================================================== */ elseif ($action === 'employee_jobs') {

        $empQuery = "
            SELECT 
                CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
                rc.name AS repair_category,
                jc.arrival_date,
                jc.estimate_date,
                jc.status
            FROM job_card jc
            LEFT JOIN users u ON u.user_guid = jc.assign_to
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
                "Employee Name" => $row["employee_name"] ?? "N/A",
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
                   product_name, (IFNULL(quantity_purchased,0) - IFNULL(quantity_sold,0)) AS available_quantity, quantity_sold
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
