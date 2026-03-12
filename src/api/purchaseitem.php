<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once 'config.php'; // Include your DB connection

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        handleGet($conn);
        break;

    case 'POST':
        handlePost($conn);
        break;

    case 'PUT':
        handlePut($conn);
        break;

    case 'DELETE':
        handleDelete($conn);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method Not Allowed"]);
}

function handleGet($conn) {
    // Check if a specific purchase_id is passed in the query string
    $purchase_id = isset($_GET['purchase_id']) ? intval($_GET['purchase_id']) : null;

    if ($purchase_id) {
        // Get all items for the given purchase_id
        $stmt = $conn->prepare("SELECT * FROM purchase_items WHERE purchase_id = ?");
        $stmt->bind_param("i", $purchase_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }

        echo json_encode(["success" => true, "data" => $items]);
    } else {
        // Return all items if no purchase_id is passed
        $sql = "SELECT * FROM purchase_items";
        $result = $conn->query($sql);

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }

        echo json_encode(["success" => true, "data" => $items]);
    }
}


function handlePost($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['purchase_id'], $data['product_id'], $data['quantity'], $data['price'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }

    $purchase_id = $data['purchase_id'];
    $product_id  = $data['product_id'];
    $quantity    = $data['quantity'];
    $price       = $data['price'];
    $amount      = $price * $quantity;

    $stmt = $conn->prepare("INSERT INTO purchase_items (purchase_id, product_id, quantity, price, amount) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iiidd", $purchase_id, $product_id, $quantity, $price, $amount);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Purchase item added successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
}

function handlePut($conn) {
    // Get item_id from query string
    parse_str($_SERVER['QUERY_STRING'], $params);
    if (!isset($params['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing item_id in URL"]);
        return;
    }

    $item_id = $params['id'];
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['purchase_id'], $data['product_id'], $data['quantity'], $data['price'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing fields in body"]);
        return;
    }

    $purchase_id = $data['purchase_id'];
    $product_id  = $data['product_id'];
    $quantity    = $data['quantity'];
    $price       = $data['price'];
    $amount      = $price * $quantity;

    $stmt = $conn->prepare("UPDATE purchase_items SET purchase_id = ?, product_id = ?, quantity = ?, price = ?, amount = ? WHERE item_id = ?");
    $stmt->bind_param("iiiddi", $purchase_id, $product_id, $quantity, $price, $amount, $item_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Purchase item updated successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
}


function handleDelete($conn) {
    // Get item_id from query string
    parse_str($_SERVER['QUERY_STRING'], $params);
    if (!isset($params['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing item_id in URL"]);
        return;
    }

    $item_id = $params['id'];

    $stmt = $conn->prepare("DELETE FROM purchase_items WHERE item_id = ?");
    $stmt->bind_param("i", $item_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Purchase item deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
}

?>