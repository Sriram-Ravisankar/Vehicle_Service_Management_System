    <?php
    header("Content-Type: application/json");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
        http_response_code(204);
        exit;
    }

    // For actual requests
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Expose-Headers: Content-Type, Authorization");

    require_once 'config.php'; 
    require_once 'vendor/autoload.php';

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
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($secret, $algorithm));
            
            // Check token expiration
            $currentTime = time();
            if (isset($decoded->exp) && $decoded->exp < $currentTime) {
                return ['success' => false, 'error' => 'Token has expired', 'code' => 401];
            }
            
            return ['success' => true,'message' => 'valid Token', 'data' => $decoded];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage(), 'code' => 401];
        }
    }

    // Main execution
    try {
        $token = getBearerToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
       
        $validation = validateJWTAndGetGuid($token);
        
        if ($validation['success']) {
            header('Content-Type: application/json');
            // echo json_encode([
            //     'success' => true,
            //     'message' => $validation["message"],
            // ]);


        } else {
            http_response_code($validation['code']);
            echo json_encode([
                'success' => false,
                'error' => $validation['error'],
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    }
    ?>