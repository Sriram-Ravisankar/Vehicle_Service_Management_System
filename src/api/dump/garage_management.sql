-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2026 at 09:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `garage_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `branch_id` int(11) NOT NULL,
  `admin_guid` char(36) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `branch_code` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(150) DEFAULT NULL,
  `state` varchar(150) DEFAULT NULL,
  `country` varchar(150) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `is_head_office` tinyint(1) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdOn` datetime DEFAULT NULL,
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`branch_id`, `admin_guid`, `branch_name`, `branch_code`, `contact_number`, `email`, `address`, `city`, `state`, `country`, `image_path`, `is_head_office`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'TorqueAce Automotive', 'BR-001', '+919360524673', 'torq1automotive@gmail.com', '5/229 main road, Sitheripattu', 'Kallakurichi', 'Tamil Nadu', 'India', 'uploads/branches/images/img_1774452741_carlogo.jpeg', 1, NULL, 0, '2026-03-12 17:52:36', '2026-03-25 21:05:02'),
(2, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'ZedOne Automotive', 'BR-002', '+919360524673', 'zed1automotive@gmail.com', '5/229 main road, Sitheripattu\r\nSankarapuram (taluk)', 'Kallakurichi', 'Tamil Nadu', 'India', '', 0, 0, 1, '2026-03-27 10:21:20', '2026-03-27 12:59:52');

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `state_id` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `modifiedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `city_id`, `city_name`, `state_id`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 1, 'Ariyalur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(2, 2, 'Chengalpattu', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(3, 3, 'Chennai', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(4, 4, 'Coimbatore', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(5, 5, 'Cuddalore', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(6, 6, 'Dharmapuri', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(7, 7, 'Dindigul', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(8, 8, 'Erode', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(9, 9, 'Kallakurichi', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(10, 10, 'Kanchipuram', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(11, 11, 'Kanyakumari', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(12, 12, 'Karur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(13, 13, 'Krishnagiri', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(14, 14, 'Madurai', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(15, 15, 'Nagapattinam', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(16, 16, 'Namakkal', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(17, 17, 'Nilgiris', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(18, 18, 'Perambalur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(19, 19, 'Pudukkottai', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(20, 20, 'Ramanathapuram', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(21, 21, 'Ranipet', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(22, 22, 'Salem', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(23, 23, 'Sivaganga', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(24, 24, 'Tenkasi', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(25, 25, 'Thanjavur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(26, 26, 'Theni', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(27, 27, 'Thoothukudi', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(28, 28, 'Tiruchirappalli', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(29, 29, 'Tirunelveli', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(30, 30, 'Tirupathur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(31, 31, 'Tiruppur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(32, 32, 'Tiruvallur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(33, 33, 'Tiruvannamalai', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(34, 34, 'Tiruvarur', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(35, 35, 'Vellore', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(36, 36, 'Viluppuram', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(37, 37, 'Virudhunagar', 1, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(38, 38, 'Alappuzha', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(39, 39, 'Ernakulam', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(40, 40, 'Idukki', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(41, 41, 'Kannur', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(42, 42, 'Kasaragod', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(43, 43, 'Kollam', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(44, 44, 'Kottayam', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(45, 45, 'Kozhikode', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(46, 46, 'Malappuram', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(47, 47, 'Palakkad', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(48, 48, 'Pathanamthitta', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(49, 49, 'Thiruvananthapuram', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(50, 50, 'Thrissur', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(51, 51, 'Wayanad', 2, 1, 0, '2025-07-25 04:59:58', '2025-07-25 04:59:58'),
(52, 52, 'Andheri', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:51:09'),
(53, 53, 'Bandra', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:51:19'),
(54, 54, 'Dadar', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:20'),
(55, 55, 'Borivali', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:26'),
(56, 56, 'Kurla', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:31'),
(57, 57, 'Malad', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:34'),
(58, 58, 'Goregaon', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:38'),
(59, 59, 'Chembur', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:42'),
(60, 60, 'Powai', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:46'),
(61, 61, 'Colaba', 5, 1, 0, '2026-03-29 07:42:07', '2026-03-29 07:52:50');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `isDeleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `user_guid`, `isDeleted`) VALUES
(1, '818c1877-f99d-425a-97b0-41ce4a6369b2', 0),
(2, '0d7c43a1-8c13-4a66-937f-53ba06f53b6b', 0),
(3, '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', 0),
(4, '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 0),
(5, '302e61cd-2b3d-4f38-8988-3e5a3a18b7f8', 0),
(6, '7c1b423d-02d7-48f4-8726-4e71f4956c03', 0),
(7, '6e3a1427-db66-4806-aeaa-b240289b1a31', 0),
(8, '232408a0-915b-43be-9d9b-bfe0d86bfded', 0);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `position` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `employee_type` varchar(50) NOT NULL,
  `date_of_joining` date DEFAULT NULL,
  `shift_timing` varchar(100) DEFAULT NULL,
  `reporting_manager` varchar(100) DEFAULT NULL,
  `work_location` varchar(255) DEFAULT NULL,
  `monthly_salary` decimal(10,2) DEFAULT 0.00,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_holder_name` varchar(150) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `aadhaar_number` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `employee_code` varchar(50) DEFAULT NULL,
  `total_jobs_assigned` int(11) DEFAULT 0,
  `jobs_completed` int(11) DEFAULT 0,
  `customer_rating` decimal(3,2) DEFAULT 0.00,
  `attendance_record` text DEFAULT NULL,
  `leave_balance` int(11) DEFAULT 0,
  `isDeleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_guid`, `position`, `department`, `employee_type`, `date_of_joining`, `shift_timing`, `reporting_manager`, `work_location`, `monthly_salary`, `bank_name`, `account_holder_name`, `account_number`, `ifsc_code`, `pan_number`, `aadhaar_number`, `status`, `employee_code`, `total_jobs_assigned`, `jobs_completed`, `customer_rating`, `attendance_record`, `leave_balance`, `isDeleted`) VALUES
(1, '6bdbed3a-62ae-430f-9acb-2714d3f348f1', 'Mechanic', 'Service', 'Full-Time', '2026-03-27', '', '', 'TorqueAce Automotive', 25000.00, 'Indian Bank', 'Ramesh R', '987654321515', 'HDFC0123456', 'SBIIN3214H', '', 'active', 'EMP-01', 0, 0, 0.00, '', 0, 0),
(2, 'c0eb1917-d04f-4de2-ab40-b57153076cc4', 'Manager', 'Admin', 'Full-Time', '2026-03-26', '', '', '', 30000.00, 'Indian Bank', 'Ram', '987654321', 'HDFC0123454', 'SBIIN3214V', '', 'active', 'EMP-02', 0, 0, 0.00, '', 0, 0),
(3, 'c59efe50-d773-40d3-a4e2-0e32136d5ca6', 'Mechanic', 'Service', 'Full-Time', '2026-03-27', '', 'Ram', 'TorqueAce Automotive', 20000.00, 'Indian Bank', 'Ragu R', '78524521452', 'HDFC0122456', 'SBIIN3214R', '', 'active', 'EMP-03', 0, 0, 0.00, '', 0, 0),
(4, '15d3101f-2316-466b-8793-5a5e7c04109e', 'Mechanic', 'Repair', 'Full-Time', '2000-05-02', '', 'Ram', 'TorqueAce Automotive', 15000.00, 'hdfc', 'vignesh', '987654321585', 'HDFC0023454', 'SBIIN3218Y', '', 'active', 'EMP-04', 0, 0, 0.00, '', 0, 0),
(5, '751b07de-25c4-4d41-ac4c-95e7c411a0e6', 'Mechanic', 'Repair', 'Full-Time', '2026-03-10', '', '', '', 15000.00, 'IOB', 'Nivin', '6992887419', 'IOBO0123456', 'SBIIN3214Y', '', 'active', 'EMP-05', 0, 0, 0.00, '', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `id` int(11) NOT NULL,
  `invoice_guid` varchar(60) NOT NULL,
  `invoice_no` varchar(30) NOT NULL,
  `quotation_guid` varchar(60) DEFAULT NULL,
  `job_guid` varchar(60) DEFAULT NULL,
  `customer_guid` varchar(60) DEFAULT NULL,
  `vehicle_guid` varchar(60) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `totals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `payment_method` varchar(80) DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_by` varchar(60) DEFAULT NULL,
  `created_on` datetime DEFAULT current_timestamp(),
  `admin_guid` varchar(60) DEFAULT NULL,
  `isdelete` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`id`, `invoice_guid`, `invoice_no`, `quotation_guid`, `job_guid`, `customer_guid`, `vehicle_guid`, `items`, `totals`, `payment_method`, `paid_amount`, `notes`, `created_by`, `created_on`, `admin_guid`, `isdelete`) VALUES
(1, 'IN69c76e979e2a4', 'INV-0001', 'QT69c76bb81232b', '30b70f43-222b-4b9a-9d61-4394d752068f', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'af02adb9-7208-468c-93f6-f6f17defcf9d', '[{\"id\":1774677651230.667,\"category\":\"Product\",\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":2,\"price\":2150,\"total\":4300},{\"id\":1774677651230.4602,\"category\":\"Product\",\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"price\":220,\"total\":220},{\"id\":1774677651230.592,\"category\":\"Product\",\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"price\":480,\"total\":480},{\"id\":1774677651230.5183,\"category\":\"Product\",\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":2,\"price\":4800,\"total\":9600},{\"id\":1774677651230.1013,\"category\":\"Product\",\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":1,\"price\":420,\"total\":420},{\"id\":1774677651230.5942,\"category\":\"Product\",\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"price\":4200,\"total\":4200},{\"id\":1774677651230.6052,\"category\":\"Product\",\"product_id\":\"15\",\"name\":\"Mini Fuse Box Kit\",\"qty\":1,\"price\":150,\"total\":150},{\"id\":1774677651230.4211,\"category\":\"Service\",\"name\":\"Ramesh\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"qty\":1,\"price\":300,\"total\":300}]', '{\"subtotal\":18401.5,\"discountType\":\"percent\",\"discountPercent\":5,\"gstPercent\":18,\"grandTotal\":22014}', 'UPI', 22014.00, '', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '2026-03-28 11:30:55', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(2, 'IN69c8ae2754c82', 'INV-0002', 'QT69c76d1859f8e', '16e4274f-c8bf-44f7-9ba9-87ad28f9d882', '0d7c43a1-8c13-4a66-937f-53ba06f53b6b', '07f65584-14f7-42da-81e0-b8b1be646349', '[{\"id\":1774759435670.3665,\"category\":\"Product\",\"product_id\":\"11\",\"name\":\"Front Shocker Pair\",\"qty\":1,\"price\":3800,\"total\":3800},{\"id\":1774759435670.8108,\"category\":\"Product\",\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"price\":420,\"total\":840},{\"id\":1774759435670.0647,\"category\":\"Product\",\"product_id\":\"12\",\"name\":\"Lower Arm Bush Kit\",\"qty\":2,\"price\":650,\"total\":1300},{\"id\":1774759435670.3079,\"category\":\"Product\",\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":2,\"price\":4800,\"total\":9600},{\"id\":1774759435670.0442,\"category\":\"Product\",\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"price\":480,\"total\":480},{\"id\":1774759435670.6243,\"category\":\"Service\",\"name\":\"Ragu R\",\"mechanic_guid\":\"c59efe50-d773-40d3-a4e2-0e32136d5ca6\",\"qty\":1,\"price\":300,\"total\":300}]', '{\"subtotal\":15219,\"discountType\":\"percent\",\"discountPercent\":5,\"gstPercent\":18,\"grandTotal\":18258}', 'Cash', 18258.00, '', 'c59efe50-d773-40d3-a4e2-0e32136d5ca6', '2026-03-29 10:14:23', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(3, 'IN69c8b06888fee', 'INV-0003', 'QT69c76deb6e3f1', '6a8a36a5-3c3c-4262-b027-43a936a4a844', '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', '175c5658-2365-46e3-bfb0-055b6e51af25', '[{\"id\":1774760032365.7153,\"category\":\"Product\",\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":2,\"price\":2150,\"total\":4300},{\"id\":1774760032365.7559,\"category\":\"Product\",\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"price\":220,\"total\":220},{\"id\":1774760032365.0999,\"category\":\"Product\",\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"price\":480,\"total\":480},{\"id\":1774760032365.702,\"category\":\"Product\",\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"price\":980,\"total\":980},{\"id\":1774760032365.9763,\"category\":\"Product\",\"product_id\":\"5\",\"name\":\"Rear Brake Shoe Kit\",\"qty\":2,\"price\":1150,\"total\":2300},{\"id\":1774760032365.4023,\"category\":\"Product\",\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"price\":3450,\"total\":3450},{\"id\":1774760032365.6863,\"category\":\"Product\",\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":4,\"price\":6250,\"total\":25000},{\"id\":1774760032365.4087,\"category\":\"Service\",\"name\":\"vignesh R\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"qty\":1,\"price\":300,\"total\":300}]', '{\"subtotal\":34893.5,\"discountType\":\"percent\",\"discountPercent\":5,\"gstPercent\":18,\"grandTotal\":41474}', '', 41474.00, '', '15d3101f-2316-466b-8793-5a5e7c04109e', '2026-03-29 10:24:00', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(4, 'IN69c8b701f2742', 'INV-0004', 'QT69c8b6185776e', '917a9276-861e-41cd-9732-d92829cd4375', '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 'f367e86e-320e-456b-924c-2ee768f6bcac', '[{\"id\":1774761717747.498,\"category\":\"Product\",\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":2,\"price\":4800,\"total\":9600},{\"id\":1774761717747.8997,\"category\":\"Product\",\"product_id\":\"9\",\"name\":\"Metal Tyre Valve\",\"qty\":2,\"price\":80,\"total\":160},{\"id\":1774761717747.9897,\"category\":\"Product\",\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"price\":2150,\"total\":6450},{\"id\":1774761717747.258,\"category\":\"Product\",\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"price\":220,\"total\":220},{\"id\":1774761717747.128,\"category\":\"Product\",\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"price\":980,\"total\":980},{\"id\":1774761717747.8494,\"category\":\"Product\",\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"price\":3450,\"total\":3450},{\"id\":1774761717747.3855,\"category\":\"Product\",\"product_id\":\"10\",\"name\":\"Radiator Coolant\",\"qty\":4,\"price\":190,\"total\":760},{\"id\":1774761717747.0522,\"category\":\"Product\",\"product_id\":\"11\",\"name\":\"Front Shocker Pair\",\"qty\":1,\"price\":3800,\"total\":3800},{\"id\":1774761717747.2793,\"category\":\"Service\",\"name\":\"vignesh\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"qty\":1,\"price\":300,\"total\":300}]', '{\"subtotal\":25420,\"discountType\":\"percent\",\"discountPercent\":0,\"gstPercent\":18,\"grandTotal\":30296}', 'UPI', 30296.00, '', '15d3101f-2316-466b-8793-5a5e7c04109e', '2026-03-29 10:52:09', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(5, 'IN69c9220162cdb', 'INV-0005', 'QT69c8e9fad0c6a', 'e72a854e-8b48-434a-adae-220552c02b2f', '302e61cd-2b3d-4f38-8988-3e5a3a18b7f8', '785fe78f-ba51-4b4c-9940-055d08ea5249', '[{\"id\":1774789101196.7705,\"category\":\"Product\",\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"price\":4200,\"total\":4200},{\"id\":1774789101196.6636,\"category\":\"Product\",\"product_id\":\"15\",\"name\":\"Mini Fuse Box Kit\",\"qty\":1,\"price\":150,\"total\":150},{\"id\":1774789101196.4702,\"category\":\"Product\",\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"price\":420,\"total\":840},{\"id\":1774789101196.4006,\"category\":\"Product\",\"product_id\":\"7\",\"name\":\"Michelin 185/65 R15 Tyre\",\"qty\":4,\"price\":4800,\"total\":19200},{\"id\":1774789101196.2332,\"category\":\"Product\",\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"price\":2150,\"total\":6450},{\"id\":1774789101196.8018,\"category\":\"Product\",\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"price\":220,\"total\":220},{\"id\":1774789101196.3965,\"category\":\"Product\",\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"price\":3450,\"total\":3450},{\"id\":1774789101196.147,\"category\":\"Product\",\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"price\":980,\"total\":980},{\"id\":1774789101196.736,\"category\":\"Product\",\"product_id\":\"5\",\"name\":\"Rear Brake Shoe Kit\",\"qty\":1,\"price\":1150,\"total\":1150},{\"id\":1774789101196.583,\"category\":\"Service\",\"name\":\"Vignesh S\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"qty\":1,\"price\":1500,\"total\":1500}]', '{\"subtotal\":36640,\"discountType\":\"percent\",\"discountPercent\":0,\"gstPercent\":18,\"grandTotal\":44735}', 'Card', 44735.00, '', '15d3101f-2316-466b-8793-5a5e7c04109e', '2026-03-29 18:28:41', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(6, 'IN69c925b26d92d', 'INV-0006', 'QT69c923fedf1f3', 'e73046e7-1028-40e0-a69c-75ba0d99411f', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'af02adb9-7208-468c-93f6-f6f17defcf9d', '[{\"id\":1774790054604.3115,\"category\":\"Product\",\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"price\":420,\"total\":840},{\"id\":1774790054604.7368,\"category\":\"Product\",\"product_id\":\"11\",\"name\":\"Front Shocker Pair\",\"qty\":1,\"price\":3800,\"total\":3800},{\"id\":1774790054604.2542,\"category\":\"Product\",\"product_id\":\"12\",\"name\":\"Lower Arm Bush Kit\",\"qty\":2,\"price\":650,\"total\":1300},{\"id\":1774790054604.176,\"category\":\"Product\",\"product_id\":\"10\",\"name\":\"Radiator Coolant\",\"qty\":4,\"price\":190,\"total\":760},{\"id\":1774790054604.8354,\"category\":\"Service\",\"name\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"qty\":1,\"price\":900,\"total\":900}]', '{\"subtotal\":6700,\"discountType\":\"percent\",\"discountPercent\":0,\"gstPercent\":18,\"grandTotal\":8806}', 'Cash', 8806.00, '', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '2026-03-29 18:44:26', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(7, 'IN69c926ff64f0a', 'INV-0007', 'QT69c9260b2a6d1', '696b241e-0209-4245-9978-a86d0fa7de12', '6e3a1427-db66-4806-aeaa-b240289b1a31', 'e612d8dd-83d5-499d-8b35-19762a43c286', '[{\"id\":1774790396328.4167,\"category\":\"Product\",\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"price\":2150,\"total\":6450},{\"id\":1774790396328.1562,\"category\":\"Product\",\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"price\":220,\"total\":220},{\"id\":1774790396328.5115,\"category\":\"Product\",\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"price\":480,\"total\":480},{\"id\":1774790396328.3938,\"category\":\"Product\",\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"price\":420,\"total\":840},{\"id\":1774790396328.8684,\"category\":\"Product\",\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"price\":4200,\"total\":4200},{\"id\":1774790396328.0942,\"category\":\"Product\",\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":1,\"price\":4800,\"total\":4800},{\"id\":1774790396328.1428,\"category\":\"Product\",\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"price\":3450,\"total\":3450},{\"id\":1774790396328.567,\"category\":\"Service\",\"name\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"qty\":1,\"price\":1500,\"total\":1500}]', '{\"subtotal\":20440,\"discountType\":\"percent\",\"discountPercent\":0,\"gstPercent\":18,\"grandTotal\":25619}', 'Online', 25619.00, '', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '2026-03-29 18:49:59', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(8, 'IN69c927914820c', 'INV-0008', 'QT69c922eb551eb', 'bcbce76c-bbb3-47f9-b7e8-27e8659b0185', '7c1b423d-02d7-48f4-8726-4e71f4956c03', '0d14774b-c2f2-48de-8dd9-11ef4dde82ab', '[{\"id\":1774790479296.284,\"category\":\"Product\",\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"price\":4200,\"total\":4200},{\"id\":1774790479296.4116,\"category\":\"Product\",\"product_id\":\"9\",\"name\":\"Metal Tyre Valve\",\"qty\":4,\"price\":80,\"total\":320},{\"id\":1774790479296.464,\"category\":\"Product\",\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":1,\"price\":420,\"total\":420},{\"id\":1774790479296.8562,\"category\":\"Product\",\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":2,\"price\":2150,\"total\":4300},{\"id\":1774790479296.561,\"category\":\"Product\",\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"price\":220,\"total\":220},{\"id\":1774790479296.3867,\"category\":\"Product\",\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"price\":3450,\"total\":3450},{\"id\":1774790479296.1436,\"category\":\"Product\",\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":4,\"price\":980,\"total\":3920},{\"id\":1774790479296.7246,\"category\":\"Service\",\"name\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"qty\":1,\"price\":1500,\"total\":1500}]', '{\"subtotal\":16830,\"discountType\":\"percent\",\"discountPercent\":0,\"gstPercent\":18,\"grandTotal\":21359}', 'Card', 26587.00, '', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '2026-03-29 18:52:25', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0);

-- --------------------------------------------------------

--
-- Table structure for table `jobcard_sequence`
--

CREATE TABLE `jobcard_sequence` (
  `id` int(11) NOT NULL,
  `prefix` varchar(3) NOT NULL,
  `from_year` year(4) NOT NULL,
  `to_year` year(4) NOT NULL,
  `last_number` int(11) NOT NULL DEFAULT 0,
  `modifiedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `jobcard_sequence`
--

INSERT INTO `jobcard_sequence` (`id`, `prefix`, `from_year`, `to_year`, `last_number`, `modifiedOn`) VALUES
(2, 'JOB', '2025', '2026', 27, '2026-03-31 06:56:32');

-- --------------------------------------------------------

--
-- Table structure for table `job_card`
--

CREATE TABLE `job_card` (
  `id` int(11) NOT NULL,
  `job_guid` varchar(36) NOT NULL,
  `customer_guid` varchar(36) NOT NULL,
  `vehicle_guid` varchar(36) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `admin_guid` varchar(36) NOT NULL,
  `jobcardNo` varchar(50) NOT NULL,
  `EntryDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `repair_category_id` int(11) NOT NULL,
  `service_type` enum('Paid','Free') NOT NULL,
  `additional_options` varchar(225) DEFAULT NULL,
  `arrival_date` date DEFAULT NULL,
  `estimate_date` date DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `assign_to` varchar(100) DEFAULT NULL,
  `car_markers` longtext DEFAULT NULL,
  `inspection` longtext DEFAULT NULL,
  `complaint` text DEFAULT NULL,
  `parts` longtext DEFAULT NULL,
  `labour` longtext DEFAULT NULL,
  `totals` longtext DEFAULT NULL,
  `images` longtext DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(100) DEFAULT 'Approval Pending',
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `modifiedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `job_card`
--

INSERT INTO `job_card` (`id`, `job_guid`, `customer_guid`, `vehicle_guid`, `branch_id`, `admin_guid`, `jobcardNo`, `EntryDate`, `repair_category_id`, `service_type`, `additional_options`, `arrival_date`, `estimate_date`, `completed_date`, `assign_to`, `car_markers`, `inspection`, `complaint`, `parts`, `labour`, `totals`, `images`, `notes`, `status`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, '30b70f43-222b-4b9a-9d61-4394d752068f', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'af02adb9-7208-468c-93f6-f6f17defcf9d', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000019-2025-2026', '2026-03-28 05:48:32', 1, 'Paid', '[]', '2026-03-28', '2026-03-30', '2026-03-28 00:00:00', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '[Electrical] Check battery voltage and terminal corrosion', '[{\"id\":1774676761079,\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":2,\"rate\":2150,\"amount\":4300},{\"id\":1774676772861,\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":1774676778503,\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":1774676784286,\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":2,\"rate\":4800,\"amount\":9600},{\"id\":1774676791308,\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":1,\"rate\":420,\"amount\":420},{\"id\":1774676809257,\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":1774676815652,\"product_id\":\"15\",\"name\":\"Mini Fuse Box Kit\",\"qty\":1,\"rate\":150,\"amount\":150}]', '[{\"id\":1774676761080,\"title\":\"Ramesh\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":19370,\"labourTotal\":300,\"subtotal\":19370,\"discountType\":\"percent\",\"discountValue\":5,\"discountAmount\":968.5,\"gstRate\":18,\"includeGST\":true,\"gst\":3312.27,\"grandTotal\":22014}', '[]', '', 'Completed', 1, 0, '2026-03-28 05:48:32', '2026-03-28 06:00:48'),
(2, '16e4274f-c8bf-44f7-9ba9-87ad28f9d882', '0d7c43a1-8c13-4a66-937f-53ba06f53b6b', '07f65584-14f7-42da-81e0-b8b1be646349', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000020-2025-2026', '2026-03-28 05:54:28', 1, 'Paid', '[]', '2026-03-28', '2026-03-31', '2026-03-29 00:00:00', 'c59efe50-d773-40d3-a4e2-0e32136d5ca6', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":true,\"note\":\"\",\"photos\":[]}]', '[Tires] Measure tire tread depth (minimum 1.6mm)', '[{\"id\":1774677145342,\"product_id\":\"11\",\"name\":\"Front Shocker Pair\",\"qty\":1,\"rate\":3800,\"amount\":3800},{\"id\":1774677172406,\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":1774677180072,\"product_id\":\"12\",\"name\":\"Lower Arm Bush Kit\",\"qty\":2,\"rate\":650,\"amount\":1300},{\"id\":1774677186205,\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":2,\"rate\":4800,\"amount\":9600},{\"id\":1774677194831,\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"rate\":480,\"amount\":480}]', '[{\"id\":1774677145343,\"title\":\"Ragu R\",\"mechanic_guid\":\"c59efe50-d773-40d3-a4e2-0e32136d5ca6\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":16020,\"labourTotal\":300,\"subtotal\":16020,\"discountType\":\"percent\",\"discountValue\":5,\"discountAmount\":801,\"gstRate\":18,\"includeGST\":true,\"gst\":2739.42,\"grandTotal\":18258}', '[]', '', 'Completed', 1, 0, '2026-03-28 05:54:28', '2026-03-29 04:43:53'),
(3, '6a8a36a5-3c3c-4262-b027-43a936a4a844', '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', '175c5658-2365-46e3-bfb0-055b6e51af25', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000021-2025-2026', '2026-03-28 05:58:00', 1, 'Paid', '[]', '2026-03-28', '2026-04-01', '2026-03-29 00:00:00', '15d3101f-2316-466b-8793-5a5e7c04109e', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '[Brakes] Inspect rear brake shoe wear', '[{\"id\":1774677403567,\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":2,\"rate\":2150,\"amount\":4300},{\"id\":1774677409929,\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":1774677413158,\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":1774677417750,\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"rate\":980,\"amount\":980},{\"id\":1774677424226,\"product_id\":\"5\",\"name\":\"Rear Brake Shoe Kit\",\"qty\":1,\"rate\":1150,\"amount\":1150},{\"id\":1774677430878,\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"rate\":3450,\"amount\":3450}]', '[{\"id\":1774677403568,\"title\":\"vignesh R\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":10580,\"labourTotal\":300,\"subtotal\":10580,\"discountType\":\"percent\",\"discountValue\":5,\"discountAmount\":529,\"gstRate\":18,\"includeGST\":true,\"gst\":1809.18,\"grandTotal\":12160}', '[]', '', 'Completed', 1, 0, '2026-03-28 05:58:00', '2026-03-29 05:02:56'),
(4, '917a9276-861e-41cd-9732-d92829cd4375', '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 'f367e86e-320e-456b-924c-2ee768f6bcac', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000022-2025-2026', '2026-03-29 05:17:57', 1, 'Paid', '[]', '2026-03-29', '2026-03-31', '2026-03-29 00:00:00', '15d3101f-2316-466b-8793-5a5e7c04109e', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '[Suspension] Inspect steering rack for clicking noise', '[{\"id\":1774761250048,\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":2,\"rate\":4800,\"amount\":9600},{\"id\":1774761261584,\"product_id\":\"9\",\"name\":\"Metal Tyre Valve\",\"qty\":2,\"rate\":80,\"amount\":160},{\"id\":1774761285169,\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":1774761301412,\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":1774761311178,\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"rate\":980,\"amount\":980},{\"id\":1774761321090,\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":1774761325602,\"product_id\":\"10\",\"name\":\"Radiator Coolant\",\"qty\":4,\"rate\":190,\"amount\":760},{\"id\":1774761343618,\"product_id\":\"11\",\"name\":\"Front Shocker Pair\",\"qty\":1,\"rate\":3800,\"amount\":3800}]', '[{\"id\":1774761250049,\"title\":\"vignesh\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":25420,\"labourTotal\":300,\"subtotal\":25420,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":4575.6,\"grandTotal\":30296}', '[]', '', 'Completed', 1, 0, '2026-03-29 05:17:57', '2026-03-29 08:28:57'),
(5, 'e72a854e-8b48-434a-adae-220552c02b2f', '302e61cd-2b3d-4f38-8988-3e5a3a18b7f8', '785fe78f-ba51-4b4c-9940-055d08ea5249', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000023-2025-2026', '2026-03-29 08:59:31', 1, 'Paid', '[]', '2026-03-29', '2026-04-02', '2026-03-29 00:00:00', '15d3101f-2316-466b-8793-5a5e7c04109e', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '', '[{\"id\":1774774600668,\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":1774774605815,\"product_id\":\"15\",\"name\":\"Mini Fuse Box Kit\",\"qty\":1,\"rate\":150,\"amount\":150},{\"id\":1774774616188,\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":1774774620477,\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":4,\"rate\":4800,\"amount\":19200},{\"id\":1774774628814,\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":1774774636394,\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":1774774641552,\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":1774774672959,\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"rate\":980,\"amount\":980},{\"id\":1774774681248,\"product_id\":\"5\",\"name\":\"Rear Brake Shoe Kit\",\"qty\":1,\"rate\":1150,\"amount\":1150}]', '[{\"id\":1774774600669,\"title\":\"Vignesh S\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"hours\":5,\"rate\":300,\"amount\":1500}]', '{\"partsTotal\":36640,\"labourTotal\":1500,\"subtotal\":36640,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":6595.2,\"grandTotal\":44735}', '[]', '', 'Completed', 1, 0, '2026-03-29 08:59:31', '2026-03-29 12:58:19'),
(6, 'bcbce76c-bbb3-47f9-b7e8-27e8659b0185', '7c1b423d-02d7-48f4-8726-4e71f4956c03', '0d14774b-c2f2-48de-8dd9-11ef4dde82ab', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000024-2025-2026', '2026-03-29 13:02:29', 1, 'Paid', '[]', '2026-03-29', '2026-04-03', '2026-03-30 00:00:00', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '[Brakes] Check brake rotor surface for scoring', '[{\"id\":1774789210909,\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":1774789219599,\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":1,\"rate\":4800,\"amount\":4800},{\"id\":1774789226490,\"product_id\":\"9\",\"name\":\"Metal Tyre Valve\",\"qty\":4,\"rate\":80,\"amount\":320},{\"id\":1774789231645,\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":1774789236624,\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":1774789244734,\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":1774789263751,\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":1774789268623,\"product_id\":\"4\",\"name\":\"Front Brake Pad Set \",\"qty\":1,\"rate\":980,\"amount\":980}]', '[{\"id\":1774789210910,\"title\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":5,\"rate\":300,\"amount\":1500}]', '{\"partsTotal\":21260,\"labourTotal\":1500,\"subtotal\":21260,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":3826.8,\"grandTotal\":26587}', '[]', '', 'Completed', 1, 0, '2026-03-29 13:02:29', '2026-03-30 05:18:18'),
(7, 'e73046e7-1028-40e0-a69c-75ba0d99411f', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'af02adb9-7208-468c-93f6-f6f17defcf9d', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000025-2025-2026', '2026-03-29 13:07:08', 2, 'Paid', '[]', '2026-03-29', '2026-03-31', '2026-03-29 00:00:00', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":true,\"note\":\"\",\"photos\":[]}]', '[Brakes] Check brake rotor surface for scoring', '[{\"id\":1774789550357,\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":1774789558908,\"product_id\":\"11\",\"name\":\"Front Shocker Pair\",\"qty\":1,\"rate\":3800,\"amount\":3800},{\"id\":1774789571783,\"product_id\":\"12\",\"name\":\"Lower Arm Bush Kit\",\"qty\":2,\"rate\":650,\"amount\":1300},{\"id\":1774789582410,\"product_id\":\"10\",\"name\":\"Radiator Coolant\",\"qty\":4,\"rate\":190,\"amount\":760}]', '[{\"id\":1774789550358,\"title\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":3,\"rate\":300,\"amount\":900}]', '{\"partsTotal\":6700,\"labourTotal\":900,\"subtotal\":6700,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":1206,\"grandTotal\":8806}', '[]', '', 'Approval Pending', 1, 0, '2026-03-29 13:07:08', '2026-03-30 05:17:49'),
(8, '696b241e-0209-4245-9978-a86d0fa7de12', '6e3a1427-db66-4806-aeaa-b240289b1a31', 'e612d8dd-83d5-499d-8b35-19762a43c286', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000026-2025-2026', '2026-03-29 13:15:52', 1, 'Paid', '[]', '2026-03-29', '2026-03-31', '2026-03-29 00:00:00', '6bdbed3a-62ae-430f-9acb-2714d3f348f1', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '', '[{\"id\":1774789933952,\"product_id\":\"1\",\"name\":\"Synthetic Engine Oil \",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":1774789940634,\"product_id\":\"2\",\"name\":\"Premium Oil Filter\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":1774789944205,\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":1774789947758,\"product_id\":\"13\",\"name\":\"Headlight Bulb (H4-White)\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":1774789952669,\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":1774789982309,\"product_id\":\"7\",\"name\":\"Michelin 185\\/65 R15 Tyre\",\"qty\":1,\"rate\":4800,\"amount\":4800},{\"id\":1774790126333,\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"rate\":3450,\"amount\":3450}]', '[{\"id\":1774789933953,\"title\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":5,\"rate\":300,\"amount\":1500}]', '{\"partsTotal\":20440,\"labourTotal\":1500,\"subtotal\":20440,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":3679.2,\"grandTotal\":25619}', '[]', '', 'Completed', 1, 0, '2026-03-29 13:15:52', '2026-03-30 06:32:43'),
(9, '781ef105-f47b-419f-ac03-c918c8c90950', '232408a0-915b-43be-9d9b-bfe0d86bfded', '8d359a7a-fd62-4ef4-8898-06b5c43ae2ec', 1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'JOB000027-2025-2026', '2026-03-31 06:56:32', 1, 'Paid', '[]', '2026-03-31', '2026-04-02', NULL, 'c59efe50-d773-40d3-a4e2-0e32136d5ca6', '[]', '[{\"key\":\"engine_noise\",\"label\":\"Engine Noise\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"oil_leak\",\"label\":\"Oil Leak\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"body_damage\",\"label\":\"Body Damage\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"electrical\",\"label\":\"Electrical\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"brake\",\"label\":\"Brake\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"clutch\",\"label\":\"Clutch\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"ac\",\"label\":\"Ac\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"suspension\",\"label\":\"Suspension\",\"checked\":true,\"note\":\"\",\"photos\":[]},{\"key\":\"steering\",\"label\":\"Steering\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"tyre\",\"label\":\"Tyre\",\"checked\":false,\"note\":\"\",\"photos\":[]},{\"key\":\"lights\",\"label\":\"Lights\",\"checked\":false,\"note\":\"\",\"photos\":[]}]', '', '[{\"id\":1774940087013,\"product_id\":\"17\",\"name\":\"NGK Iridium Spark Plug\",\"qty\":1,\"rate\":600,\"amount\":600},{\"id\":1774940092575,\"product_id\":\"3\",\"name\":\"Engine Air Filter\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":1774940099233,\"product_id\":\"14\",\"name\":\"Exide Power Battery (12V)\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":1774940115682,\"product_id\":\"10\",\"name\":\"Radiator Coolant\",\"qty\":2,\"rate\":190,\"amount\":380},{\"id\":1774940131455,\"product_id\":\"6\",\"name\":\"Clutch Plate Assembly\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":1774940143277,\"product_id\":\"5\",\"name\":\"Rear Brake Shoe Kit\",\"qty\":1,\"rate\":1150,\"amount\":1150}]', '[{\"id\":1774940087014,\"title\":\"Ragu R\",\"mechanic_guid\":\"c59efe50-d773-40d3-a4e2-0e32136d5ca6\",\"hours\":5,\"rate\":300,\"amount\":1500}]', '{\"partsTotal\":10260,\"labourTotal\":1500,\"subtotal\":10260,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":1846.8,\"grandTotal\":13607}', '[]', '', 'Work In Progress', 1, 0, '2026-03-31 06:56:32', '2026-03-31 07:06:53');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `note_guid` char(36) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `note_text` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `is_shared_with_customer` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `permission_name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `permission_name`, `description`, `createdOn`) VALUES
(9, 'view_dashboard', 'Access dashboard overview', '2025-11-23 10:40:10'),
(10, 'view_inventory', 'View inventory section', '2025-11-23 10:40:10'),
(11, 'manage_products', 'Manage all products', '2025-11-23 10:40:10'),
(12, 'manage_purchase', 'Manage purchase section', '2025-11-23 10:40:10'),
(13, 'manage_stock', 'Manage stock items', '2025-11-23 10:40:10'),
(14, 'manage_users', 'Manage all users', '2025-11-23 10:40:10'),
(15, 'view_customers', 'View customer list', '2025-11-23 10:40:10'),
(16, 'view_employees', 'View employee list', '2025-11-23 10:40:10'),
(17, 'view_support_staff', 'View support staff', '2025-11-23 10:40:10'),
(18, 'view_accountants', 'View accountants', '2025-11-23 10:40:10'),
(19, 'view_services', 'View services', '2025-11-23 10:40:10'),
(20, 'view_quotations', 'View quotations', '2025-11-23 10:40:10'),
(21, 'view_invoices', 'View invoices', '2025-11-23 10:40:10'),
(22, 'view_reports', 'View reports', '2025-11-23 10:40:10'),
(23, 'view_branches', 'View branches', '2025-11-23 10:40:10'),
(24, 'manage_workers', 'Manage workers', '2025-11-23 10:40:10'),
(25, 'manage_settings', 'Manage profile/settings', '2025-11-23 10:40:10'),
(26, 'manage_suppliers', 'Permission to manage supplier details', '2025-11-24 00:15:56'),
(27, 'manage_job_card', 'Allows user to create, update, and delete services, quotation and invoice ', '2026-01-19 05:50:37'),
(28, 'manage_User_settings', 'Allows user to create, update, and user profile ', '2026-01-19 05:50:37');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_number` varchar(100) NOT NULL,
  `admin_guid` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `unit` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `branch` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `supplier` int(11) NOT NULL,
  `warranty` varchar(100) DEFAULT NULL,
  `note_text` text DEFAULT NULL,
  `note_file_path` varchar(255) DEFAULT NULL,
  `internal_note` tinyint(1) DEFAULT 0,
  `shared_with_customer` tinyint(1) DEFAULT 0,
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_number`, `admin_guid`, `product_name`, `unit`, `image`, `purchase_date`, `branch`, `price`, `selling_price`, `supplier`, `warranty`, `note_text`, `note_file_path`, `internal_note`, `shared_with_customer`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 'PRD-0001', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Synthetic Engine Oil ', 3, NULL, '2026-03-27', '1', 2150.00, 2950.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:08:49', '2026-03-27 22:08:49'),
(2, 'PRD-0002', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Premium Oil Filter', 2, NULL, '2026-03-27', '1', 220.00, 450.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:09:37', '2026-03-27 22:09:37'),
(3, 'PRD-0003', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Engine Air Filter', 2, NULL, '2026-03-27', '1', 480.00, 780.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:11:27', '2026-03-27 22:11:27'),
(4, 'PRD-0004', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Front Brake Pad Set ', 1, NULL, '2026-03-27', '1', 980.00, 1550.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:12:30', '2026-03-27 22:12:30'),
(5, 'PRD-0005', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Rear Brake Shoe Kit', 4, NULL, '2026-03-27', '1', 1150.00, 1850.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:13:09', '2026-03-27 22:13:09'),
(6, 'PRD-0006', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Clutch Plate Assembly', 2, NULL, '2026-03-27', '1', 3450.00, 4500.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:14:09', '2026-03-27 22:14:09'),
(7, 'PRD-0007', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Michelin 185/65 R15 Tyre', 1, NULL, '2026-03-27', '1', 4800.00, 6250.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:15:29', '2026-03-27 22:15:29'),
(8, 'PRD-0008', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Standard Tyre Tube', 1, NULL, '2026-03-27', '1', 450.00, 750.00, 0, '', NULL, NULL, 0, 0, 1, 1, '2026-03-27 22:16:00', '2026-03-29 19:40:29'),
(9, 'PRD-0009', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Metal Tyre Valve', 2, NULL, '2026-03-27', '1', 80.00, 120.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-27 22:16:31', '2026-03-27 22:16:31'),
(10, 'PRD-0010', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Radiator Coolant', 3, NULL, '2026-03-28', '1', 190.00, 380.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-28 10:29:00', '2026-03-28 10:29:00'),
(11, 'PRD-0011', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Front Shocker Pair', 4, NULL, '2026-03-28', '1', 3800.00, 4999.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-28 10:29:33', '2026-03-28 10:29:33'),
(12, 'PRD-0012', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Lower Arm Bush Kit', 4, NULL, '2026-03-28', '1', 650.00, 999.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-28 10:30:09', '2026-03-28 10:30:09'),
(13, 'PRD-0013', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Headlight Bulb (H4-White)', 2, NULL, '2026-03-28', '1', 420.00, 750.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-28 10:30:50', '2026-03-28 10:30:50'),
(14, 'PRD-0014', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Exide Power Battery (12V)', 2, NULL, '2026-03-28', '1', 4200.00, 5950.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-28 10:31:35', '2026-03-28 10:31:35'),
(15, 'PRD-0015', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Mini Fuse Box Kit', 4, NULL, '2026-03-28', '1', 150.00, 250.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-28 10:32:00', '2026-03-28 10:32:00'),
(16, 'PRD-0016', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'NGK Iridium Spark Plug', 2, NULL, '2026-03-28', '1', 150.00, 300.00, 0, '', NULL, NULL, 0, 0, 1, 1, '2026-03-28 12:38:44', '2026-03-29 11:09:16'),
(17, 'PRD-0017', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'NGK Iridium Spark Plug', 2, NULL, '2026-03-29', '1', 600.00, 900.00, 0, '', NULL, NULL, 0, 0, 1, 0, '2026-03-29 21:21:59', '2026-03-29 21:21:59');

-- --------------------------------------------------------

--
-- Table structure for table `profile_crud`
--

CREATE TABLE `profile_crud` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `userName` varchar(20) DEFAULT NULL,
  `email` varchar(30) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password` varchar(225) DEFAULT NULL,
  `encrypted_password` varbinary(255) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `state_id` varchar(20) DEFAULT NULL,
  `city_id` varchar(30) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `profile_image` varchar(225) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `isdeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `profile_crud`
--

INSERT INTO `profile_crud` (`id`, `user_guid`, `role_id`, `userName`, `email`, `phone_number`, `password`, `encrypted_password`, `address`, `state_id`, `city_id`, `pincode`, `profile_image`, `isActive`, `isdeleted`, `createdOn`, `modifiedOn`) VALUES
(23, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 1, 'sriram', 'sriram@gmail.com', '9876521434', '$2y$10$VZdsvpxAAi8zcyCoaNR2U.pGnIApjiWLEthj7701rseV3hzxBSeu2', NULL, '', '1', '9', '606206', NULL, 1, 0, '2026-02-26 14:28:26', '2026-03-30 12:28:23'),
(29, 'c0eb1917-d04f-4de2-ab40-b57153076cc4', 2, 'Ram_R', 'ram@gmail.com', '7895236419', '$2y$10$TIsmJ7FBNlqLlW/8KThAQ.I/9K92bhjnKbK/NAtwjijoakgQ.8UIK', 0x0add0643a1ce9561c347486d06dee335, NULL, NULL, NULL, NULL, NULL, 1, 0, '2026-03-27 22:35:32', '2026-03-27 22:35:32'),
(30, '6bdbed3a-62ae-430f-9acb-2714d3f348f1', 4, 'Ramesh_R', 'ramesh@gmail.com', '7896542315', '$2y$10$OzyZGTOSynFz0YG6Y0SbieEYjnHcWt/Kicbxr/grG.I0osWjb/SqG', 0x3277ab7362542d3f46d33041ba5321c9, NULL, NULL, NULL, NULL, NULL, 1, 0, '2026-03-27 22:36:05', '2026-03-27 22:36:05'),
(31, '15d3101f-2316-466b-8793-5a5e7c04109e', 4, 'vignesh_s', 'vignesh@gmail.com', '9660524862', '$2y$10$sWWbee3GCg3wk52ZhgdYH.lSsWYdma4vdtexESRJ4ovlXoJHzignG', 0x6aa636cdf77c42e50fce93e5587d4390, NULL, NULL, NULL, NULL, NULL, 1, 0, '2026-03-28 11:20:24', '2026-03-28 11:20:24'),
(32, 'c59efe50-d773-40d3-a4e2-0e32136d5ca6', 4, 'Ragu_R', 'ragu@gmail.com', '9875641235', '$2y$10$Er8Rh9JVpz49FXAILxQuZu4cMt7FjOZdHTNtPH.voVehYLsxT1ZbC', 0xc9a50da272930bd4a332765e85523525, NULL, NULL, NULL, NULL, NULL, 1, 0, '2026-03-28 11:20:54', '2026-03-28 11:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `purchase_id` int(11) NOT NULL,
  `admin_guid` varchar(255) NOT NULL,
  `purchase_no` varchar(100) NOT NULL,
  `supplier` int(11) NOT NULL,
  `branch` int(11) DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `landline_no` varchar(20) DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `billing_address` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `note_text` text DEFAULT NULL,
  `note_file_path` varchar(255) DEFAULT NULL,
  `internal_note` tinyint(1) DEFAULT 0,
  `shared_with_customer` tinyint(1) DEFAULT 0,
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`purchase_id`, `admin_guid`, `purchase_no`, `supplier`, `branch`, `purchase_date`, `landline_no`, `mobile_no`, `email`, `billing_address`, `image_path`, `note_text`, `note_file_path`, `internal_note`, `shared_with_customer`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'PUR-0001', 4, 1, '2026-03-28', '', '8521364975', 'KarthiElectronics@gmail.com', 'Chennai', '', '', '', 0, 0, 1, 0, '2026-03-28 10:33:27', '2026-03-29 11:02:42'),
(2, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'PUR-0002', 5, 1, '2026-03-28', '', '8975642315', 'sureshautospares@gmail.com', 'coimbatore', '', '', '', 0, 0, 1, 0, '2026-03-28 10:36:47', '2026-03-29 21:46:03'),
(3, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'PUR-0003', 3, 1, '2026-03-28', '', '9874563219', 'michelin@gmail.com', 'chennai', '', '', '', 0, 0, 1, 0, '2026-03-28 10:37:53', '2026-03-29 20:47:58'),
(4, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'PUR-0004', 2, 1, '2026-03-28', '', '9874563214', 'autoparts@gmail.com', 'chennai', '', '', '', 0, 0, 1, 0, '2026-03-28 10:39:25', '2026-03-29 11:01:40'),
(5, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'PUR-0005', 1, 1, '2026-03-28', '', '9876543214', 'velanautomobiles@gmail.com', 'chennai', '', '', '', 0, 0, 1, 0, '2026-03-28 10:40:26', '2026-03-29 11:01:05'),
(6, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'PUR-0006', 7, 1, '2026-03-29', '', '9876541236', 'rr@gmail.com', '', '', '', '', 0, 0, 1, 0, '2026-03-29 21:45:14', '2026-03-29 21:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `item_id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`item_id`, `purchase_id`, `product_id`, `quantity`, `price`, `amount`, `createdOn`, `modifiedOn`) VALUES
(1, 1, 13, 10, 420.00, 4200.00, '2026-03-28 10:33:27', '2026-03-29 11:02:42'),
(2, 1, 14, 15, 4200.00, 63000.00, '2026-03-28 10:33:27', '2026-03-28 10:33:27'),
(3, 1, 15, 10, 150.00, 1500.00, '2026-03-28 10:33:27', '2026-03-29 11:02:42'),
(4, 2, 12, 10, 650.00, 6500.00, '2026-03-28 10:36:47', '2026-03-29 11:02:25'),
(5, 2, 11, 15, 3800.00, 57000.00, '2026-03-28 10:36:47', '2026-03-28 10:36:47'),
(6, 2, 10, 10, 190.00, 1900.00, '2026-03-28 10:36:47', '2026-03-29 11:02:25'),
(7, 3, 9, 10, 80.00, 800.00, '2026-03-28 10:37:53', '2026-03-29 11:02:01'),
(8, 3, 7, 20, 4800.00, 96000.00, '2026-03-28 10:37:53', '2026-03-29 20:05:50'),
(10, 4, 5, 10, 1150.00, 11500.00, '2026-03-28 10:39:25', '2026-03-29 11:01:40'),
(11, 4, 6, 15, 3450.00, 51750.00, '2026-03-28 10:39:25', '2026-03-28 10:39:25'),
(12, 4, 4, 10, 980.00, 9800.00, '2026-03-28 10:39:25', '2026-03-29 11:01:40'),
(13, 5, 3, 10, 480.00, 4800.00, '2026-03-28 10:40:26', '2026-03-29 11:00:42'),
(14, 5, 1, 15, 2150.00, 32250.00, '2026-03-28 10:40:26', '2026-03-28 10:40:26'),
(15, 5, 2, 10, 220.00, 2200.00, '2026-03-28 10:40:26', '2026-03-29 11:00:42'),
(17, 6, 17, 20, 600.00, 12000.00, '2026-03-29 21:45:14', '2026-03-29 21:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `quotation`
--

CREATE TABLE `quotation` (
  `id` int(11) NOT NULL,
  `quotation_guid` varchar(60) NOT NULL,
  `quotation_no` varchar(20) NOT NULL,
  `job_guid` varchar(60) NOT NULL,
  `customer_guid` varchar(60) DEFAULT NULL,
  `vehicle_guid` varchar(60) DEFAULT NULL,
  `parts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `labour` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `totals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(60) DEFAULT NULL,
  `created_on` datetime DEFAULT current_timestamp(),
  `updated_on` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(100) DEFAULT 'Approval Pending',
  `admin_guid` varchar(60) DEFAULT NULL,
  `isdelete` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `quotation`
--

INSERT INTO `quotation` (`id`, `quotation_guid`, `quotation_no`, `job_guid`, `customer_guid`, `vehicle_guid`, `parts`, `labour`, `totals`, `notes`, `created_by`, `created_on`, `updated_on`, `status`, `admin_guid`, `isdelete`) VALUES
(1, 'QT69c76bb81232b', 'Q-0001', '30b70f43-222b-4b9a-9d61-4394d752068f', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'af02adb9-7208-468c-93f6-f6f17defcf9d', '[{\"id\":0.472367975703767,\"name\":\"Synthetic Engine Oil \",\"product_id\":\"1\",\"qty\":2,\"rate\":2150,\"amount\":4300},{\"id\":0.6916463431987198,\"name\":\"Premium Oil Filter\",\"product_id\":\"2\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":0.37369334254036357,\"name\":\"Engine Air Filter\",\"product_id\":\"3\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":0.6476812398540288,\"name\":\"Michelin 185/65 R15 Tyre\",\"product_id\":\"7\",\"qty\":2,\"rate\":4800,\"amount\":9600},{\"id\":0.7291858697275894,\"name\":\"Headlight Bulb (H4-White)\",\"product_id\":\"13\",\"qty\":1,\"rate\":420,\"amount\":420},{\"id\":0.226422520862124,\"name\":\"Exide Power Battery (12V)\",\"product_id\":\"14\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":0.31740733330845816,\"name\":\"Mini Fuse Box Kit\",\"product_id\":\"15\",\"qty\":1,\"rate\":150,\"amount\":150}]', '[{\"id\":0.6318709671313595,\"title\":\"Ramesh\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":19370,\"labourTotal\":300,\"subtotal\":19370,\"discountType\":\"percent\",\"discountValue\":5,\"discountAmount\":968.5,\"gstRate\":18,\"includeGST\":true,\"gst\":3312.27,\"grandTotal\":22014}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-28 11:18:40', '2026-03-28 11:30:48', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(2, 'QT69c76d1859f8e', 'Q-0002', '16e4274f-c8bf-44f7-9ba9-87ad28f9d882', '0d7c43a1-8c13-4a66-937f-53ba06f53b6b', '07f65584-14f7-42da-81e0-b8b1be646349', '[{\"id\":0.6512532999139626,\"name\":\"Front Shocker Pair\",\"product_id\":\"11\",\"qty\":1,\"rate\":3800,\"amount\":3800},{\"id\":0.24591844109702088,\"name\":\"Headlight Bulb (H4-White)\",\"product_id\":\"13\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":0.35711642852318637,\"name\":\"Lower Arm Bush Kit\",\"product_id\":\"12\",\"qty\":2,\"rate\":650,\"amount\":1300},{\"id\":0.6217642436733323,\"name\":\"Michelin 185/65 R15 Tyre\",\"product_id\":\"7\",\"qty\":2,\"rate\":4800,\"amount\":9600},{\"id\":0.5265301740970854,\"name\":\"Engine Air Filter\",\"product_id\":\"3\",\"qty\":1,\"rate\":480,\"amount\":480}]', '[{\"id\":0.49657658837369223,\"title\":\"Ragu R\",\"mechanic_guid\":\"c59efe50-d773-40d3-a4e2-0e32136d5ca6\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":16020,\"labourTotal\":300,\"subtotal\":16020,\"discountType\":\"percent\",\"discountValue\":5,\"discountAmount\":801,\"gstRate\":18,\"includeGST\":true,\"gst\":2739.42,\"grandTotal\":18258}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-28 11:24:32', '2026-03-29 10:13:53', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(3, 'QT69c76deb6e3f1', 'Q-0003', '6a8a36a5-3c3c-4262-b027-43a936a4a844', '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', '175c5658-2365-46e3-bfb0-055b6e51af25', '[{\"id\":0.1440013336999848,\"name\":\"Synthetic Engine Oil \",\"product_id\":\"1\",\"qty\":2,\"rate\":2150,\"amount\":4300},{\"id\":0.03923716018404466,\"name\":\"Premium Oil Filter\",\"product_id\":\"2\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":0.31798773065309016,\"name\":\"Engine Air Filter\",\"product_id\":\"3\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":0.26781618690610376,\"name\":\"Front Brake Pad Set \",\"product_id\":\"4\",\"qty\":\"2\",\"rate\":980,\"amount\":1960},{\"id\":0.41570681088342243,\"name\":\"Rear Brake Shoe Kit\",\"product_id\":\"5\",\"qty\":\"2\",\"rate\":1150,\"amount\":2300},{\"id\":0.6606988323759778,\"name\":\"Clutch Plate Assembly\",\"product_id\":\"6\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":1774759597686,\"product_id\":\"7\",\"name\":\"Michelin 185/65 R15 Tyre\",\"qty\":\"4\",\"rate\":6250,\"amount\":25000}]', '[{\"id\":0.9195098525907638,\"title\":\"vignesh R\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":37710,\"labourTotal\":300,\"subtotal\":37710,\"discountType\":\"percent\",\"discountValue\":5,\"discountAmount\":1885.5,\"gstRate\":18,\"includeGST\":true,\"gst\":6448.41,\"grandTotal\":42573}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-28 11:28:03', '2026-03-29 10:32:56', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(4, 'QT69c8b6185776e', 'Q-0004', '917a9276-861e-41cd-9732-d92829cd4375', '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 'f367e86e-320e-456b-924c-2ee768f6bcac', '[{\"id\":0.4687373190736155,\"name\":\"Michelin 185/65 R15 Tyre\",\"product_id\":\"7\",\"qty\":2,\"rate\":4800,\"amount\":9600},{\"id\":0.6756456972907892,\"name\":\"Metal Tyre Valve\",\"product_id\":\"9\",\"qty\":2,\"rate\":80,\"amount\":160},{\"id\":0.7326491426627599,\"name\":\"Synthetic Engine Oil \",\"product_id\":\"1\",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":0.7026195310591019,\"name\":\"Premium Oil Filter\",\"product_id\":\"2\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":0.07405785731772141,\"name\":\"Front Brake Pad Set \",\"product_id\":\"4\",\"qty\":1,\"rate\":980,\"amount\":980},{\"id\":0.6170090730703355,\"name\":\"Clutch Plate Assembly\",\"product_id\":\"6\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":0.9251295784678004,\"name\":\"Radiator Coolant\",\"product_id\":\"10\",\"qty\":4,\"rate\":190,\"amount\":760},{\"id\":0.9433950342450323,\"name\":\"Front Shocker Pair\",\"product_id\":\"11\",\"qty\":1,\"rate\":3800,\"amount\":3800}]', '[{\"id\":0.022066236020668817,\"title\":\"vignesh\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"hours\":1,\"rate\":300,\"amount\":300}]', '{\"partsTotal\":25420,\"labourTotal\":300,\"subtotal\":25420,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":4575.6,\"grandTotal\":30296}', '', 'c0eb1917-d04f-4de2-ab40-b57153076cc4', '2026-03-29 10:48:16', '2026-03-29 10:51:55', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(5, 'QT69c8e9fad0c6a', 'Q-0005', 'e72a854e-8b48-434a-adae-220552c02b2f', '302e61cd-2b3d-4f38-8988-3e5a3a18b7f8', '785fe78f-ba51-4b4c-9940-055d08ea5249', '[{\"id\":0.8433100718978124,\"name\":\"Exide Power Battery (12V)\",\"product_id\":\"14\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":0.33252129176836853,\"name\":\"Mini Fuse Box Kit\",\"product_id\":\"15\",\"qty\":1,\"rate\":150,\"amount\":150},{\"id\":0.28285030139590384,\"name\":\"Headlight Bulb (H4-White)\",\"product_id\":\"13\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":0.23385699517333436,\"name\":\"Michelin 185/65 R15 Tyre\",\"product_id\":\"7\",\"qty\":4,\"rate\":4800,\"amount\":19200},{\"id\":0.5705675935106407,\"name\":\"Synthetic Engine Oil \",\"product_id\":\"1\",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":0.03928787435114922,\"name\":\"Premium Oil Filter\",\"product_id\":\"2\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":0.218380957823733,\"name\":\"Clutch Plate Assembly\",\"product_id\":\"6\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":0.5688467527097864,\"name\":\"Front Brake Pad Set \",\"product_id\":\"4\",\"qty\":1,\"rate\":980,\"amount\":980},{\"id\":0.03517167862271453,\"name\":\"Rear Brake Shoe Kit\",\"product_id\":\"5\",\"qty\":1,\"rate\":1150,\"amount\":1150}]', '[{\"id\":0.321052590004291,\"title\":\"Vignesh S\",\"mechanic_guid\":\"15d3101f-2316-466b-8793-5a5e7c04109e\",\"hours\":1,\"rate\":1500,\"amount\":1500}]', '{\"partsTotal\":36640,\"labourTotal\":1500,\"subtotal\":36640,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":6595.2,\"grandTotal\":44735}', '', 'c0eb1917-d04f-4de2-ab40-b57153076cc4', '2026-03-29 14:29:38', '2026-03-29 18:28:19', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(6, 'QT69c922eb551eb', 'Q-0006', 'bcbce76c-bbb3-47f9-b7e8-27e8659b0185', '7c1b423d-02d7-48f4-8726-4e71f4956c03', '0d14774b-c2f2-48de-8dd9-11ef4dde82ab', '[{\"id\":0.08041445847329876,\"name\":\"Exide Power Battery (12V)\",\"product_id\":\"14\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":0.4857545824349999,\"name\":\"Michelin 185/65 R15 Tyre\",\"product_id\":\"7\",\"qty\":1,\"rate\":4800,\"amount\":4800},{\"id\":0.6124422275246304,\"name\":\"Metal Tyre Valve\",\"product_id\":\"9\",\"qty\":4,\"rate\":80,\"amount\":320},{\"id\":0.9071627818278227,\"name\":\"Headlight Bulb (H4-White)\",\"product_id\":\"13\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":0.5492578443619067,\"name\":\"Synthetic Engine Oil \",\"product_id\":\"1\",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":0.36243864537344317,\"name\":\"Premium Oil Filter\",\"product_id\":\"2\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":0.9773835903125018,\"name\":\"Clutch Plate Assembly\",\"product_id\":\"6\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":0.5686007829808,\"name\":\"Front Brake Pad Set \",\"product_id\":\"4\",\"qty\":1,\"rate\":980,\"amount\":980}]', '[{\"id\":0.5678548859343182,\"title\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":1,\"rate\":1500,\"amount\":1500}]', '{\"partsTotal\":21260,\"labourTotal\":1500,\"subtotal\":21260,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":3826.8,\"grandTotal\":26587}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-29 18:32:35', '2026-03-30 10:48:18', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(7, 'QT69c923fedf1f3', 'Q-0007', 'e73046e7-1028-40e0-a69c-75ba0d99411f', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'af02adb9-7208-468c-93f6-f6f17defcf9d', '[{\"id\":0.41273761635796025,\"name\":\"Headlight Bulb (H4-White)\",\"product_id\":\"13\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":0.13132014563351535,\"name\":\"Front Shocker Pair\",\"product_id\":\"11\",\"qty\":1,\"rate\":3800,\"amount\":3800},{\"id\":0.7323659637348394,\"name\":\"Lower Arm Bush Kit\",\"product_id\":\"12\",\"qty\":2,\"rate\":650,\"amount\":1300},{\"id\":0.8801787158207333,\"name\":\"Radiator Coolant\",\"product_id\":\"10\",\"qty\":4,\"rate\":190,\"amount\":760}]', '[{\"id\":0.43442155881206823,\"title\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":1,\"rate\":900,\"amount\":900}]', '{\"partsTotal\":6700,\"labourTotal\":900,\"subtotal\":6700,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":1206,\"grandTotal\":8806}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-29 18:37:10', '2026-03-30 10:47:49', 'Approval Pending', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(8, 'QT69c9260b2a6d1', 'Q-0008', '696b241e-0209-4245-9978-a86d0fa7de12', '6e3a1427-db66-4806-aeaa-b240289b1a31', 'e612d8dd-83d5-499d-8b35-19762a43c286', '[{\"id\":0.49168657659138626,\"name\":\"Synthetic Engine Oil \",\"product_id\":\"1\",\"qty\":3,\"rate\":2150,\"amount\":6450},{\"id\":0.4163574655764726,\"name\":\"Premium Oil Filter\",\"product_id\":\"2\",\"qty\":1,\"rate\":220,\"amount\":220},{\"id\":0.4877975807339907,\"name\":\"Engine Air Filter\",\"product_id\":\"3\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":0.05963349203779644,\"name\":\"Headlight Bulb (H4-White)\",\"product_id\":\"13\",\"qty\":2,\"rate\":420,\"amount\":840},{\"id\":0.7280016653343232,\"name\":\"Exide Power Battery (12V)\",\"product_id\":\"14\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":0.6652414785079672,\"name\":\"Michelin 185/65 R15 Tyre\",\"product_id\":\"7\",\"qty\":1,\"rate\":4800,\"amount\":4800},{\"id\":0.19752041360465034,\"name\":\"Clutch Plate Assembly\",\"product_id\":\"6\",\"qty\":1,\"rate\":3450,\"amount\":3450}]', '[{\"id\":0.6680636877361377,\"title\":\"Ramesh R\",\"mechanic_guid\":\"6bdbed3a-62ae-430f-9acb-2714d3f348f1\",\"hours\":1,\"rate\":1500,\"amount\":1500}]', '{\"partsTotal\":20440,\"labourTotal\":1500,\"subtotal\":20440,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":3679.2,\"grandTotal\":25619}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-29 18:45:55', '2026-03-30 12:02:43', 'Completed', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0),
(9, 'QT69cb7023e6c53', 'Q-0009', '781ef105-f47b-419f-ac03-c918c8c90950', '232408a0-915b-43be-9d9b-bfe0d86bfded', '8d359a7a-fd62-4ef4-8898-06b5c43ae2ec', '[{\"id\":0.12570883140752342,\"name\":\"NGK Iridium Spark Plug\",\"product_id\":\"17\",\"qty\":1,\"rate\":600,\"amount\":600},{\"id\":0.14879974226549053,\"name\":\"Engine Air Filter\",\"product_id\":\"3\",\"qty\":1,\"rate\":480,\"amount\":480},{\"id\":0.053450930998507284,\"name\":\"Exide Power Battery (12V)\",\"product_id\":\"14\",\"qty\":1,\"rate\":4200,\"amount\":4200},{\"id\":0.11139007417100322,\"name\":\"Radiator Coolant\",\"product_id\":\"10\",\"qty\":2,\"rate\":190,\"amount\":380},{\"id\":0.7522690991182068,\"name\":\"Clutch Plate Assembly\",\"product_id\":\"6\",\"qty\":1,\"rate\":3450,\"amount\":3450},{\"id\":0.20679455291220172,\"name\":\"Rear Brake Shoe Kit\",\"product_id\":\"5\",\"qty\":1,\"rate\":1150,\"amount\":1150}]', '[{\"id\":0.9434325084312077,\"title\":\"Ragu R\",\"mechanic_guid\":\"c59efe50-d773-40d3-a4e2-0e32136d5ca6\",\"hours\":1,\"rate\":1500,\"amount\":1500}]', '{\"partsTotal\":10260,\"labourTotal\":1500,\"subtotal\":10260,\"discountType\":\"percent\",\"discountValue\":0,\"discountAmount\":0,\"gstRate\":18,\"includeGST\":true,\"gst\":1846.8,\"grandTotal\":13607}', '', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', '2026-03-31 12:26:35', '2026-03-31 12:36:53', 'Work In Progress', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 0);

-- --------------------------------------------------------

--
-- Table structure for table `repair_category`
--

CREATE TABLE `repair_category` (
  `id` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `repair_category`
--

INSERT INTO `repair_category` (`id`, `Name`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 'service', 1, 0, '2026-01-24 11:25:38', '2026-01-24 11:25:38'),
(2, 'Repair', 1, 0, '2026-03-24 20:56:18', '2026-03-24 20:56:18');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`, `createdOn`) VALUES
(1, 'admin', 'Full System Access', '2025-11-22 10:26:57'),
(2, 'manager', 'Manage jobs, workers, products', '2025-11-22 10:26:57'),
(3, 'staff', 'Limited access', '2025-11-22 10:26:57'),
(4, 'mechanic', 'Job assigned access only', '2025-11-22 10:26:57');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES
(90, 3, 25),
(91, 3, 9),
(92, 3, 10),
(93, 3, 11),
(112, 1, 9),
(113, 1, 10),
(114, 1, 11),
(115, 1, 12),
(116, 1, 13),
(117, 1, 14),
(118, 1, 15),
(119, 1, 16),
(120, 1, 17),
(121, 1, 18),
(122, 1, 19),
(123, 1, 20),
(124, 1, 21),
(125, 1, 22),
(126, 1, 23),
(127, 1, 24),
(128, 1, 25),
(129, 1, 26),
(184, 1, 27),
(185, 1, 28),
(309, 2, 19),
(310, 2, 20),
(311, 2, 21),
(312, 2, 22),
(313, 2, 23),
(314, 2, 24),
(315, 2, 25),
(316, 2, 26),
(317, 2, 27),
(318, 2, 9),
(319, 2, 11),
(320, 2, 13),
(321, 2, 15),
(322, 2, 17),
(323, 2, 10),
(324, 2, 12),
(325, 2, 14),
(326, 2, 16),
(327, 2, 18),
(328, 2, 28),
(348, 4, 9),
(349, 4, 10),
(350, 4, 11),
(351, 4, 13),
(352, 4, 15),
(353, 4, 19),
(354, 4, 20),
(355, 4, 21),
(356, 4, 25),
(357, 4, 27),
(358, 4, 14);

-- --------------------------------------------------------

--
-- Table structure for table `state_master`
--

CREATE TABLE `state_master` (
  `id` int(11) NOT NULL,
  `state_id` int(11) NOT NULL,
  `state_name` varchar(100) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `state_master`
--

INSERT INTO `state_master` (`id`, `state_id`, `state_name`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 1, 'Tamilnadu', 1, 0, '2026-02-04 07:16:51', '2026-02-23 11:09:05'),
(2, 2, 'Kerala', 1, 0, '2026-03-29 13:05:27', '2026-03-29 13:23:15'),
(3, 3, 'Delhi', 1, 1, '2026-03-29 13:07:16', '2026-03-29 13:23:40'),
(4, 4, 'Karnataka', 1, 1, '2026-03-29 13:07:40', '2026-03-29 13:23:45'),
(5, 5, 'Mumbai', 1, 0, '2026-03-29 13:20:14', '2026-03-29 13:20:14');

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL,
  `admin_guid` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL DEFAULT 0,
  `product_number` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `unit_id` int(11) NOT NULL DEFAULT 0,
  `unit_name` varchar(100) DEFAULT NULL,
  `quantity_purchased` int(11) NOT NULL DEFAULT 0,
  `quantity_sold` int(11) NOT NULL DEFAULT 0,
  `available_quantity` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `purchase_id` int(11) NOT NULL DEFAULT 0,
  `purchase_no` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `supplier_id` int(11) NOT NULL DEFAULT 0,
  `supplier_name` varchar(255) DEFAULT NULL,
  `invoice_id` int(11) NOT NULL DEFAULT 0,
  `invoice_no` varchar(100) DEFAULT NULL,
  `branch_id` varchar(100) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`stock_id`, `admin_guid`, `product_id`, `product_number`, `product_name`, `product_image`, `unit_id`, `unit_name`, `quantity_purchased`, `quantity_sold`, `available_quantity`, `price`, `amount`, `purchase_id`, `purchase_no`, `purchase_date`, `supplier_id`, `supplier_name`, `invoice_id`, `invoice_no`, `branch_id`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 13, 'PRD-0013', 'Headlight Bulb (H4-White)', NULL, 2, 'Pieces', 10, 10, 0, 420.00, 4200.00, 1, 'PUR-0001', '2026-03-28', 4, 'Karthi (Karthi Electronics)', 0, 'INV-0007', '1', 0, '2026-03-28 10:33:27', '2026-03-30 12:04:12'),
(2, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 14, 'PRD-0014', 'Exide Power Battery (12V)', NULL, 2, 'Pieces', 15, 4, 0, 4200.00, 63000.00, 1, 'PUR-0001', '2026-03-28', 4, 'Karthi (Karthi Electronics)', 0, 'INV-0007', '1', 0, '2026-03-28 10:33:27', '2026-03-30 12:04:12'),
(3, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 15, 'PRD-0015', 'Mini Fuse Box Kit', NULL, 4, 'Set', 10, 2, 0, 150.00, 1500.00, 1, 'PUR-0001', '2026-03-28', 4, 'Karthi (Karthi Electronics)', 0, 'INV-0005', '1', 0, '2026-03-28 10:33:27', '2026-03-29 18:28:41'),
(4, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 12, 'PRD-0012', 'Lower Arm Bush Kit', NULL, 4, 'Set', 10, 4, 0, 650.00, 6500.00, 2, 'PUR-0002', '2026-03-28', 5, 'Suresh (Auto Spares)', 0, 'INV-0006', '1', 0, '2026-03-28 10:36:47', '2026-03-29 21:46:03'),
(5, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 11, 'PRD-0011', 'Front Shocker Pair', NULL, 4, 'Set', 15, 3, 0, 3800.00, 57000.00, 2, 'PUR-0002', '2026-03-28', 5, 'Suresh (Auto Spares)', 0, 'INV-0006', '1', 0, '2026-03-28 10:36:47', '2026-03-29 21:46:03'),
(6, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 10, 'PRD-0010', 'Radiator Coolant', NULL, 3, 'Litre', 10, 8, 0, 190.00, 1900.00, 2, 'PUR-0002', '2026-03-28', 5, 'Suresh (Auto Spares)', 0, 'INV-0006', '1', 0, '2026-03-28 10:36:47', '2026-03-29 21:46:03'),
(7, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 9, 'PRD-0009', 'Metal Tyre Valve', NULL, 2, 'Pieces', 10, 6, 0, 80.00, 800.00, 3, 'PUR-0003', '2026-03-28', 3, 'Rajesh (Michelin Tyres)', 0, 'INV-0008', '1', 0, '2026-03-28 10:37:53', '2026-03-30 10:48:22'),
(8, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 7, 'PRD-0007', 'Michelin 185/65 R15 Tyre', NULL, 1, 'Numbers', 20, 15, 0, 4800.00, 96000.00, 3, 'PUR-0003', '2026-03-28', 3, 'Rajesh (Michelin Tyres)', 0, 'INV-0007', '1', 0, '2026-03-28 10:37:53', '2026-03-30 12:04:12'),
(9, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 8, 'PRD-0008', 'Standard Tyre Tube', NULL, 1, 'Numbers', 10, 0, 0, 450.00, 4500.00, 3, 'PUR-0003', '2026-03-28', 3, 'Rajesh (Michelin Tyres)', 0, NULL, '1', 1, '2026-03-28 10:37:53', '2026-03-29 21:20:42'),
(10, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 5, 'PRD-0005', 'Rear Brake Shoe Kit', NULL, 4, 'Set', 10, 3, 0, 1150.00, 11500.00, 4, 'PUR-0004', '2026-03-28', 2, 'Vinoth (AutoParts Hub)', 0, 'INV-0005', '1', 0, '2026-03-28 10:39:25', '2026-03-29 18:28:41'),
(11, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 6, 'PRD-0006', 'Clutch Plate Assembly', NULL, 2, 'Pieces', 15, 5, 0, 3450.00, 51750.00, 4, 'PUR-0004', '2026-03-28', 2, 'Vinoth (AutoParts Hub)', 0, 'INV-0007', '1', 0, '2026-03-28 10:39:25', '2026-03-30 12:04:12'),
(12, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 4, 'PRD-0004', 'Front Brake Pad Set ', NULL, 1, 'Numbers', 10, 7, 0, 980.00, 9800.00, 4, 'PUR-0004', '2026-03-28', 2, 'Vinoth (AutoParts Hub)', 0, 'INV-0008', '1', 0, '2026-03-28 10:39:25', '2026-03-30 10:48:22'),
(13, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 2, 'PRD-0002', 'Premium Oil Filter', NULL, 2, 'Pieces', 10, 6, 0, 220.00, 2200.00, 5, 'PUR-0005', '2026-03-28', 1, 'Velan Automobiles', 0, 'INV-0007', '1', 0, '2026-03-28 10:40:26', '2026-03-30 12:04:12'),
(14, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 3, 'PRD-0003', 'Engine Air Filter', NULL, 2, 'Pieces', 10, 4, 0, 480.00, 4800.00, 5, 'PUR-0005', '2026-03-28', 1, 'Velan Automobiles', 0, 'INV-0007', '1', 0, '2026-03-28 10:40:26', '2026-03-30 12:04:12'),
(15, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 1, 'PRD-0001', 'Synthetic Engine Oil ', NULL, 3, 'Litre', 15, 15, 0, 2150.00, 32250.00, 5, 'PUR-0005', '2026-03-28', 1, 'Velan Automobiles', 0, 'INV-0007', '1', 0, '2026-03-28 10:40:26', '2026-03-30 12:04:12'),
(16, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 17, 'PRD-0017', 'NGK Iridium Spark Plug', NULL, 2, 'Pieces', 20, 0, 0, 600.00, 12000.00, 6, 'PUR-0006', '2026-03-29', 7, 'rrrr', 0, NULL, '1', 0, '2026-03-29 21:45:14', '2026-03-29 21:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `admin_guid` varchar(255) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `landline_no` varchar(20) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `gstin` varchar(50) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `note_text` text DEFAULT NULL,
  `note_file_path` varchar(255) DEFAULT NULL,
  `internal_note` tinyint(1) DEFAULT 0,
  `shared_with_customer` tinyint(1) DEFAULT 0,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `modifiedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `admin_guid`, `supplier_name`, `company_name`, `email`, `mobile_no`, `landline_no`, `gender`, `image_path`, `gstin`, `country`, `state`, `city`, `address`, `bank_name`, `account_number`, `ifsc_code`, `note_text`, `note_file_path`, `internal_note`, `shared_with_customer`, `createdOn`, `modifiedOn`, `isActive`, `isDeleted`) VALUES
(1, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Velan Automobiles', 'Velan Automobiles', 'velanautomobiles@gmail.com', '9876543214', '', NULL, NULL, NULL, 'India', '1', '3', 'chennai', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-27 16:35:20', '2026-03-27 16:35:20', 1, 0),
(2, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Vinoth (AutoParts Hub)', 'Vinoth (AutoParts Hub)', 'autoparts@gmail.com', '9874563214', '', NULL, NULL, NULL, 'India', '1', '3', 'chennai', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-27 16:36:13', '2026-03-27 16:36:13', 1, 0),
(3, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Rajesh (Michelin Tyres)', 'Rajesh (Michelin Tyres)', 'michelin@gmail.com', '9874563219', '', NULL, NULL, NULL, 'India', '1', '3', 'chennai', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-27 16:37:00', '2026-03-27 16:37:00', 1, 0),
(4, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Karthi (Karthi Electronics)', 'Karthi (Karthi Electronics)', 'KarthiElectronics@gmail.com', '8521364975', '', NULL, NULL, NULL, 'India', '1', '3', 'Chennai', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-27 16:37:39', '2026-03-27 16:37:39', 1, 0),
(5, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Suresh (Auto Spares)', 'Suresh (Auto Spares)', 'sureshautospares@gmail.com', '8975642315', '', NULL, NULL, NULL, 'India', '1', '4', 'coimbatore', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-28 05:05:32', '2026-03-28 05:05:32', 1, 0),
(6, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', ':lkjhgbnhjk', 'lkjbnm', 'Sri@gmail.com', '9874563151', '', NULL, NULL, NULL, 'India', '2', '38', '5/229 main road, Sitheripattu\r\nSankarapuram (taluk)', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-29 14:04:13', '2026-03-29 14:04:29', 1, 1),
(7, 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'Ragul (Automobiles)', 'Ragul (Automobiles)', 'ragulautomobiles@gmail.com', '9876541236', '', NULL, NULL, NULL, 'India', '1', '1', '', NULL, NULL, NULL, NULL, NULL, 0, 0, '2026-03-29 16:14:35', '2026-03-31 07:21:53', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `units_of_measurement`
--

CREATE TABLE `units_of_measurement` (
  `id` int(11) NOT NULL,
  `unit_name` varchar(100) NOT NULL,
  `unit_symbol` varchar(20) NOT NULL,
  `unit_type` varchar(50) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `units_of_measurement`
--

INSERT INTO `units_of_measurement` (`id`, `unit_name`, `unit_symbol`, `unit_type`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, 'Numbers', 'Nos', 'Count', 1, 0, '2026-03-27 22:00:01', '2026-03-27 22:00:01'),
(2, 'Pieces', 'Pcs', 'Count', 1, 0, '2026-03-27 22:00:32', '2026-03-27 22:00:32'),
(3, 'Litre', 'L', 'Volume', 1, 0, '2026-03-27 22:00:49', '2026-03-27 22:00:49'),
(4, 'Set', 'set', 'Group', 1, 0, '2026-03-27 22:01:06', '2026-03-27 22:01:06'),
(5, 'Kilogram', 'Kg', 'Weight', 1, 0, '2026-03-27 22:01:23', '2026-03-27 22:01:23'),
(6, 'Meters', 'M', 'Length', 1, 0, '2026-03-27 22:02:03', '2026-03-27 22:02:03');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `admin_guid` char(36) NOT NULL,
  `user_type` enum('customer','employee','accountant','support_staff') NOT NULL DEFAULT 'customer',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `alternate_mobile` varchar(15) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `landline` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdOn` datetime DEFAULT current_timestamp(),
  `modifiedOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_guid`, `admin_guid`, `user_type`, `first_name`, `last_name`, `email`, `mobile`, `alternate_mobile`, `gender`, `company_name`, `tax_id`, `landline`, `country`, `state`, `city`, `address`, `permanent_address`, `image_path`, `isActive`, `isDeleted`, `createdOn`, `modifiedOn`) VALUES
(1, '818c1877-f99d-425a-97b0-41ce4a6369b2', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Ravi Sankar', 'v', 'ravi@gmail.com', '9874562315', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Kallakurichi', 'kallakurichi', 'Kallakurichi', NULL, 1, 0, '2026-03-27 22:19:34', '2026-03-27 22:19:34'),
(2, '6bdbed3a-62ae-430f-9acb-2714d3f348f1', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'employee', 'Ramesh', 'R', 'ramesh@gmail.com', '7896542315', '', 'male', '', '', '', 'India', 'TamilNadu', 'Kallakurichi', 'kallakurichi', 'Kallakurichi', NULL, 1, 0, '2026-03-27 22:22:23', '2026-03-27 22:22:23'),
(3, 'c0eb1917-d04f-4de2-ab40-b57153076cc4', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'employee', 'Ram', 'R', 'ram@gmail.com', '7895236419', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Kallakurichi', 'kallakurichi', 'Kallakurichi', NULL, 1, 0, '2026-03-27 22:26:28', '2026-03-27 22:26:28'),
(4, '0d7c43a1-8c13-4a66-937f-53ba06f53b6b', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Niveth', 'A', 'Niveth@gmail.com', '9344589621', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Dharapuram', 'Dharapuram', 'Dharapuram', NULL, 1, 0, '2026-03-28 10:49:29', '2026-03-28 10:49:29'),
(5, '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Jagan', 'R', 'jagan@gmail.com', '9876452310', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Attur', 'Attur', 'Attur', NULL, 1, 0, '2026-03-28 10:54:46', '2026-03-28 11:05:22'),
(6, '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Jayashriram', 'P', 'shri@gmail.com', '9786526344', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Salem', 'Salem', 'Salem', NULL, 1, 0, '2026-03-28 10:57:36', '2026-03-28 10:59:48'),
(7, '302e61cd-2b3d-4f38-8988-3e5a3a18b7f8', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Hari', 'K', 'hari@gmail.com', '8523697418', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'ooty', 'Ooty', 'Ooty', NULL, 1, 0, '2026-03-28 11:03:04', '2026-03-28 11:03:04'),
(8, '7c1b423d-02d7-48f4-8726-4e71f4956c03', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Abishek', 'N', 'abishek@gmail.com', '8975462136', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Salem', 'Salem', 'Salem', NULL, 1, 0, '2026-03-28 11:04:40', '2026-03-28 11:04:40'),
(9, 'c59efe50-d773-40d3-a4e2-0e32136d5ca6', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'employee', 'Ragu', 'R', 'ragu@gmail.com', '9875641235', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'sankarapuram', 'Sankarapuram ', 'Sankarapuram', NULL, 1, 0, '2026-03-28 11:08:46', '2026-03-28 11:08:46'),
(10, '15d3101f-2316-466b-8793-5a5e7c04109e', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'employee', 'vignesh', 'S', 'vikki@gmail.com', '9660524862', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'trichy', 'trichy', 'trichy', NULL, 1, 0, '2026-03-28 11:14:36', '2026-03-29 18:26:33'),
(11, '6e3a1427-db66-4806-aeaa-b240289b1a31', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Santhosh', 'S', 'santhosh@gmail.com', '8965471235', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Sathiyamangalam', 'Sathiyamangalam', 'Sathiyamangalam', NULL, 1, 0, '2026-03-29 18:40:17', '2026-03-29 18:40:17'),
(13, '232408a0-915b-43be-9d9b-bfe0d86bfded', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'customer', 'Niveth', 'J', 'niveth1@gmail.com', '9344587496', '', 'male', '', '', '', 'India', 'Keralam', 'Kottayam', 'Kottayam', 'Kottayam', NULL, 1, 0, '2026-03-30 11:26:49', '2026-03-31 12:22:29'),
(14, '751b07de-25c4-4d41-ac4c-95e7c411a0e6', 'cf79f26f-afcb-4915-a3c6-6eae3e33f83f', 'employee', 'Nivin ', 'T', 'nivin@gmail.com', '9784859612', '', 'male', '', '', '', 'India', 'Tamil Nadu', 'Salem', 'Salem', 'Salem', NULL, 1, 0, '2026-03-30 11:37:23', '2026-03-30 11:37:23');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `vehicle_guid` char(36) NOT NULL,
  `user_guid` char(36) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `chassis_number` varchar(50) DEFAULT NULL,
  `engine_number` varchar(50) DEFAULT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `odometer_reading` int(11) DEFAULT NULL,
  `year_of_manufacture` year(4) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `transmission_type` varchar(50) DEFAULT NULL,
  `insurance_validity` date DEFAULT NULL,
  `pollution_cert_validity` date DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT 1,
  `isDeleted` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `vehicle_guid`, `user_guid`, `registration_number`, `chassis_number`, `engine_number`, `make`, `model`, `fuel_type`, `odometer_reading`, `year_of_manufacture`, `color`, `transmission_type`, `insurance_validity`, `pollution_cert_validity`, `isActive`, `isDeleted`) VALUES
(1, 'af02adb9-7208-468c-93f6-f6f17defcf9d', '818c1877-f99d-425a-97b0-41ce4a6369b2', 'TN15M9400', '', '', 'Volkswagon', 'Virtus', 'Petrol', 0, '2025', 'Black', '', '0000-00-00', '0000-00-00', 1, 0),
(2, '07f65584-14f7-42da-81e0-b8b1be646349', '0d7c43a1-8c13-4a66-937f-53ba06f53b6b', 'TN66NJ0201', '', '', 'Mahindra ', 'Thar', 'Petrol', 0, '2020', 'Black', '', '0000-00-00', '0000-00-00', 1, 0),
(3, '1e7001f0-bfb5-4402-98ae-b299c1f84081', '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', 'TN30JJ2536', '', '', 'Toyota', 'Innova', 'Diesel', 0, '2005', 'white', '', '0000-00-00', '0000-00-00', 0, 1),
(4, '17c0431a-1ec8-4730-9453-aa737f238d1d', '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 'TN15TR8796', '', '', 'Suzuki', 'Swift desire', 'Petrol', 0, '2003', 'Red', '', '0000-00-00', '0000-00-00', 0, 1),
(5, '82c0666d-733a-44cd-afdc-334f91e0830d', '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', 'TN30JJ2536', '', '', 'Toyota', 'Innova Crysta', 'Diesel', 0, '2005', 'white', '', '0000-00-00', '0000-00-00', 0, 1),
(6, 'f367e86e-320e-456b-924c-2ee768f6bcac', '3cec1acd-5f11-4b24-bedc-12b0fdabd91f', 'TN15TR8796', '', '', 'Hyundai', 'i20 NLine', 'Petrol', 0, '2023', 'Red', '', '0000-00-00', '0000-00-00', 1, 0),
(7, '785fe78f-ba51-4b4c-9940-055d08ea5249', '302e61cd-2b3d-4f38-8988-3e5a3a18b7f8', 'TN60H2002', '', '', 'Mahindra ', 'Scorpio', 'Diesel', 0, '2020', 'Black', '', '0000-00-00', '0000-00-00', 1, 0),
(8, '0d14774b-c2f2-48de-8dd9-11ef4dde82ab', '7c1b423d-02d7-48f4-8726-4e71f4956c03', 'TN30AN2002', '', '', 'Skoda', 'Slavia 1.5 DSG', 'Petrol', 0, '2023', 'Red', '', '0000-00-00', '0000-00-00', 1, 0),
(9, '175c5658-2365-46e3-bfb0-055b6e51af25', '43f9bdab-4ddb-4adb-989c-5ec16f2c5e1f', 'TN30JJ2536', '', '', 'Toyota', 'Innova Crysta', 'Diesel', 0, '2005', 'white', '', '0000-00-00', '0000-00-00', 1, 0),
(10, 'e612d8dd-83d5-499d-8b35-19762a43c286', '6e3a1427-db66-4806-aeaa-b240289b1a31', 'TN56SS0980', '', '', 'Honda', 'Civic', 'Petrol', 0, '2015', 'white', '', '0000-00-00', '0000-00-00', 1, 0),
(11, 'b68c9912-e604-46a7-bdba-ee78c122ddea', '232408a0-915b-43be-9d9b-bfe0d86bfded', 'TN15M9407', '', '', 'Mahindra ', 'Thar', 'Petrol', 0, '2020', 'Black', '', '0000-00-00', '0000-00-00', 0, 1),
(12, '8d359a7a-fd62-4ef4-8898-06b5c43ae2ec', '232408a0-915b-43be-9d9b-bfe0d86bfded', 'TN15M9407', '', '', 'Mahindra ', 'Thar', 'Petrol', 0, '2020', 'Black', '', '0000-00-00', '0000-00-00', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`branch_id`) USING BTREE;

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `user_guid` (`user_guid`) USING BTREE;

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `invoice_guid` (`invoice_guid`) USING BTREE,
  ADD UNIQUE KEY `invoice_no` (`invoice_no`) USING BTREE;

--
-- Indexes for table `jobcard_sequence`
--
ALTER TABLE `jobcard_sequence`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `unique_prefix_year` (`prefix`,`from_year`,`to_year`) USING BTREE;

--
-- Indexes for table `job_card`
--
ALTER TABLE `job_card`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `job_guid` (`job_guid`) USING BTREE;

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `note_guid` (`note_guid`) USING BTREE;

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `permission_name` (`permission_name`) USING BTREE;

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `profile_crud`
--
ALTER TABLE `profile_crud`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`purchase_id`) USING BTREE,
  ADD UNIQUE KEY `purchase_no` (`purchase_no`) USING BTREE;

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`item_id`) USING BTREE,
  ADD KEY `purchase_id` (`purchase_id`) USING BTREE,
  ADD KEY `product_id` (`product_id`) USING BTREE;

--
-- Indexes for table `quotation`
--
ALTER TABLE `quotation`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `quotation_guid` (`quotation_guid`) USING BTREE,
  ADD UNIQUE KEY `quotation_no` (`quotation_no`) USING BTREE,
  ADD KEY `job_guid` (`job_guid`) USING BTREE,
  ADD KEY `quotation_guid_2` (`quotation_guid`) USING BTREE,
  ADD KEY `created_by` (`created_by`) USING BTREE,
  ADD KEY `idx_admin_guid` (`admin_guid`) USING BTREE;

--
-- Indexes for table `repair_category`
--
ALTER TABLE `repair_category`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `role_name` (`role_name`) USING BTREE;

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `role_id` (`role_id`) USING BTREE,
  ADD KEY `permission_id` (`permission_id`) USING BTREE;

--
-- Indexes for table `state_master`
--
ALTER TABLE `state_master`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`stock_id`) USING BTREE;

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`) USING BTREE;

--
-- Indexes for table `units_of_measurement`
--
ALTER TABLE `units_of_measurement`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `user_guid` (`user_guid`) USING BTREE,
  ADD UNIQUE KEY `email` (`email`) USING BTREE;

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `vehicle_guid` (`vehicle_guid`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `jobcard_sequence`
--
ALTER TABLE `jobcard_sequence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `job_card`
--
ALTER TABLE `job_card`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `profile_crud`
--
ALTER TABLE `profile_crud`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `purchase_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `quotation`
--
ALTER TABLE `quotation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `repair_category`
--
ALTER TABLE `repair_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=359;

--
-- AUTO_INCREMENT for table `state_master`
--
ALTER TABLE `state_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `units_of_measurement`
--
ALTER TABLE `units_of_measurement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
