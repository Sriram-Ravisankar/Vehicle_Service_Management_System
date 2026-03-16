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
        icon: GroupIcon,
        permissions: ["manage_suppliers"],
      },
      {
        label: "Product",
        route: "/product",
        icon: EngineeringIcon,
        permissions: ["manage_products"],
      },
      {
        label: "Purchase",
        route: "/purchase",
        icon: SupportIcon,
        permissions: ["manage_purchase"],
      },
      {
        label: "Stock",
        route: "/stock",
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
        icon: GroupIcon,
        permissions: ["view_customers"],
      },
      {
        label: "Employees",
        route: "/employees",
        icon: EngineeringIcon,
        permissions: ["view_employees"],
      },
      {
        label: "Support Staff",
        route: "/support-staff",
        icon: SupportIcon,
        permissions: ["view_support_staff"],
      },
      {
        label: "Accountants",
        route: "/accountants",
        icon: AccountBalanceIcon,
        permissions: ["view_accountants"],
      },
    ],
  },

  {
    label: "Services",
    icon: BuildIcon,
    route: "/services",
    permissions: ["view_services"],
  },

  {
    label: "Quotations",
    icon: DescriptionIcon,
    route: "/quotations",
    permissions: ["view_quotations"],
  },

  {
    label: "Invoices",
    icon: ReceiptIcon,
    route: "/invoices",
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
    permissions: ["view_branches"],
  },

/*
  {
    label: "Accounts",
    icon: MonetizationOnIcon,
    subItems: [
      {
        label: "Income",
        route: "/income",
        icon: TrendingUpIcon,
      },
      {
        label: "Expenses",
        route: "/expenses",
        icon: TrendingDownIcon,
      },
      {
        label: "Tax Rates",
        route: "/taxrates",
        icon: ReceiptIcon,
      },
      {
        label: "Payment Methods",
        route: "/payment-methods",
        icon: PaymentIcon,
      },
    ],
  },
*/

  {
    label: "WorkersManagement",
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

  // {
  //   label: "Logout",
  //   icon: PowerSettingsNewIcon,
  //   action: "logout",
  // },
];
export default menuItems;
