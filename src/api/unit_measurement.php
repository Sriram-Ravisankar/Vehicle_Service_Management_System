<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Include DB connection
require_once 'config.php';

$response = [];

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'POST': // CREATE
            $input = json_decode(file_get_contents("php://input"), true);
            $unit_name = $input['unit_name'] ?? '';
            $unit_symbol = $input['unit_symbol'] ?? '';
            $unit_type = $input['unit_type'] ?? '';

            if (!$unit_name || !$unit_symbol) {
                throw new Exception("unit_name and unit_symbol are required.");
            }

            $stmt = $conn->prepare("INSERT INTO units_of_measurement (unit_name, unit_symbol, unit_type) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $unit_name, $unit_symbol, $unit_type);
            $stmt->execute();

            $response = ["success" => true, "message" => "Unit inserted successfully."];
            break;

        case 'GET': // READ
            $result = $conn->query("SELECT * FROM units_of_measurement WHERE isActive = 1");

            $units = [];
            while ($row = $result->fetch_assoc()) {
                $units[] = $row;
            }

            $response = ["success" => true, "data" => $units];
            break;

        case 'PUT': // UPDATE
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $input['id'] ?? null;
            if (!$id) throw new Exception("id is required for update.");

            $unit_name = $input['unit_name'] ?? null;
            $unit_symbol = $input['unit_symbol'] ?? null;
            $unit_type = $input['unit_type'] ?? null;
            $isActive = $input['isActive'] ?? null;

            $setClause = [];
            $params = [];
            $types = '';

            if ($unit_name !== null) {
                $setClause[] = "unit_name = ?";
                $params[] = $unit_name;
                $types .= 's';
            }
            if ($unit_symbol !== null) {
                $setClause[] = "unit_symbol = ?";
                $params[] = $unit_symbol;
                $types .= 's';
            }
            if ($unit_type !== null) {
                $setClause[] = "unit_type = ?";
                $params[] = $unit_type;
                $types .= 's';
            }
            if ($isActive !== null) {
                $setClause[] = "isActive = ?";
                $params[] = $isActive;
                $types .= 'i';
            }

            if (empty($setClause)) throw new Exception("No update fields provided.");

            $params[] = $id;
            $types .= 'i';

            $query = "UPDATE units_of_measurement SET " . implode(', ', $setClause) . " WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();

            $response = ["success" => true, "message" => "Unit updated successfully."];
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception("id is required to delete.");
            }

            $stmt = $conn->prepare(
                "UPDATE units_of_measurement
         SET isActive = 0,
             isDeleted = 1
         WHERE id = ?
           AND isDeleted = 0"
            );

            $stmt->bind_param("i", $id);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                throw new Exception("Unit not found or already deleted.");
            }

            $response = [
                "success" => true,
                "message" => "Unit soft-deleted successfully."
            ];
            break;


        default:
            throw new Exception("Unsupported request method.");
    }
} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
