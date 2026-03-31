<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// CORS Handler function
function handleCors()
{
    // You can restrict origins here (optional)
    $allowedOrigins = ['http://localhost:3000', 'https://your-frontend.com', '*'];

    // Always set headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
    header("Access-Control-Allow-Headers: *");
    header('Access-Control-Allow-Credentials: true');

    // Handle preflight (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit(0);
    }
}


// Handle CORS first
handleCors();

// Then set other headers
header("Content-Type: application/json");

require_once 'config.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = apache_request_headers();
$loggedInUserGuid = null;

if (isset($headers['Authorization'])) {
    $authHeader = trim($headers['Authorization']);

    if (str_starts_with($authHeader, "Bearer ")) {
        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key($jwt_secret, 'HS256'));
            $loggedInUserGuid = $decoded->user_guid;
            $loggedInUserRole = $decoded->role_id ?? 0;

            // Resolve the primary admin_guid for data visibility
            $adminGuid = getAdminGuid($conn, $loggedInUserGuid, $loggedInUserRole);

        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid Token", "details" => $e->getMessage()]);
            exit;
        }
    }
}

if (!$loggedInUserGuid) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}




// Handle JSON input for PUT/PATCH requests
if (isset($_SERVER['CONTENT_TYPE'])) {
    $contentType = $_SERVER['CONTENT_TYPE'];
    if (strpos($contentType, 'application/json') !== false) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $_POST = array_merge($_POST, $data);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];

function generateUUID()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
}

function handleFileUpload($file, $uploadDir)
{
    if (empty($file['name'])) {
        return null;
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $fileType = mime_content_type($file['tmp_name']);

    if (!in_array($fileType, $allowedTypes)) {
        throw new Exception("Only JPG, PNG, and GIF images are allowed");
    }

    if ($file['size'] > 2 * 1024 * 1024) {
        throw new Exception("Image exceeds 2MB size limit");
    }

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = 'user_' . uniqid() . '.' . $ext;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to save uploaded image");
    }

    return $targetPath;
}

function processVehicles($vehicles)
{
    if (is_string($vehicles)) {
        return json_decode($vehicles, true);
    } elseif (is_array($vehicles)) {
        return $vehicles;
    }
    return [];
}

function processNotes($notes)
{
    if (is_string($notes)) {
        return json_decode($notes, true);
    } elseif (is_array($notes)) {
        return $notes;
    }
    return [];
}

// Get user_guid from URL for PUT/DELETE/PATCH
$userGuid = null;
if (isset($_GET['user_guid'])) {
    $userGuid = $conn->real_escape_string($_GET['user_guid']);
} elseif (isset($_POST['user_guid'])) {
    $userGuid = $conn->real_escape_string($_POST['user_guid']);
}

switch ($method) {
    case 'GET':
        try {
            if ($userGuid) {
                // Get user basic info
                $userSql = "SELECT * FROM users 
            WHERE user_guid = '$userGuid' 
            AND admin_guid = '$adminGuid'
            AND isDeleted = FALSE";

                $userResult = $conn->query($userSql);

                if ($userResult->num_rows === 0) {
                    throw new Exception("User not found");
                }

                $user = $userResult->fetch_assoc();
                $userType = $user['user_type'];

                // Get type-specific info
                switch ($userType) {
                    case 'customer':
                        $typeSql = "SELECT * FROM customers WHERE user_guid = '$userGuid'";
                        $vehiclesSql = "
                        SELECT * 
                        FROM vehicles 
                        WHERE user_guid = '$userGuid'
                        AND isDeleted = 0
                        ";
                        $user['vehicles'] = $conn->query($vehiclesSql)->fetch_all(MYSQLI_ASSOC);
                        break;
                    case 'employee':
                        $typeSql = "SELECT *, monthly_salary as monthlySalary, monthly_salary as salary FROM employees WHERE user_guid = '$userGuid'";
                        break;
                    case 'accountant':
                        $typeSql = "SELECT * FROM accountants WHERE user_guid = '$userGuid'";
                        break;
                    case 'support_staff':
                        $typeSql = "SELECT 
                        role, 
                        assigned_area as assignedArea, 
                        joining_date as date_of_joining, 
                        shift_timing as shiftTiming, 
                        emergency_contact as emergencyContact 
                        FROM support_staff WHERE user_guid = '$userGuid'";
                        break;
                }

                $typeResult = $conn->query($typeSql);
                $typeData = $typeResult->fetch_assoc();

                // Get notes
                $notesSql = "SELECT * FROM notes WHERE user_guid = '$userGuid'";
                $user['notes'] = $conn->query($notesSql)->fetch_all(MYSQLI_ASSOC);

                echo json_encode([
                    "status" => "success",
                    "data" => array_merge($user, $typeData)
                ]);
            } else {

                $userType = $_GET['user_type'] ?? null;

                switch ($userType) {

                    case 'employee':
                        $sql = "
                SELECT u.*, e.position, e.department, e.employee_type, 
                       e.date_of_joining, e.monthly_salary, e.monthly_salary as monthlySalary, e.bank_name, 
                       e.account_number, e.ifsc_code, e.pan_number, 
                       e.aadhaar_number, e.employee_code, e.shift_timing,
                       e.reporting_manager, e.work_location
                FROM users u
                LEFT JOIN employees e ON e.user_guid = u.user_guid
                WHERE u.isDeleted = FALSE 
                AND u.admin_guid = '$adminGuid'
                AND u.user_type = 'employee'
                ORDER BY u.createdOn DESC
            ";
                        break;

                    case 'customer':
                        $sql = "
                SELECT u.*, 
                       v.vehicle_guid,
                       v.registration_number AS vehicle_number,
                       v.make AS vehicle_make,
                       v.model AS vehicle_model,
                       v.fuel_type AS vehicle_fuel_type,
                       v.color AS vehicle_color,
                       v.year_of_manufacture AS vehicle_year
                FROM users u
                LEFT JOIN vehicles v ON v.user_guid = u.user_guid AND v.isDeleted = 0
                WHERE u.isDeleted = FALSE 
                AND u.admin_guid = '$adminGuid'
                AND u.user_type = 'customer'
                ORDER BY u.createdOn DESC
            ";
                        break;

                    case 'support_staff':
                        $sql = "
                SELECT u.*, s.role, s.assigned_area, s.joining_date, s.shift_timing, s.emergency_contact
                FROM users u
                LEFT JOIN support_staff s ON s.user_guid = u.user_guid
                WHERE u.isDeleted = FALSE 
                AND u.admin_guid = '$adminGuid'
                AND u.user_type = 'support_staff'
                ORDER BY u.createdOn DESC
            ";
                        break;

                    case 'accountant':
                        $sql = "
                SELECT u.*, a.specialization, a.qualifications
                FROM users u
                LEFT JOIN accountants a ON a.user_guid = u.user_guid
                WHERE u.isDeleted = FALSE 
                AND u.admin_guid = '$adminGuid'
                AND u.user_type = 'accountant'
                ORDER BY u.createdOn DESC
            ";
                        break;

                    default:
                        // default — return basic user list
                        $sql = "
                SELECT * 
                FROM users 
                WHERE isDeleted = FALSE 
                AND admin_guid = '$adminGuid'
                ORDER BY createdOn DESC
            ";
                        break;
                }

                $result = $conn->query($sql);

                $rows = [];
                while ($row = $result->fetch_assoc()) {
                    $rows[] = $row;
                }

                echo json_encode(["status" => "success", "data" => $rows]);
            }


        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            // Determine if this is insert or update based on 'action'
            $action = strtolower($_POST['action'] ?? 'insert');
            // 🔁 Normalize dateOfJoining (frontend) → date_of_joining (backend)
            if (!empty($_POST['dateOfJoining']) && empty($_POST['date_of_joining'])) {
                $_POST['date_of_joining'] = $_POST['dateOfJoining'];
            }

            if (!in_array($action, ['insert', 'update'])) {
                throw new Exception("Invalid action. Use 'insert' or 'update'.");
            }

            $isUpdate = ($action === 'update');

            // If update, require user_guid
            if ($isUpdate) {
                if (empty($_POST['user_guid'])) {
                    throw new Exception("user_guid is required for update");
                }
                $userGuid = $conn->real_escape_string($_POST['user_guid']);
            } else {
                $userGuid = generateUUID();
                $admin_guid = $adminGuid;  // Resolved admin_guid
            }

            $userType = isset($_POST['user_type']) ? $conn->real_escape_string($_POST['user_type']) : 'customer';

            // Handle file upload
            $imagePath = null;
            if (!empty($_FILES['image']['name'])) {
                $imagePath = handleFileUpload($_FILES['image'], 'uploads/users/');
            } elseif ($isUpdate) {
                // Keep existing image if not uploading new one
                $existingImage = $conn->query("SELECT image_path FROM users WHERE user_guid = '$userGuid'")->fetch_assoc();
                $imagePath = $existingImage['image_path'];
            }

            // Start transaction
            $conn->begin_transaction();

            // Insert/update user basic info
            if ($isUpdate) {
                $userSql = "UPDATE users SET 
                first_name = ?, last_name = ?, email = ?, mobile = ?, 
                alternate_mobile = ?, gender = ?, 
                company_name = ?, tax_id = ?, landline = ?, 
                country = ?, state = ?, city = ?, address = ?, 
                permanent_address = ?, image_path = ?, modifiedOn = NOW() 
                WHERE user_guid = ?";
            } else {
                $userSql = "INSERT INTO users (
                user_guid, admin_guid, user_type, first_name, last_name, email, mobile, 
                alternate_mobile, gender, company_name, tax_id, 
                landline, country, state, city, address, permanent_address, 
                image_path, createdOn
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            }

            $stmt = $conn->prepare($userSql);

            $firstName = $_POST['first_name'];
            $lastName = $_POST['last_name'];
            $email = $_POST['email'];
            $mobile = $_POST['mobile'];
            $alternateMobile = $_POST['alternate_mobile'] ?? null;
            $gender = $_POST['gender'] ?? null;
            $companyName = $_POST['company_name'] ?? null;
            $taxId = $_POST['tax_id'] ?? null;
            $landline = $_POST['landline'] ?? null;
            $country = $_POST['country'] ?? null;
            $state = $_POST['state'] ?? null;
            $city = $_POST['city'] ?? null;
            $address = $_POST['address'] ?? null;
            $permanentAddress = $_POST['permanent_address'] ?? null;

            if ($isUpdate) {
                $stmt->bind_param(
                    "ssssssssssssssss",
                    $firstName,
                    $lastName,
                    $email,
                    $mobile,
                    $alternateMobile,
                    $gender,
                    $companyName,
                    $taxId,
                    $landline,
                    $country,
                    $state,
                    $city,
                    $address,
                    $permanentAddress,
                    $imagePath,
                    $userGuid
                );
            } else {
                $stmt->bind_param(
                    "ssssssssssssssssss",
                    $userGuid,
                    $admin_guid,
                    $userType,
                    $firstName,
                    $lastName,
                    $email,
                    $mobile,
                    $alternateMobile,
                    $gender,
                    $companyName,
                    $taxId,
                    $landline,
                    $country,
                    $state,
                    $city,
                    $address,
                    $permanentAddress,
                    $imagePath
                );
            }

            if (!$stmt->execute()) {
                throw new Exception("Failed to save user: " . $stmt->error);
            }

            // Handle type-specific data
            switch ($userType) {
                case 'customer':
                    // Insert/update customer record
                    if ($isUpdate) {
                        $typeSql = "UPDATE customers SET user_guid = ? WHERE user_guid = ?";
                        $stmt = $conn->prepare($typeSql);
                        $stmt->bind_param("ss", $userGuid, $userGuid);
                    } else {
                        $typeSql = "INSERT INTO customers (user_guid) VALUES (?)";
                        $stmt = $conn->prepare($typeSql);
                        $stmt->bind_param("s", $userGuid);
                    }

                    if (!$stmt->execute()) {
                        throw new Exception("Failed to save customer: " . $stmt->error);
                    }

                    // Handle vehicles
                    if (isset($_POST['vehicles'])) {
                        $vehicles = processVehicles($_POST['vehicles']);

                        // Delete existing vehicles if updating
                        if ($isUpdate) {
                            $conn->query("UPDATE vehicles SET isDeleted = 1, isActive = 0 WHERE user_guid = '$userGuid'");
                        }

                        // Insert new vehicles
                        $vehicleSql = "INSERT INTO vehicles (
                            vehicle_guid, user_guid, registration_number, chassis_number, 
                            engine_number, make, model, fuel_type, odometer_reading, 
                            year_of_manufacture, color, transmission_type, 
                            insurance_validity, pollution_cert_validity
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                        $stmt = $conn->prepare($vehicleSql);

                        foreach ($vehicles as $vehicle) {
                            $vehicleGuid = generateUUID();
                            $registrationNumber = $vehicle['registration_number'];
                            $chassisNumber = $vehicle['chassis_number'];
                            $engineNumber = $vehicle['engine_number'];
                            $make = $vehicle['make'];
                            $model = $vehicle['model'];
                            $fuelType = $vehicle['fuel_type'];
                            $odometerReading = $vehicle['odometer_reading'];
                            $yearOfManufacture = $vehicle['year_of_manufacture'];
                            $color = $vehicle['color'];
                            $transmissionType = $vehicle['transmission_type'];
                            $insuranceValidity = $vehicle['insurance_validity'];
                            $pollutionCertValidity = $vehicle['pollution_cert_validity'];

                            $stmt->bind_param(
                                "ssssssssiissss",
                                $vehicleGuid,
                                $userGuid,
                                $registrationNumber,
                                $chassisNumber,
                                $engineNumber,
                                $make,
                                $model,
                                $fuelType,
                                $odometerReading,
                                $yearOfManufacture,
                                $color,
                                $transmissionType,
                                $insuranceValidity,
                                $pollutionCertValidity
                            );

                            if (!$stmt->execute()) {
                                throw new Exception("Failed to save vehicle: " . $stmt->error);
                            }
                        }
                    }
                    break;

                case 'employee':

                    // Required fields
                    $requiredEmployeeFields = ['position', 'department', 'employee_type'];

                    foreach ($requiredEmployeeFields as $field) {
                        if (empty($_POST[$field])) {
                            throw new Exception("$field is required for employees");
                        }
                    }

                    // Map POST values safely
                    $position = $_POST['position'];
                    $department = $_POST['department'];
                    $employeeType = $_POST['employee_type'];
                    $dateOfJoining = $_POST['date_of_joining'] ?? null;
                    $shiftTiming = $_POST['shift_timing'] ?? null;
                    $reportingManager = $_POST['reporting_manager'] ?? null;
                    $workLocation = $_POST['work_location'] ?? null;
                    $monthlySalary = $_POST['monthly_salary'] ?? null;
                    $bankName = $_POST['bank_name'] ?? null;
                    $accountHolderName = $_POST['account_holder_name'] ?? null;
                    $accountNumber = $_POST['account_number'] ?? null;
                    $ifscCode = $_POST['ifsc_code'] ?? null;
                    $panNumber = $_POST['pan_number'] ?? null;
                    $aadhaarNumber = $_POST['aadhaar_number'] ?? null;
                    $status = $_POST['status'] ?? "Active";
                    $employeeCode = $_POST['employee_code'] ?? null;
                    $totalJobsAssigned = $_POST['total_jobs_assigned'] ?? 0;
                    $jobsCompleted = $_POST['jobs_completed'] ?? 0;
                    $customerRating = $_POST['customer_rating'] ?? 0;
                    $attendanceRecord = $_POST['attendance_record'] ?? null;
                    $leaveBalance = $_POST['leave_balance'] ?? 0;

                    if ($isUpdate) {
                        // Check if employee record exists
                        $checkSql = "SELECT user_guid FROM employees WHERE user_guid = ?";
                        $checkStmt = $conn->prepare($checkSql);
                        $checkStmt->bind_param("s", $userGuid);
                        $checkStmt->execute();
                        $exists = $checkStmt->get_result()->num_rows > 0;

                        if ($exists) {
                            // UPDATE EMPLOYEE
                            $typeSql = "
                                UPDATE employees SET
                                    position = ?, 
                                    department = ?, 
                                    employee_type = ?, 
                                    date_of_joining = ?, 
                                    shift_timing = ?, 
                                    reporting_manager = ?, 
                                    work_location = ?, 
                                    monthly_salary = ?, 
                                    bank_name = ?, 
                                    account_holder_name = ?, 
                                    account_number = ?, 
                                    ifsc_code = ?, 
                                    pan_number = ?, 
                                    aadhaar_number = ?, 
                                    status = ?, 
                                    employee_code = ?, 
                                    total_jobs_assigned = ?, 
                                    jobs_completed = ?, 
                                    customer_rating = ?, 
                                    attendance_record = ?, 
                                    leave_balance = ?
                                WHERE user_guid = ?
                            ";

                            $stmt = $conn->prepare($typeSql);
                            $stmt->bind_param(
                                "ssssssssssssssssiidsis",
                                $position, $department, $employeeType, $dateOfJoining,
                                $shiftTiming, $reportingManager, $workLocation, $monthlySalary,
                                $bankName, $accountHolderName, $accountNumber, $ifscCode,
                                $panNumber, $aadhaarNumber, $status, $employeeCode,
                                $totalJobsAssigned, $jobsCompleted, $customerRating,
                                $attendanceRecord, $leaveBalance, $userGuid
                            );
                        } else {
                            // INSERT EMPLOYEE (if record was somehow missing)
                            $typeSql = "
                                INSERT INTO employees (
                                    user_guid, position, department, employee_type, 
                                    date_of_joining, shift_timing, reporting_manager, 
                                    work_location, monthly_salary, bank_name, 
                                    account_holder_name, account_number, ifsc_code, 
                                    pan_number, aadhaar_number, status, employee_code, 
                                    total_jobs_assigned, jobs_completed, customer_rating, 
                                    attendance_record, leave_balance
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ";

                            $stmt = $conn->prepare($typeSql);
                            $stmt->bind_param(
                                "sssssssssssssssssiidsi",
                                $userGuid, $position, $department, $employeeType,
                                $dateOfJoining, $shiftTiming, $reportingManager, $workLocation,
                                $monthlySalary, $bankName, $accountHolderName, $accountNumber,
                                $ifscCode, $panNumber, $aadhaarNumber, $status,
                                $employeeCode, $totalJobsAssigned, $jobsCompleted,
                                $customerRating, $attendanceRecord, $leaveBalance
                            );
                        }
                    } else {
                        // INSERT EMPLOYEE
                        $typeSql = "
                            INSERT INTO employees (
                                user_guid, position, department, employee_type, 
                                date_of_joining, shift_timing, reporting_manager, 
                                work_location, monthly_salary, bank_name, 
                                account_holder_name, account_number, ifsc_code, 
                                pan_number, aadhaar_number, status, employee_code, 
                                total_jobs_assigned, jobs_completed, customer_rating, 
                                attendance_record, leave_balance
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ";

                        $stmt = $conn->prepare($typeSql);
                        $stmt->bind_param(
                            "sssssssssssssssssiidsi",
                            $userGuid, $position, $department, $employeeType,
                            $dateOfJoining, $shiftTiming, $reportingManager, $workLocation,
                            $monthlySalary, $bankName, $accountHolderName, $accountNumber,
                            $ifscCode, $panNumber, $aadhaarNumber, $status,
                            $employeeCode, $totalJobsAssigned, $jobsCompleted,
                            $customerRating, $attendanceRecord, $leaveBalance
                        );
                    }

                    if (!$stmt->execute()) {
                        throw new Exception("Failed to save employee (fixed version): " . $stmt->error);
                    }

                    break;


                case 'accountant':
                    // // Validate required accountant fields
                    // if (empty($_POST['department'])) {
                    //     throw new Exception("department is required for accountants");
                    // }

                    // Store values in variables
                    // $department = $_POST['department'];
                    $specialization = $_POST['specialization'] ?? null;
                    $qualifications = $_POST['qualifications'] ?? null;

                    if ($isUpdate) {
                        $typeSql = "UPDATE accountants SET 
                            specialization = ?, qualifications = ? 
                            WHERE user_guid = ?";
                    } else {
                        $typeSql = "INSERT INTO accountants (
                            user_guid, specialization, qualifications
                        ) VALUES (?, ?, ?)";
                    }

                    $stmt = $conn->prepare($typeSql);

                    if ($isUpdate) {
                        $stmt->bind_param(
                            "sss",
                            $specialization,
                            $qualifications,
                            $userGuid
                        );
                    } else {
                        $stmt->bind_param(
                            "sss",
                            $userGuid,
                            $specialization,
                            $qualifications
                        );
                    }

                    if (!$stmt->execute()) {
                        throw new Exception("Failed to save accountant: " . $stmt->error);
                    }
                    break;

                case 'support_staff':
                    // Validate required support staff fields
                    $requiredSupportFields = ['role', 'assigned_area', 'emergency_contact'];

                    foreach ($requiredSupportFields as $field) {
                        if (empty($_POST[$field])) {
                            throw new Exception("$field is required for support staff");
                        }
                    }

                    // Store values in variables
                    $role = $conn->real_escape_string($_POST['role']);
                    $assignedArea = $conn->real_escape_string($_POST['assigned_area']);
                    $joiningDate = isset($_POST['date_of_joining']) ? $conn->real_escape_string($_POST['date_of_joining']) : null;
                    $shiftTiming = isset($_POST['shift_timing']) ? $conn->real_escape_string($_POST['shift_timing']) : null;
                    $emergencyContact = $conn->real_escape_string($_POST['emergency_contact']);

                    if ($isUpdate) {
                        $typeSql = "UPDATE support_staff SET 
                role = ?, 
                assigned_area = ?, 
                joining_date = ?, 
                shift_timing = ?, 
                emergency_contact = ? 
                WHERE user_guid = ?";
                    } else {
                        $typeSql = "INSERT INTO support_staff (
                user_guid, 
                role, 
                assigned_area, 
                joining_date, 
                shift_timing, 
                emergency_contact
            ) VALUES (?, ?, ?, ?, ?, ?)";
                    }

                    $stmt = $conn->prepare($typeSql);

                    if ($isUpdate) {
                        $stmt->bind_param(
                            "ssssss",
                            $role,
                            $assignedArea,
                            $joiningDate,
                            $shiftTiming,
                            $emergencyContact,
                            $userGuid
                        );
                    } else {
                        $stmt->bind_param(
                            "ssssss",
                            $userGuid,
                            $role,
                            $assignedArea,
                            $joiningDate,
                            $shiftTiming,
                            $emergencyContact
                        );
                    }

                    if (!$stmt->execute()) {
                        throw new Exception("Failed to save support staff: " . $stmt->error);
                    }
                    break;

                default:
                    throw new Exception("Invalid user type");
            }

            // Handle notes
            if (isset($_POST['notes'])) {
                $notes = processNotes($_POST['notes']);

                // Delete existing notes if updating
                if ($isUpdate) {
                    $conn->query("DELETE FROM notes WHERE user_guid = '$userGuid'");
                }

                // Insert new notes
                $noteSql = "INSERT INTO notes (
                    note_guid, user_guid, note_text, file_path, 
                    is_internal, is_shared_with_customer
                ) VALUES (?, ?, ?, ?, ?, ?)";

                $stmt = $conn->prepare($noteSql);

                foreach ($notes as $note) {
                    $noteGuid = generateUUID();
                    $noteText = $note['text'];
                    $isInternal = $note['internal_notes'] ? 1 : 0;
                    $isShared = $note['shared_with_customer'] ? 1 : 0;

                    // Handle note file upload if exists
                    $filePath = null;
                    if (isset($note['file']) && is_array($note['file']) && !empty($note['file']['name'])) {
                        $filePath = handleFileUpload($note['file'], 'uploads/notes/');
                    }

                    $stmt->bind_param(
                        "ssssii",
                        $noteGuid,
                        $userGuid,
                        $noteText,
                        $filePath,
                        $isInternal,
                        $isShared
                    );

                    if (!$stmt->execute()) {
                        throw new Exception("Failed to save note: " . $stmt->error);
                    }
                }
            }

            // ✅ SAVE USER STATUS (ACTIVE / INACTIVE)
            if (isset($_POST['isActive'])) {
                $isActive = $_POST['isActive'] === "1" ? 1 : 0;

                $statusSql = "UPDATE users SET isActive = ? WHERE user_guid = ?";
                $statusStmt = $conn->prepare($statusSql);
                $statusStmt->bind_param("is", $isActive, $userGuid);

                if (!$statusStmt->execute()) {
                    throw new Exception("Failed to update user status");
                }
            }


            // Commit transaction
            $conn->commit();

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => $isUpdate ? 'User updated successfully' : 'User created successfully',
                'user_guid' => $userGuid,
                'image_path' => $imagePath
            ]);
            exit;
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            // Get vehicle_guid and user_guid
            $vehicleGuid = $_GET['vehicle_guid'] ?? null;
            $userGuid    = $_GET['user_guid'] ?? null;

            if (!$userGuid) {
                throw new Exception("user_guid required");
            }

            $conn->begin_transaction();

            // 1. Check user type
            $typeRes = $conn->query("SELECT user_type FROM users WHERE user_guid = '$userGuid' AND isDeleted = FALSE");
            if ($typeRes->num_rows === 0) throw new Exception("User not found or already deleted");
            $uRow = $typeRes->fetch_assoc();
            $uType = $uRow['user_type'];

            // 2. Logic for Customer with Vehicle
            if ($uType === 'customer' && $vehicleGuid) {
                // Count active vehicles
                $countSql = "SELECT COUNT(*) as total FROM vehicles WHERE user_guid = '$userGuid' AND isDeleted = 0";
                $result = $conn->query($countSql);
                $vRow = $result->fetch_assoc();

                if ($vRow['total'] > 1) {
                    // Just delete this vehicle
                    $conn->query("UPDATE vehicles SET isDeleted = 1, isActive = 0 WHERE vehicle_guid = '$vehicleGuid'");
                } else {
                    // Delete the only vehicle and the user
                    $conn->query("UPDATE vehicles SET isDeleted = 1, isActive = 0 WHERE vehicle_guid = '$vehicleGuid'");
                    $conn->query("UPDATE users SET isDeleted = 1, isActive = 0 WHERE user_guid = '$userGuid'");
                    $conn->query("UPDATE customers SET isDeleted = 1 WHERE user_guid = '$userGuid'");
                }
            } 
            // 3. Logic for Employee/Staff (No Vehicle or direct deletion)
            else {
                // Soft delete user
                $conn->query("UPDATE users SET isDeleted = 1, isActive = 0 WHERE user_guid = '$userGuid'");
                
                // Soft delete related type info (if table exists)
                if ($uType === 'employee') {
                    $conn->query("UPDATE employees SET isDeleted = 1 WHERE user_guid = '$userGuid'");
                } else if ($uType === 'support_staff') {
                   // $conn->query("UPDATE support_staff SET isDeleted = 1 WHERE user_guid = '$userGuid'");
                } else if ($uType === 'accountant') {
                   // $conn->query("UPDATE accountants SET isDeleted = 1 WHERE user_guid = '$userGuid'");
                } else if ($uType === 'customer') {
                    $conn->query("UPDATE customers SET isDeleted = 1 WHERE user_guid = '$userGuid'");
                    $conn->query("UPDATE vehicles SET isDeleted = 1 WHERE user_guid = '$userGuid'");
                }
            }

            $conn->commit();

            echo json_encode([
                "status" => "success",
                "message" => "Record deleted correctly"
            ]);

        } catch (Exception $e) {

            $conn->rollback();

            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);

        }

        break;

    case 'PATCH':
        try {
            if (!$userGuid) {
                throw new Exception("user_guid is required");
            }

            $action = strtolower($_POST['action'] ?? '');

            switch ($action) {
                case 'activate':
                    $sql = "UPDATE users SET is_active = TRUE WHERE user_guid = '$userGuid'";
                    break;
                case 'deactivate':
                    $sql = "UPDATE users SET is_active = FALSE WHERE user_guid = '$userGuid'";
                    break;
                default:
                    throw new Exception("Invalid action");
            }

            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "User status updated"]);
            } else {
                throw new Exception($conn->error);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not supported"]);
        break;
}

$conn->close();
?>