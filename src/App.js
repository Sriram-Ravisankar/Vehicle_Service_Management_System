import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme";
// Common Components
import Layout from "./components/common/SideBar/AppLayout"; // Make sure this is your Layout component
import useAppData from "./useAppData";

// Pages (your existing imports)
import Dashboard from "./components/Dashboard/Dashboard";
import OrderPage from "./Userinvoice/OrderPage";
import UserList from "./pages/customer/Customers";
import EditJobCard from "./Userinvoice/EditJobCard";
import AddInvoice from "./pages/billing/invoice/Addinvoice";
import AddQuotation from "./pages/billing/quotation/Addquations";
import InvoicePage from "./pages/billing/invoice/InvoicesPage";
import InvoiceList from "./pages/billing/invoice/InvoiceList";
import InvoiceDetails from "./pages/InvoiceDetails";
import JobQueue from "./pages/JobQueue";
import AddUser from "./pages/customer/AddUser";
import Quatation from "./pages/billing/quotation/Quatation";
import JobCard from "./Userinvoice/JobCard";
import Product from "./components/Inventory/Product";
import Purchase from "./components/Inventory/Purchase";
import Supplier from "./components/Inventory/Supplier";
import ReportsTabs from "./components/Reports/ReportsTabs";
import PartSellList from "./components/partsale/PartSellList";
import MainLayout from "./Userinvoice/Mainlayout";
import AddPurchase from "./components/Inventory/Addpurchase";
import AddSupplier from "./components/Inventory/AddSuplier";
import AddProduct from "./components/Inventory/Addproduct";
import PurchaseViewModal from "./components/Inventory/PurchaseView";
import UserProfile from "./components/Inventory/SupplierView";
import Stock from "./components/Inventory/Stock";
import AddStock from "./components/Inventory/AddStock";
import Customfield from "./components/customfield/Customfield";
import ServiceMain from "./components/service/ServiceMain";
import AddServiceForm from "./components/service/AddServiceForm";
import Costomform from "./components/customfield/Customform";
import BranchTable from "./components/branch/BranchTable";
import BranchForm from "./components/branch/BranchForm";
import Upcomingservices from "./components/Reports/upcomingservices";
import ViewInvoice from "./pages/billing/invoice/ViewInvoice";

import TaxRates from "./components/Accounts/TaxRates";
import AddTax from "./components/Accounts/Addtax";
import PaymentMethod from "./components/Accounts/payment-methods";
import Addpayments from "./components/Accounts/Addpayments";
import Income from "./components/Accounts/Income";
import Addincome from "./components/Accounts/Addincome";
import Expenses from "./components/Accounts/expenses";
import Expensesdetail from "./components/Accounts/expensesdetail";
import Addexpenses from "./components/Accounts/Addexpenses";

import Login from "./components/login/Login";
import ForgotPassword from "./components/forgotpassword/ForgotPassword";
import AddObservation from "./components/observations";
import ProfileSettings from "./components/common/profile";
import WorkersManagement from "./components/WorkersManagement/WorkersManagement";
import DynamicHeader from "./components/common/Dynamicheader";
import GlobalLoader from "./components/common/GlobalLoader";
import { useLoading } from "./pages/LoadingContext";


function AppContent() {
  const location = useLocation();
  const isLoginPage =
    location.pathname === "/" || location.pathname === "/forgotpassword";

  const {
    data,
    handleSaveInvoice,
    handleUserUpdate,
    fetchData,
    deleteItems,
    addQuotation,
    updateQuotation,
  } = useAppData();

  // If it's login page, render without layout
  if (isLoginPage) {
    return (
      <Box>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
      </Box>
    );
  }

  // For all other pages, use the Layout component
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dynamicheader" element={<DynamicHeader />} />
        <Route path="/orderpage" element={<OrderPage />} />
        <Route
          path="/add-invoice"
          element={
            <AddInvoice
              onSaveInvoice={handleSaveInvoice}
              invoices={data.invoices}
            />
          }
        />
        <Route
          path="/invoices"
          element={
            <InvoicePage invoices={data.invoices} deleteItems={deleteItems} />
          }
        />
        <Route path="/invoicedetails" element={<InvoiceDetails />} />
        <Route path="/jobqueue" element={<JobQueue />} />
        <Route path="/product" element={<Product products={data.products} fetchData={fetchData} />} />
        <Route path="/purchase" element={<Purchase purchases={data.purchases} fetchData={fetchData} />} />
        <Route path="/supplier" element={<Supplier suppliers={data.suppliers} fetchData={fetchData} />} />
        <Route path="/stock" element={<Stock stock={data.stock} fetchData={fetchData} />} />
        <Route path="/add-stock" element={<AddStock fetchData={fetchData} />} />
        <Route path="/add-purchase" element={<AddPurchase fetchData={fetchData} />} />
        <Route path="/add-supplier" element={<AddSupplier fetchData={fetchData} />} />
        <Route path="/add-product" element={<AddProduct fetchData={fetchData} />} />
        <Route path="/supplier-view" element={<UserProfile />} />
        <Route path="/purchase-view" element={<PurchaseViewModal />} />
        <Route path="/reports" element={<ReportsTabs />} />
        <Route
          path="/custom-fields"
          element={
            <Customfield
              quotations={data.quotations}
              onEditQuotation={updateQuotation}
            />
          }
        />
        <Route path="/Custom-form" element={<Costomform />} />
        <Route path="/branches" element={<BranchTable />} />
        <Route path="/add-branch" element={<BranchForm />} />
        <Route path="/upcomingservices" element={<Upcomingservices />} />
        <Route path="/services" element={<ServiceMain />} />
        <Route path="/services-form" element={<AddServiceForm />} />
        <Route path="/edit-job-card" element={<EditJobCard />} />
        <Route path="/jobcard" element={<JobCard />} />
        <Route path="/main-layout" element={<MainLayout />} />
        <Route path="/packages" element={<MainLayout />} />
        <Route path="/all-services" element={<MainLayout />} />
        <Route path="/wheel-alignment" element={<MainLayout />} />
        <Route path="/wheel-balancing" element={<MainLayout />} />
        <Route path="/wash-detailing" element={<MainLayout />} />
        <Route path="/pms-checkups" element={<MainLayout />} />
        <Route path="/tyres-services" element={<MainLayout />} />
        <Route path="/details" element={<MainLayout />} />
        <Route path="/part-sells" element={<PartSellList />} />
        <Route path="/observation-library" element={<AddObservation />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/TaxRates" element={<TaxRates />} />
        <Route path="/Addtax" element={<AddTax />} />
        <Route path="/payment-methods" element={<PaymentMethod />} />
        <Route path="/addpayments" element={<Addpayments />} />
        <Route path="/income" element={<Income />} />
        <Route path="/Addincome" element={<Addincome />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expensesdetail" element={<Expensesdetail />} />
        <Route path="/Addexpenses" element={<Addexpenses />} />
        <Route path="/Adduser" element={<AddUser userType="Customers" />} />
        <Route path="/workersmanagement" element={<WorkersManagement />} />
        <Route
          path="/add-support-staff"
          element={<AddUser userType="Support Staff" />}
        />

        <Route
          path="/add-accountant"
          element={<AddUser userType="Accountants" />}
        />

        <Route
          path="/edit-user/:id"
          element={<AddUser userType="Customers" isEditMode={true} />}
        />

        <Route
          path="/edit-support-staff/:id"
          element={<AddUser userType="Support Staff" isEditMode={true} />}
        />

        <Route
          path="/edit-accountant/:id"
          element={<AddUser userType="Accountants" isEditMode={true} />}
        />
        <Route
          path="/add-employee"
          element={<AddUser userType="Employees" />}
        />

        <Route
          path="/edit-employee/:id"
          element={
            <AddUser
              userType="Employees"
              isEditMode={true}
              handleUserUpdate={handleUserUpdate}
            />
          }
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={
            <UserList
              users={data.customers}
              fetchData={fetchData}
              setUsers={(newList) => handleUserUpdate("customers", newList)}
              onDelete={(userIds, vehicleGuid, userGuid) =>
                deleteItems("customers", userIds, vehicleGuid, userGuid)
              }
              title="Customers"
              columns={[
                "Image",
                "First Name",
                "Last Name",
                "Email",
                "Mobile Number",
                "Vehicle",
                "Action",
              ]}
              detailsKey="vehicle"
              addRoute="/Adduser"
              editRoutePrefix="/edit-user"
            />
          }
        />
        <Route
          path="/employees"
          element={
            <UserList
              users={data.employees}
              fetchData={fetchData}
              setUsers={(newList) => handleUserUpdate("employees", newList)}
              onDelete={(ids) => deleteItems("employees", ids)}
              title="Employees"
              columns={[
                "Image",
                "First Name",
                "Last Name",
                "Email",
                "Mobile Number",
                "Position",
                "Action",
              ]}
              detailsKey="position"
              addRoute="/add-employee"
              editRoutePrefix="/edit-employee"
            />
          }
        />
        <Route
          path="/support-staff"
          element={
            <UserList
              users={data.supportStaff}
              fetchData={fetchData}
              setUsers={(newList) => handleUserUpdate("supportStaff", newList)}
              onDelete={(ids) => deleteItems("supportStaff", ids)}
              title="Support Staff"
              columns={[
                "Image",
                "First Name",
                "Last Name",
                "Email",
                "Mobile Number",
                "Role",
                "Action",
              ]}
              detailsKey="role"
              addRoute="/add-support-staff"
              editRoutePrefix="/edit-support-staff"
            />
          }
        />
        <Route
          path="/accountants"
          element={
            <UserList
              users={data.accountants}
              fetchData={fetchData}
              setUsers={(newList) => handleUserUpdate("accountants", newList)}
              onDelete={(ids) => deleteItems("accountants", ids)}
              title="Accountants"
              columns={[
                "Image",
                "First Name",
                "Last Name",
                "Email",
                "Mobile Number",
                "Qualification",
                "Action",
              ]}
              detailsKey="qualification"
              addRoute="/add-accountant"
              editRoutePrefix="/edit-accountant"
            />
          }
        />
        {/* Quotations */}
        <Route
          path="/quotations"
          element={
            <Quatation
              users={data.quotations}
              setUsers={(newList) => handleUserUpdate("quotations", newList)}
              title="Quotations"
              columns={[
                "Quotation No",
                "Customer",
                "Date",
                "Service",
                "Price",
                "Status",
              ]}
              detailsKey="service"
              addRoute="/add-quotation"
              editRoutePrefix="/edit-quotation"
              onDelete={(ids) => deleteItems("quotations", ids)}
            />
          }
        />
        <Route
          path="/add-quotation"
          element={
            <AddQuotation
              onAddQuotation={addQuotation}
              quotations={data.quotations}
            />
          }
        />
        <Route
          path="/edit-quotation/:quotation_guid"
          element={<AddQuotation />}
        />

        {/* View quotation */}
        <Route
          path="/view-quotation/:quotation_guid"
          element={<AddQuotation />}
        />
        <Route
          path="/invoices"
          element={
            <InvoicePage invoices={data.invoices} deleteItems={deleteItems} />
          }
        />
        <Route
          path="/add-invoice"
          element={
            <AddInvoice
              onSaveInvoice={handleSaveInvoice}
              invoices={data.invoices}
            />
          }
        />
        <Route
          path="/edit-invoice/:id"
          element={
            <AddInvoice
              onSaveInvoice={handleSaveInvoice}
              invoices={data.invoices}
              isEditMode={true}
            />
          }
        />
        <Route
          path="/view-invoice/:id"
          element={<ViewInvoice invoices={data.invoices} />}
        />
      </Routes>
    </Layout>
  );
}

function App() {
  const { loading } = useLoading();
  return (
    <ThemeProvider theme={theme}>
      <GlobalLoader visible={loading} />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CssBaseline />
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
