const API_BASE_URL = "http://localhost/php/Garage/api";
const apiEndpoints = {
  baseURL: `${API_BASE_URL}/`,
  blob: `${API_BASE_URL}/`,
  blobFromAdmin: `${API_BASE_URL}/`,

  profile: `${API_BASE_URL}/profile.php`,
  locations: `${API_BASE_URL}/locations.php`,
  supplier: `${API_BASE_URL}/supplier.php`,
  notes: `${API_BASE_URL}/note.php`,
  units: `${API_BASE_URL}/unit_measurement.php`,
  product: `${API_BASE_URL}/product.php`,
  purchase: `${API_BASE_URL}/purchase.php`,
  purchaseItems: `${API_BASE_URL}/purchaseitem.php`,
  stock: `${API_BASE_URL}/stock.php`,
  dropDown: `${API_BASE_URL}/dynamic_dropdown.php`,
  JobCard: `${API_BASE_URL}/job_card.php`,
  usersdata: `${API_BASE_URL}/usersdata.php`,
  login: `${API_BASE_URL}/login.php`,
  register: `${API_BASE_URL}/register.php`,
  forgotpassword: `${API_BASE_URL}/forgotpassword.php`,
  report: `${API_BASE_URL}/reports.php`,
  branches: `${API_BASE_URL}/branches.php`,
  workers: `${API_BASE_URL}/workers.php`,
  workerManagement: `${API_BASE_URL}/worker_management.php`,
  dashboard: `${API_BASE_URL}/dashboard.php`,
  Quotation: `${API_BASE_URL}/quotation.php`,
  Invoice: `${API_BASE_URL}/invoice.php`
};

export default apiEndpoints;