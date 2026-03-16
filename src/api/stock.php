<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once 'config.php';
require_once __DIR__ . '/vendor/autoload.php';  

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/******************************
    AUTHENTICATION FUNCTION
******************************/
function authenticate() {
    global $jwt_secret;

    $headers = apache_request_headers();

    if (!isset($headers["Authorization"])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Authorization token missing"]);
        exit();
    }

    $token = str_replace("Bearer ", "", $headers["Authorization"]);

    try {
        $decoded = JWT::decode($token, new Key($jwt_secret, "HS256"));

        // RETURN user_guid from token
        return $decoded->user_guid;

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid token",
            "error" => $e->getMessage()
        ]);
        exit();
    }
}


/******************************
    ROUTE HANDLERS
******************************/
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "OPTIONS") {
    http_response_code(200);
    exit();
}

switch ($method) {
    case "GET":
        handleGet($conn);
        break;
    case "POST":
        handlePost($conn);
        break;
    case "PUT":
        handlePut($conn);
        break;
    case "DELETE":
        handleDelete($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method Not Allowed"]);
        break;
}

/******************************
            GET
******************************/
function handleGet($conn) {
    $admin_guid = authenticate();

    $sql = "
        SELECT 
            s.*,
            p.image AS product_image,
            totals.total_quantity_purchased,
            totals.total_quantity_sold,
            (totals.total_quantity_purchased - totals.total_quantity_sold) AS available_quantity
        FROM stock s
        INNER JOIN (
            SELECT 
                product_id,
                supplier_id,
                admin_guid,
                MAX(stock_id) AS latest_stock_id,
                SUM(quantity_purchased) AS total_quantity_purchased,
                SUM(quantity_sold) AS total_quantity_sold
            FROM stock
            WHERE admin_guid = ?
            GROUP BY product_id, supplier_id, admin_guid
        ) totals 
            ON s.product_id = totals.product_id 
            AND s.supplier_id = totals.supplier_id
            AND s.stock_id = totals.latest_stock_id
        JOIN products p ON s.product_id = p.id 
        WHERE s.admin_guid = ?
        ORDER BY s.stock_id DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $admin_guid, $admin_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    $stocks = [];
    while ($row = $result->fetch_assoc()) {
        $stocks[] = $row;
    }

    echo json_encode(["success" => true, "data" => $stocks]);
}

/******************************
            POST
******************************/
function handlePost($conn) {
    $admin_guid = authenticate();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["purchase_id"], $data["product_id"])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing purchase_id or product_id"]);
        return;
    }

    $sql = "
        INSERT INTO stock (
            admin_guid,
            product_id, product_number, product_name, product_image, unit_id, unit_name,
            quantity_purchased, price, amount,
            supplier_id, supplier_name,
            purchase_id, purchase_no, purchase_date,
            branch_id
        )
        SELECT 
            ? AS admin_guid,
            pi.product_id,
            p.product_number,
            p.product_name,
            p.image,
            p.unit,
            u.unit_name,
            pi.quantity,
            pi.price,
            pi.amount,
            s.supplier_id,
            s.supplier_name,
            pu.purchase_id,
            pu.purchase_no,
            pu.purchase_date,
            p.branch
        FROM purchase_items pi
        JOIN products p ON pi.product_id = p.id
        JOIN purchases pu ON pi.purchase_id = pu.purchase_id
        LEFT JOIN suppliers s ON pu.supplier = s.supplier_id
        LEFT JOIN units_of_measurement u ON p.unit = u.id
        WHERE pi.purchase_id = ? AND pi.product_id = ?
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $admin_guid, $data["purchase_id"], $data["product_id"]);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Stock inserted successfully"]);
}

/******************************
            PUT
******************************/
function handlePut($conn) {
    $admin_guid = authenticate();
    parse_str($_SERVER["QUERY_STRING"], $params);
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($params["product_id"])) {
        echo json_encode(["success" => false, "message" => "Missing product_id"]);
        return;
    }

    $product_id = $params["product_id"];

/******** UPDATE STOCK AFTER PURCHASE EDIT ********/
if (isset($data["purchase_id"])) {

    $sql = "
        UPDATE stock s
        JOIN purchase_items pi ON pi.purchase_id = s.purchase_id AND pi.product_id = s.product_id
        JOIN products p ON p.id = pi.product_id
        LEFT JOIN suppliers sup ON sup.supplier_id = s.supplier_id
        JOIN purchases pu ON pu.purchase_id = s.purchase_id
        LEFT JOIN units_of_measurement u ON u.id = p.unit
        SET
            s.product_number = p.product_number,
            s.product_name = p.product_name,
            s.product_image = p.image,
            s.unit_id = p.unit,
            s.unit_name = u.unit_name,
            s.quantity_purchased = pi.quantity,
            s.price = pi.price,
            s.amount = pi.amount,
            s.supplier_id = sup.supplier_id,
            s.supplier_name = sup.supplier_name,
            s.purchase_no = pu.purchase_no,
            s.purchase_date = pu.purchase_date,
            s.branch_id = p.branch,
            s.modifiedOn = NOW()
        WHERE s.product_id = ? AND s.purchase_id = ? AND s.admin_guid = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iis", $product_id, $data["purchase_id"], $admin_guid);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Stock updated after purchase edit"
    ]);
    return;
}



    /******** UPDATE AFTER SALE ********/
    if (isset($data["quantity_sold"], $data["invoice_id"], $data["invoice_no"])) {

        $sql = "
            UPDATE stock
            SET quantity_sold = IFNULL(quantity_sold,0)+?,
                invoice_id = ?, invoice_no = ?, modifiedOn = NOW()
            WHERE product_id = ? AND admin_guid = ?
            ORDER BY stock_id DESC LIMIT 1
        ";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "iisis",
            $data["quantity_sold"],
            $data["invoice_id"],
            $data["invoice_no"],
            $product_id,
            $admin_guid
        );

        $stmt->execute();
        echo json_encode(["success" => true, "message" => "Stock updated after sale"]);
        return;
    }

    echo json_encode(["success" => false, "message" => "Missing fields"]);
}

/******************************
            DELETE
******************************/
function handleDelete($conn) {
    $admin_guid = authenticate();
    parse_str($_SERVER["QUERY_STRING"], $params);

    if (!isset($params["id"])) {
        echo json_encode(["success" => false, "message" => "Missing stock_id"]);
        return;
    }

    $stock_id = $params["id"];

    $stmt = $conn->prepare("DELETE FROM stock WHERE stock_id = ? AND admin_guid = ?");
    $stmt->bind_param("is", $stock_id, $admin_guid);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Stock deleted successfully"]);
}
