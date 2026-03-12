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

/* -----------------------------------------------
   TOKEN VALIDATION USING MIDDLEWARE FUNCTIONS
------------------------------------------------ */

// Copy the token extraction and validation functions from middleware
function getBearerToken() {
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

function validateJWTAndGetGuid($token) {
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
$userGuid = $decodedToken->user_guid ?? null;

if (!$userGuid) {
    echo json_encode(["error" => "Invalid token payload"]);
    exit;
}

/* -----------------------------------------------
   STEP 1: GET role_id FROM profile_crud
------------------------------------------------ */
$roleSql = "
    SELECT role_id 
    FROM profile_crud
    WHERE user_guid = '$userGuid'
    LIMIT 1
";

$roleRes = $conn->query($roleSql);
$roleRow = $roleRes ? $roleRes->fetch_assoc() : null;
$roleId = $roleRow["role_id"] ?? null;

/* -----------------------------------------------
   STEP 2: DETERMINE admin_guid BASED ON role_id
------------------------------------------------ */
if ($roleId == 1) {
    // User IS admin
    $adminGuid = $userGuid;

} else {
    // User is a normal user → fetch admin_guid
    $adminSql = "
        SELECT admin_guid 
        FROM users
        WHERE user_guid = '$userGuid'
          AND isDeleted = FALSE
        LIMIT 1
    ";
    $adminRes = $conn->query($adminSql);
    $adminRow = $adminRes ? $adminRes->fetch_assoc() : null;
    $adminGuid = $adminRow["admin_guid"] ?? null;
}

if (!$adminGuid) {
    echo json_encode(["error" => "Admin not found"]);
    exit;
}

/* -----------------------------------------------
   HELPER FUNCTIONS
------------------------------------------------ */

// Return single value from query
function getValue($conn, $query) {
    $result = $conn->query($query);
    if ($result && $row = $result->fetch_assoc()) {
        return array_values($row)[0];
    }
    return 0;
}



/* -----------------------------------------------
   DEFAULT VARIABLES
------------------------------------------------ */
$monthlyAnalytics = [];
$yearlySales = 0;

/* -----------------------------------------------
   DASHBOARD QUERIES (FILTERED BY ADMIN)
------------------------------------------------ */

$customers = getValue($conn, "
    SELECT COUNT(*)
    FROM users
    WHERE admin_guid = '$adminGuid'
      AND user_type = 'customer'
      AND isDeleted = 0
");
$vehicles = getValue($conn, "
    SELECT COUNT(*)
    FROM vehicles v
    INNER JOIN users u ON u.user_guid = v.user_guid
    WHERE u.admin_guid = '$adminGuid'
      AND u.isDeleted = 0
");


$totalEmployees = getValue($conn, "
    SELECT COUNT(*)
    FROM users
    WHERE admin_guid = '$adminGuid'
      AND user_type IN ('employee', 'support_staff', 'accountant')
      AND isDeleted = 0
");

$fyStart = (date("m") >= 4)
    ? date("Y-04-01")
    : (date("Y") - 1) . "-04-01";

$fyEnd = (date("m") >= 4)
    ? (date("Y") + 1) . "-03-31"
    : date("Y") . "-03-31";

$revenueFY = getValue($conn, "
    SELECT COALESCE(SUM(paid_amount),0)
    FROM invoice
    WHERE admin_guid = '$adminGuid'
      AND isdelete = 0
      AND created_on BETWEEN '$fyStart' AND '$fyEnd'
");
$availableVehicles = getValue($conn, "
   SELECT COUNT(*)
    FROM vehicles v
    INNER JOIN users u ON u.user_guid = v.user_guid
    WHERE u.admin_guid = '$adminGuid'
      AND u.isDeleted = 0
");

$approvalPending = getValue($conn, "
    SELECT COUNT(*)
    FROM job_card
    WHERE admin_guid = '$adminGuid'
      AND status = 'Approval Pending'
");

$workInProgress = getValue($conn, "
    SELECT COUNT(*)
    FROM job_card
    WHERE admin_guid = '$adminGuid'
      AND status = 'Work In Progress'
");

$workCompleted = getValue($conn, "
    SELECT COUNT(DISTINCT job_guid)
    FROM invoice
    WHERE admin_guid = '$adminGuid'
      AND isdelete = 0
      AND job_guid IS NOT NULL
");


// 4. Suppliers Count
$suppliers = getValue($conn, "
    SELECT COUNT(DISTINCT p.supplier)
    FROM products p
      WHERE p.admin_guid = '$adminGuid'"
);

// 5. Total Products
$products = getValue($conn, "
    SELECT COUNT(*) 
    FROM products p
      WHERE p.admin_guid = '$adminGuid'"
);

// 6. Purchase Amount
$purchase = getValue($conn, "
    SELECT COALESCE(SUM(p.price),0)
    FROM products p
      WHERE p.admin_guid = '$adminGuid'"
);

// 7. Stock Quantity
$stockQty = getValue($conn, "
    SELECT COALESCE(SUM(p.unit),0)
    FROM products p
      WHERE p.admin_guid = '$adminGuid'"
);

// 8. Stock Amount
$stockAmount = getValue($conn, "
    SELECT COALESCE(SUM(p.price * p.unit),0)
    FROM products p
   WHERE p.admin_guid = '$adminGuid'"
);

// 9. Total Users
$totalUsers = getValue($conn, "
    SELECT COUNT(*)
    FROM users u
    WHERE u.admin_guid = '$adminGuid'
      AND u.isDeleted = FALSE
");

// 10. Active Users
$activeUsers = getValue($conn, "
    SELECT COUNT(*)
    FROM users u
    WHERE u.admin_guid = '$adminGuid'
      AND u.isActive = TRUE
      AND u.isDeleted = FALSE
");

/* -----------------------------------------------
   SALES PERFORMANCE (LAST 4 WEEKS)
------------------------------------------------ */

$weeks = ["Week 1"=>0,"Week 2"=>0,"Week 3"=>0,"Week 4"=>0];

$salesSql = "
    SELECT 
        CASE
            WHEN i.created_on >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 'Week 4'
            WHEN i.created_on >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) THEN 'Week 3'
            WHEN i.created_on >= DATE_SUB(CURDATE(), INTERVAL 21 DAY) THEN 'Week 2'
            WHEN i.created_on >= DATE_SUB(CURDATE(), INTERVAL 28 DAY) THEN 'Week 1'
        END AS week_label,
        SUM(i.paid_amount) AS total
    FROM invoice i
    where i.admin_guid = '$adminGuid'
      AND i.isdelete = 0
      AND i.created_on >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
    GROUP BY week_label
";

$res = $conn->query($salesSql);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        if (isset($weeks[$row["week_label"]])) {
            $weeks[$row["week_label"]] = (float)$row["total"];
        }
    }
}

$monthlySales = [];
$totalMonthlySales = 0;
foreach ($weeks as $week => $amount) {
    $monthlySales[] = ["name" => $week, "value" => $amount];
    $totalMonthlySales += $amount;
}
$avgWeeklySales = round($totalMonthlySales / 4, 2);

/* -----------------------------------------------
   ANALYTICS MODE (Optional)
------------------------------------------------ */

if (isset($_GET["analytics"]) && $_GET["analytics"] === "sales_views") {

    $monthly = [];
    for ($m = 1; $m <= 12; $m++) {
        $mn = date("M", mktime(0,0,0,$m,1));
        $monthly[$mn] = ["name"=>$mn,"sales"=>0,"views"=>0];
    }

    $sql = "
        SELECT 
            MONTH(i.created_on) AS m,
            SUM(i.paid_amount) AS sales,
            COUNT(i.invoice_guid) AS views
        FROM invoice i
       where i.admin_guid = '$adminGuid'
          AND i.isdelete = 0
          AND YEAR(i.created_on) = YEAR(CURDATE())
        GROUP BY MONTH(i.created_on)
    ";

    $res = $conn->query($sql);
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $mn = date("M", mktime(0,0,0,$r["m"],1));
            $monthly[$mn]["sales"] = (float)$r["sales"];
            $monthly[$mn]["views"] = (int)$r["views"];
        }
    }

    $yearSql = "
        SELECT 
            SUM(i.paid_amount) AS totalSales,
            COUNT(i.invoice_guid) AS totalViews
        FROM invoice i
       where i.admin_guid = '$adminGuid'
          AND i.isdelete = 0
          AND YEAR(i.created_on) = YEAR(CURDATE())
    ";

    $yearRes = $conn->query($yearSql);
    $year = $yearRes ? $yearRes->fetch_assoc() : [];

    echo json_encode([
        "monthlyAnalytics" => array_values($monthly),
        "yearlySales"      => (float)($year["totalSales"] ?? 0),
        "yearlyViews"      => (int)($year["totalViews"] ?? 0)
    ]);
    exit;
}

/* -----------------------------------------------
   FINAL OUTPUT
------------------------------------------------ */

echo json_encode([
    "customers"          => (int)$customers,
    "vehicles"           => (int)$vehicles,
    "totalEmployees"     => (int)$totalEmployees,
    "revenueFY"          => (float)$revenueFY,
    "availableVehicles"  => (int)$availableVehicles,
    "approvalPending"    => (int)$approvalPending,
    "workInProgress"     => (int)$workInProgress,
    "workCompleted"      => (int)$workCompleted,
    "totalUsers"        => (int)$totalUsers,
    "activeUsers"       => (int)$activeUsers,
    "monthlySales"      => $monthlySales,
    "avgWeeklySales"    => $avgWeeklySales,
    "totalMonthlySales" => $totalMonthlySales,
    "monthlyAnalytics"  => $monthlyAnalytics,
    "yearlySales"       => (float)$yearlySales
]);

?>