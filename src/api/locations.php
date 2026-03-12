<?php

// Handle CORS early before anything else
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204); // No Content
    exit;
}

// Set CORS + JSON headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Show PHP errors for debugging (only in dev!)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include config
require_once 'config.php';

// Only allow GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Check DB connection
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection error']);
    exit;
}

$type = $_GET['type'] ?? null;

if ($type === 'states') {
    $query = "SELECT state_id, state_name FROM state_master WHERE isActive = 1 AND isDeleted = 0";
    $result = $conn->query($query);

    $states = [];
    while ($row = $result->fetch_assoc()) {
        $states[] = $row;
    }

    echo json_encode(['status' => 'success', 'data' => $states]);
    exit;

} elseif ($type === 'cities' && isset($_GET['state_id'])) {
    $state_id = intval($_GET['state_id']);
    $stmt = $conn->prepare("SELECT city_id, city_name FROM cities WHERE state_id = ? AND isActive = 1 AND isDeleted = 0");
    $stmt->bind_param("i", $state_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $cities = [];
    while ($row = $result->fetch_assoc()) {
        $cities[] = $row;
    }

    echo json_encode(['status' => 'success', 'data' => $cities]);
    exit;

} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request parameters']);
    exit;
}
