<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "garage_management";


$jwt_secret = 'qwerty1234qwerty';
$jwt_algorithm = 'HS256';
// $jwt_expiry = (15 * 60);
$encryption_key = "RANDOM_32_CHAR_KEY_HERE";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


 
function getAdminGuid($conn, $user_guid, $role_id) {
    if ($role_id == 1) {
        return $user_guid;
    }
    
    $stmt = $conn->prepare("SELECT admin_guid FROM users WHERE user_guid = ? AND isDeleted = FALSE LIMIT 1");
    $stmt->bind_param("s", $user_guid);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        return $row['admin_guid'] ?: $user_guid;
    }
    
    return $user_guid;
}
?>
