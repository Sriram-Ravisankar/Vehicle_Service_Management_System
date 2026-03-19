import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Engineering as EngineeringIcon,
  Support as SupportIcon,
  DirectionsCar as DirectionsCarIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  LocalOffer as LocalOfferIcon,
  VerifiedUser as VerifiedUserIcon,
  BarChart as BarChartIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  Widgets as WidgetsIcon,
  LibraryBooks as LibraryBooksIcon,
  AccountTree as AccountTreeIcon,
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
const menuItems = [
  {
    label: "Dashboard",
    icon: DashboardIcon,
    route: "/dashboard",
    permissions: ["view_dashboard"],
  },

  {
    label: "Inventory",
    icon: InventoryIcon,
    permissions: ["view_inventory"],
    subItems: [
      {
        label: "Supplier",
        route: "/supplier",
        activePaths: ["/add-supplier", "/supplier-view"],
        icon: GroupIcon,
        permissions: ["manage_suppliers"],
      },
      {
        label: "Product",
        route: "/product",
        activePaths: ["/add-product", "/editproduct"],
        icon: EngineeringIcon,
        permissions: ["manage_products"],
      },
      {
        label: "Purchase",
        route: "/purchase",
        activePaths: ["/add-purchase", "/purchase-view"],
        icon: SupportIcon,
        permissions: ["manage_purchase"],
      },
      {
        label: "Stock",
        route: "/stock",
        activePaths: ["/add-stock"],
        icon: AccountBalanceIcon,
        permissions: ["manage_stock"],
      },
    ],
  },

  {
    label: "Users",
    icon: PeopleIcon,
    permissions: ["manage_users"],
    subItems: [
      {
        label: "Customers",
        route: "/customers",
        activePaths: ["/Adduser", "/edit-user"],
        icon: GroupIcon,
        permissions: ["view_customers"],
      },
      {
        label: "Employees",
        route: "/employees",
        activePaths: ["/add-employee", "/edit-employee"],
        icon: EngineeringIcon,
        permissions: ["view_employees"],
      },
      {
        label: "Support Staff",
        route: "/support-staff",
        activePaths: ["/add-support-staff", "/edit-support-staff"],
        icon: SupportIcon,
        permissions: ["view_support_staff"],
      },
      {
        label: "Accountants",
        route: "/accountants",
        activePaths: ["/add-accountant", "/edit-accountant"],
        icon: AccountBalanceIcon,
        permissions: ["view_accountants"],
      },
    ],
  },

  {
    label: "Services",
    icon: BuildIcon,
    route: "/services",
    activePaths: ["/services-form", "/edit-job-card", "/jobcard"],
    permissions: ["view_services"],
  },

  {
    label: "Quotations",
    icon: DescriptionIcon,
    route: "/quotations",
    activePaths: ["/addQuotation", "/Quatation"],
    permissions: ["view_quotations"],
  },

  {
    label: "Invoices",
    icon: ReceiptIcon,
    route: "/invoices",
    activePaths: ["/add-invoice", "/invoicedetails", "/ViewInvoice"],
    permissions: ["view_invoices"],
  },

  {
    label: "Reports",
    icon: BarChartIcon,
    route: "/reports",
    permissions: ["view_reports"],
  },

  {
    label: "Branches",
    icon: AccountTreeIcon,
    route: "/branches",
    activePaths: ["/add-branch", "/edit-branch"],
    permissions: ["view_branches"],
  },

  {
    label: "Workers Management",
    icon: PeopleIcon,
    route: "/workersmanagement",
    permissions: ["manage_workers"],
  },

  {
    label: "Profile",
    icon: SettingsIcon,
    route: "/profile-settings",
    permissions: ["manage_settings"],
  },
];
export default menuItems;
