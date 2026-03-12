  <?php
    header("Content-Type: application/json");

    // Handle OPTIONS request for CORS preflight
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

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

function getBearerToken() {
    $headers = getallheaders();
    $headers = array_change_key_case($headers, CASE_LOWER);
    if (!isset($headers['authorization'])) {
        return null;
    }
    $authHeader = $headers['authorization'];
    if (preg_match('/^bearer\s+(\S+)$/i', trim($authHeader), $matches)) {
        return $matches[1];
    }
    return null;
}

function validateAndRefreshJWT($token) {
    global $jwt_secret, $jwt_algorithm, $jwt_expiry;
    
    try {
        $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
        return [
            'success' => true,
            'message' => 'Token is valid',
        ];
    } catch (ExpiredException $e) {
        try {

            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                throw new Exception('Invalid token structure');
            }

            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
            if (!is_array($payload)) {
                throw new Exception('Invalid token payload');
            }

            unset($payload['iat'], $payload['exp'], $payload['iss']);
            
            $newToken = generateJWT($payload);
            
            return [
                'success' => true,
                'message' => 'Token was expired and has been refreshed',
                'token' => $newToken,
                'refreshed' => true
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Token refresh failed: ' . $e->getMessage(),
                'code' => 401
            ];
        }
    } catch (SignatureInvalidException $e) {
        return [
            'success' => false,
            'error' => 'Invalid token signature',
            'code' => 401
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Token validation failed: ' . $e->getMessage(),
            'code' => 401
        ];
    }
}

function generateJWT($payload) {
    global $jwt_secret, $jwt_algorithm, $jwt_expiry;
    
    $issuedAt = time();
    $expirationTime = $issuedAt + $jwt_expiry;
    
    // Standard claims
    $tokenData = [
        'iat' => $issuedAt,
        'exp' => $expirationTime
    ];
    
    $tokenData = array_merge($tokenData, $payload);  
    return JWT::encode($tokenData, $jwt_secret, $jwt_algorithm);
}

// Main execution
try {
    $token = getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authorization token missing']);
        exit;
    }
    
    $validation = validateAndRefreshJWT($token);
    
    if ($validation['success']) {
        $response = [
            'success' => true,
            'message' => $validation['message'],
        ];
        
        if (isset($validation['refreshed']) && $validation['refreshed']) {
            $response['new_token'] = $validation['token'];
            header('Authorization: Bearer ' . $validation['token']);
        }
        
        echo json_encode($response);
    } else {
        http_response_code($validation['code'] ?? 401);
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