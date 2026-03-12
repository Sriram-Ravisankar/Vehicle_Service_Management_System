<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "garage";


$jwt_secret = 'qwerty1234qwerty';
$jwt_algorithm = 'HS256';
// $jwt_expiry = (15 * 60);
$encryption_key = "RANDOM_32_CHAR_KEY_HERE";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
