<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// ------------------------------
// JWT DECODE FUNCTION (simple)
function decode_jwt($jwt)
{
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return null;
    $payload = $parts[1];
    return json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
}

// ------------------------------
// GET JWT FROM HEADERS
$headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
$token = null;
if (isset($headers['Authorization']) && preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
    $token = $matches[1];
}
$user_guid = null;
if ($token) {
    $decoded = decode_jwt($token);
    if ($decoded && isset($decoded['user_guid'])) {
        if ($decoded['role_id'] === 1) {
            $user_guid = $decoded['user_guid'];
        } else {
            $userGuid = $decoded['user_guid'];
            $result = $conn->query("
                SELECT admin_guid 
                FROM users
                WHERE user_guid = '$userGuid'
                AND isDeleted = FALSE
                LIMIT 1
            ");
            if ($result && $row = $result->fetch_assoc()) {
                $user_guid = $row['admin_guid'];
            }
        }
    }
}

// ------------------------------
// UUID Generator
function generate_uuid()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// ------------------------------
// Generate Jobcard Number
function generateJobcardNo($prefix, $conn)
{
    $currentMonth = date('n');
    $year = date('Y');

    if ($currentMonth >= 4) {
        $fromYear = $year;
        $toYear = $year + 1;
    } else {
        $fromYear = $year - 1;
        $toYear = $year;
    }

    $stmt = $conn->prepare("
        SELECT last_number FROM jobcard_sequence 
        WHERE prefix=? AND from_year=? AND to_year=?
    ");
    $stmt->bind_param("sii", $prefix, $fromYear, $toYear);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($lastNumber);
        $stmt->fetch();
        $newNumber = $lastNumber + 1;

        $update = $conn->prepare("
            UPDATE jobcard_sequence SET last_number=? 
            WHERE prefix=? AND from_year=? AND to_year=?
        ");
        $update->bind_param("isii", $newNumber, $prefix, $fromYear, $toYear);
        $update->execute();
    } else {
        $newNumber = 1;
        $insert = $conn->prepare("
            INSERT INTO jobcard_sequence (prefix, from_year, to_year, last_number) 
            VALUES (?, ?, ?, ?)
        ");
        $insert->bind_param("siii", $prefix, $fromYear, $toYear, $newNumber);
        $insert->execute();
    }

    return $prefix . str_pad($newNumber, 6, '0', STR_PAD_LEFT) . "-$fromYear-$toYear";
}

// -----------------------------------------------------------
// CLEAN INSPECTION PHOTOS – KEEP ONLY FILENAMES
function sanitizeInspectionPhotos($inspection)
{
    if (!is_array($inspection)) return $inspection;

    foreach ($inspection as &$item) {
        if (!isset($item['photos']) || !is_array($item['photos'])) continue;

        $cleanPhotos = [];

        foreach ($item['photos'] as $p) {

            // CASE 1: New uploaded file wrapper → keep name only
            if (is_array($p) && isset($p['name'])) {
                $cleanPhotos[] = $p['name'];
            }

            // CASE 2: New file object on frontend (sometimes backend receives arrays)
            else if (is_array($p) && isset($p['file']) && isset($p['file']['name'])) {
                $cleanPhotos[] = $p['file']['name'];
            }

            // CASE 3: Already stored filename string
            else if (is_string($p)) {
                $cleanPhotos[] = basename($p);
            }

            // CASE 4: Unexpected format → ignore safely
        }

        $item['photos'] = $cleanPhotos;
    }

    return $inspection;
}


// ------------------------------
// Save uploaded files (generic)
// $fileArray is the $_FILES entry for a set of files
function saveJobCardFiles($fileArray, $job_guid, $subfolder = "images")
{
    $baseDir = __DIR__ . "/uploads/jobcards/" . $job_guid . "/" . $subfolder . "/";
    if (!is_dir($baseDir)) mkdir($baseDir, 0777, true);

    $saved = [];

    // accommodate both single-file and multi-file structures
    if (!isset($fileArray['name'])) return $saved;

    // Multi-file
    if (is_array($fileArray['name'])) {
        foreach ($fileArray['name'] as $i => $name) {
            if ($fileArray['error'][$i] !== UPLOAD_ERR_OK) continue;
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $newName = uniqid("img_") . "." . $ext;
            $dest = $baseDir . $newName;
            move_uploaded_file($fileArray['tmp_name'][$i], $dest);
            $saved[] = $newName;
        }
    } else {
        // Single file structure
        if ($fileArray['error'] === UPLOAD_ERR_OK) {
            $name = $fileArray['name'];
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $newName = uniqid("img_") . "." . $ext;
            $dest = $baseDir . $newName;
            move_uploaded_file($fileArray['tmp_name'], $dest);
            $saved[] = $newName;
        }
    }

    return $saved;
}

// ------------------------------
// Determine method & parse input
$method = $_SERVER['REQUEST_METHOD'];
if (strpos($_SERVER["CONTENT_TYPE"] ?? "", "multipart/form-data") !== false) {
    // FormData → PHP populates $_POST + $_FILES
    $input = $_POST;
} else {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
}

// Support _method override (for FormData)
if ($method === 'POST') {
    $override = null;
    if (isset($_POST['_method'])) $override = $_POST['_method'];
    elseif (isset($_REQUEST['_method'])) $override = $_REQUEST['_method'];
    elseif (isset($_GET['_method'])) $override = $_GET['_method'];
    if ($override) $method = strtoupper($override);
}

switch ($method) {

    // ----------------------------------------------------
    // GET — List or single record
    // ----------------------------------------------------
    case 'GET':
        if (isset($_GET['job_guid'])) {
            $job_guid = $conn->real_escape_string($_GET['job_guid']);
            $sql = "
                SELECT 
                    jc.*,
                    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                    u.mobile,
                    v.registration_number,
                    CONCAT(v.make, ' ', v.model) AS vehicle_name
                FROM job_card jc
                LEFT JOIN users u ON u.user_guid = jc.customer_guid
                LEFT JOIN vehicles v ON v.vehicle_guid = jc.vehicle_guid
                WHERE jc.job_guid = '$job_guid' AND jc.isDeleted = 0
            ";
            $result = $conn->query($sql);
            $data = $result->fetch_assoc();

            if ($data) {
                // decode JSON fields to arrays/objects
                $data['car_markers'] = json_decode($data['car_markers'], true) ?: [];
                $data['inspection'] = json_decode($data['inspection'], true) ?: [];
                $data['parts'] = json_decode($data['parts'], true) ?: [];
                $data['labour'] = json_decode($data['labour'], true) ?: [];
                $data['totals'] = json_decode($data['totals'], true) ?: (object)[];
                $data['images'] = json_decode($data['images'], true) ?: [];
                $data['additional_options'] = json_decode($data['additional_options'], true) ?: [];
            }

            echo json_encode($data);
            break;
        }

        // LIST MODE
        $sql = "
            SELECT 
                jc.job_guid,
                jc.jobcardNo,
                jc.arrival_date,
                jc.estimate_date,
                jc.status,
                jc.service_type,
                jc.createdOn,
                CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                u.mobile,
                v.registration_number,
                CONCAT(v.make, ' ', v.model) AS vehicle_name
            FROM job_card jc
            LEFT JOIN users u ON u.user_guid = jc.customer_guid
            LEFT JOIN vehicles v ON v.vehicle_guid = jc.vehicle_guid
            WHERE jc.isDeleted = 0 AND jc.isActive = 1
        ";

        if ($user_guid) {
            // Optional: restrict to admin_guid if desired
            $sql .= " AND jc.admin_guid = '$user_guid' ";
        }

        $sql .= " ORDER BY jc.id DESC ";

        $result = $conn->query($sql);
        $output = [];
        while ($row = $result->fetch_assoc()) {
            $output[] = $row;
        }
        echo json_encode($output);
        break;

    // ----------------------------------------------------
    // POST — Create Job Card
    // ----------------------------------------------------
    case 'POST':
        if (!$user_guid) {
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            exit();
        }

        $job_guid = generate_uuid();
        $jobcardNo = generateJobcardNo('JOB', $conn);

        // Ensure arrays exist
        $input['car_markers'] = isset($input['car_markers']) ? json_decode($input['car_markers'], true) : ($input['car_markers'] ?? []);
        $input['inspection'] = isset($input['inspection']) ? json_decode($input['inspection'], true) : ($input['inspection'] ?? []);
        $input['parts'] = isset($input['parts']) ? json_decode($input['parts'], true) : ($input['parts'] ?? []);
        $input['labour'] = isset($input['labour']) ? json_decode($input['labour'], true) : ($input['labour'] ?? []);
        $input['totals'] = isset($input['totals']) ? json_decode($input['totals'], true) : ($input['totals'] ?? []);
        $input['additional_options'] = isset($input['additional_options']) ? json_decode($input['additional_options'], true) : ($input['additional_options'] ?? []);

        // Save initial DB row with placeholders for images -> after insert we'll update images array with saved filenames
        $car_markers  = json_encode($input['car_markers'] ?: []);
        $inspection   = json_encode($input['inspection'] ?: []);
        $parts        = json_encode($input['parts'] ?: []);
        $labour       = json_encode($input['labour'] ?: []);
        $totals       = json_encode($input['totals'] ?: []);
        $images       = json_encode([]); // will update after files saved
        $additional_options = json_encode($input['additional_options'] ?: []);
        $notes        = $input['notes'] ?? "";
        $complaint    = $input['complaint'] ?? "";
        $branch_id  = $input['branch_id'] ?? "";

        $stmt = $conn->prepare("
            INSERT INTO job_card (
                job_guid, admin_guid, customer_guid, vehicle_guid, branch_id,
                jobcardNo, repair_category_id, service_type,
                arrival_date, estimate_date, assign_to, additional_options,
                car_markers, inspection, parts, labour, totals, images, notes, complaint,
                createdOn, modifiedOn
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        // bind parameters - ensure correct types, use strings for JSON fields
        $stmt->bind_param(
            "ssssssisssssssssssss",
            $job_guid,
            $user_guid,
            $input['customer_guid'],
            $input['vehicle_guid'],
            $branch_id,
            $jobcardNo,
            $input['repair_category_id'],
            $input['service_type'],
            $input['arrival_date'],
            $input['estimate_date'],
            $input['assign_to'],
            $additional_options,
            $car_markers,
            $inspection,
            $parts,
            $labour,
            $totals,
            $images,
            $notes,
            $complaint
        );

        if ($stmt->execute()) {

            // Save uploaded jobcard images (images[])
            $uploadedImages = [];
            if (!empty($_FILES['images']['name'][0])) {
                $uploadedImages = saveJobCardFiles($_FILES['images'], $job_guid, "images");
            }

            // Save inspection photos if provided under inspection_photos[key][]
            if (isset($_FILES['inspection_photos']) && is_array($_FILES['inspection_photos'])) {
                // $_FILES['inspection_photos'] has structure with each key being the inspection key
                foreach ($_FILES['inspection_photos'] as $inspectKey => $fileInfo) {
                    // $fileInfo is an array (name[], tmp_name[], error[], ...)
                    // Save into /uploads/jobcards/<job_guid>/inspection/<inspectKey>/
                    $saved = saveJobCardFiles($fileInfo, $job_guid, "inspection/" . $inspectKey);
                    // Merge into input['inspection'] where key matches
                    foreach ($input['inspection'] as &$it) {
                        if (isset($it['key']) && (string)$it['key'] === (string)$inspectKey) {
                            if (!isset($it['photos']) || !is_array($it['photos'])) $it['photos'] = [];
                            $it['photos'] = array_merge($it['photos'], $saved);
                        }
                    }
                }
            }

            // store inspection photos filenames (sanitize)
            $input['inspection'] = sanitizeInspectionPhotos($input['inspection']);

            // Update DB images & inspection with actual filenames
            $conn->query("UPDATE job_card 
                          SET images='" . $conn->real_escape_string(json_encode($uploadedImages)) . "',
                              inspection='" . $conn->real_escape_string(json_encode($input['inspection'])) . "'
                          WHERE job_guid='$job_guid'");

            echo json_encode([
                "success" => true,
                "job_guid" => $job_guid,
                "jobcardNo" => $jobcardNo
            ]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        break;

    // ----------------------------------------------------
    // PUT — Update job card (supports FormData + files)
    // ----------------------------------------------------
    case 'PUT':
        if (!isset($_GET['job_guid'])) {
            echo json_encode(["success" => false, "message" => "job_guid required"]);
            exit();
        }
        $job_guid = $conn->real_escape_string($_GET['job_guid']);

        // Allowed fields to update
        $allowed = [
            "customer_guid", "vehicle_guid", "branch_id", "repair_category_id",
            "service_type", "arrival_date", "estimate_date", "assign_to",
            "additional_options", "car_markers", "inspection", "parts",
            "labour", "totals", "images", "notes", "complaint", "status", "completed_date"
        ];

        // Get existing images from DB
        $existingImages = [];
        $q = $conn->prepare("SELECT images, inspection FROM job_card WHERE job_guid=?");
        $q->bind_param("s", $job_guid);
        $q->execute();
        $res = $q->get_result();
        if ($row = $res->fetch_assoc()) {
            $existingImages = json_decode($row['images'] ?? '[]', true) ?: [];
            $existingInspection = json_decode($row['inspection'] ?? '[]', true) ?: [];
        } else {
            $existingInspection = [];
        }
        $q->close();

        // Process remove_images (frontend can send JSON string or array in form)
        $removeImages = [];
        if (isset($input['remove_images'])) {
            if (is_string($input['remove_images'])) {
                $decoded = json_decode($input['remove_images'], true);
                $removeImages = is_array($decoded) ? $decoded : [$input['remove_images']];
            } elseif (is_array($input['remove_images'])) {
                $removeImages = $input['remove_images'];
            }
        }

        // Build resulting images: start with existingImages
        $resultImages = $existingImages;

        // Remove any filenames asked to be removed
        if (!empty($removeImages)) {
            $resultImages = array_values(array_filter($resultImages, function($f) use ($removeImages) {
                return !in_array($f, $removeImages);
            }));
            // Optionally delete files from disk
            foreach ($removeImages as $rf) {
                $path = __DIR__ . "/uploads/jobcards/" . $job_guid . "/images/" . basename($rf);
                if (file_exists($path)) @unlink($path);
            }
        }

        // If client provided an explicit existing_images[] list, we honor that (use intersection)
        if (isset($_POST['existing_images']) || isset($input['existing_images'])) {
            // existing_images may be a single string or array
            $clientExisting = [];
            if (isset($_POST['existing_images'])) {
                // when sent as FormData multiple times, PHP exposes each as separate element; ensure array
                $clientExisting = is_array($_POST['existing_images']) ? $_POST['existing_images'] : [$_POST['existing_images']];
            } elseif (isset($input['existing_images']) && is_string($input['existing_images'])) {
                $decoded = json_decode($input['existing_images'], true);
                $clientExisting = is_array($decoded) ? $decoded : [$input['existing_images']];
            } elseif (isset($input['existing_images']) && is_array($input['existing_images'])) {
                $clientExisting = $input['existing_images'];
            }

            // Keep only those existing images that client still has
            $resultImages = array_values(array_intersect($resultImages, $clientExisting));
        }

        // Save new uploaded images (images[])
        if (!empty($_FILES['images']['name'][0])) {
            $saved = saveJobCardFiles($_FILES['images'], $job_guid, "images");
            $resultImages = array_merge($resultImages, $saved);
        }

        // Process inspection JSON from client (maybe stringified)
        if (isset($input['inspection'])) {
            $inspectionInput = is_string($input['inspection']) ? json_decode($input['inspection'], true) : $input['inspection'];
            if (!is_array($inspectionInput)) $inspectionInput = [];
        } else {
            $inspectionInput = $existingInspection;
        }

        // Save inspection photos uploaded under inspection_photos[key][]
        if (isset($_FILES['inspection_photos']) && is_array($_FILES['inspection_photos'])) {
            foreach ($_FILES['inspection_photos'] as $inspectKey => $fileInfo) {
                // Save files for this inspectKey
                $saved = saveJobCardFiles($fileInfo, $job_guid, "inspection/" . $inspectKey);
                // Find matching item in inspectionInput and merge filenames
                foreach ($inspectionInput as &$it) {
                    if (isset($it['key']) && (string)$it['key'] === (string)$inspectKey) {
                        if (!isset($it['photos']) || !is_array($it['photos'])) $it['photos'] = [];
                        $it['photos'] = array_merge($it['photos'], $saved);
                    }
                }
            }
        }

        // sanitize filenames in inspection
        $inspectionInput = sanitizeInspectionPhotos($inspectionInput);

        // Build fields for SQL update
        $fields = [];
        foreach ($input as $key => $value) {
            // skip internal control fields
            if (in_array($key, ['existing_images', 'remove_images', 'inspection_photos'])) continue;

            if (!in_array($key, $allowed)) continue;

            // For inspection/parts/labour/totals that may be strings, convert to JSON string
            if (in_array($key, ['inspection', 'parts', 'labour', 'totals', 'car_markers', 'additional_options', 'images'])) {
                // use prepared data where applicable
                if ($key === 'inspection') {
                    $value = json_encode($inspectionInput);
                } elseif ($key === 'images') {
                    // we'll set images after loop from $resultImages
                    continue;
                } else {
                    // ensure value is JSON string
                    if (is_string($value)) {
                        // assume user sent JSON string
                        $decoded = json_decode($value, true);
                        $value = $decoded === null ? $value : json_encode($decoded);
                    } else {
                        $value = json_encode($value);
                    }
                }
            }

            // Escape and add
            if (!is_string($value) && !is_numeric($value)) $value = (string)$value;
            $value = $conn->real_escape_string($value);
            $fields[] = "`$key` = '$value'";
        }

        // After building fields, always set images and inspection if applicable
        $fields[] = "`images` = '" . $conn->real_escape_string(json_encode($resultImages)) . "'";
        $fields[] = "`inspection` = '" . $conn->real_escape_string(json_encode($inspectionInput)) . "'";

        if (empty($fields)) {
            echo json_encode(["success" => false, "message" => "No valid fields to update"]);
            exit();
        }

        $sql = "UPDATE job_card SET " . implode(", ", $fields) . ", modifiedOn = NOW() WHERE job_guid = '$job_guid'";

        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "message" => "Job card updated"]);
        } else {
            echo json_encode(["success" => false, "message" => $conn->error]);
        }
        break;

    // ----------------------------------------------------
    // PATCH — Update status only
    // ----------------------------------------------------
    case 'PATCH':
        if (!isset($_GET['job_guid']) || !isset($input['status'])) {
            echo json_encode(["success" => false, "message" => "job_guid and status required"]);
            exit();
        }
        $job_guid = $conn->real_escape_string($_GET['job_guid']);
        $status = $conn->real_escape_string($input['status']);
        $completed_date_sql = "";
        if (isset($input['completed_date']) && trim($input['completed_date']) !== "") {
            $cd = $conn->real_escape_string($input['completed_date']);
            $completed_date_sql = ", completed_date='$cd'";
        }
        $conn->query("UPDATE job_card SET status='$status' $completed_date_sql, modifiedOn=NOW() WHERE job_guid='$job_guid'");
        echo json_encode(["success" => true, "message" => "Status updated"]);
        break;

    // ----------------------------------------------------
    // DELETE — soft delete
    // ----------------------------------------------------
    case 'DELETE':
        if (!isset($_GET['job_guid'])) {
            echo json_encode(["success" => false, "message" => "job_guid required"]);
            exit();
        }
        $job_guid = $conn->real_escape_string($_GET['job_guid']);
        $conn->query("UPDATE job_card SET isDeleted=1 WHERE job_guid='$job_guid'");
        echo json_encode(["success" => true, "message" => "Job card deleted"]);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid method"]);
}

$conn->close();
?>
