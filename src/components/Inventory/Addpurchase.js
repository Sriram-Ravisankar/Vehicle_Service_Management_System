import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Mail,
  Upload,
  X,
  Save} from "lucide-react";
import { 
  Box, 
  Button, 
  Snackbar, 
  Alert, 
  Divider,
  Stack,
  Typography
} from "@mui/material";
import apiEndpoints from "../../apiconfig";
import DynamicHeader from "../common/Dynamicheader";
import { useLoading } from "../../pages/LoadingContext";
import PurchaseDetailsForm from "./PurchaseDetails";
import SearchableSelect from "../DynamicComponents/SearchableSelect";

// ── tiny helpers (borrowed from AddSupplier for consistency) ───────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={14} style={{ color: "#0EA5E9" }} />}
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
  </div>
);

const inputSx = (hasError) => ({
  width: "100%",
  padding: "9px 13px",
  fontSize: 14,
  border: `1px solid ${hasError ? "#FCA5A5" : "#E5E7EB"}`,
  borderRadius: 8,
  outline: "none",
  background: hasError ? "#FFF5F5" : "#F9FAFB",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
});

const SectionCard = ({ title, children, icon: Icon, iconColor }) => (
  <Box sx={{
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    p: { xs: 2, md: 3 },
    mb: 3,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20 }}>
      <h3 style={{ 
        margin: 0, 
        fontSize: 14, 
        fontWeight: 600, 
        color: "#111827", 
        textTransform: "uppercase", 
        letterSpacing: "0.05em",
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        {Icon && <Icon size={18} style={{ color: iconColor || "#0EA5E9" }} />}
        {title}
      </h3>
    </div>
    {children}
  </Box>
);

// ── main component ─────────────────────────────────────────────────────────────
const AddPurchase = ({ fetchData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { show, hide } = useLoading();
  
  const [formData, setFormData] = useState({
    supplier_id: "",
    email: "",
    mobile_no: "",
    landline_no: "",
    purchase_date: new Date().toISOString().split("T")[0],
    billing_address: "",
    image_path: null,
    imagePreview: "",
    branch: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchBranches = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const url = `${apiEndpoints.dropDown}?table=branches&todo=dropdown`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      show();
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [suppRes, prodRes] = await Promise.all([
          fetch(apiEndpoints.supplier, { headers }),
          fetch(apiEndpoints.product, { headers })
        ]);

        if (!suppRes.ok || !prodRes.ok) {
          throw new Error(`Server error: ${suppRes.status} / ${prodRes.status}`);
        }

        const suppData = await suppRes.json();
        const prodData = await prodRes.json();
        
        const suppliersList = suppData.data || [];
        const productsList = prodData.data || [];
        
        setSuppliers(suppliersList);
        setProducts(productsList);

        if (location.state?.editData) {
          const editData = location.state.editData;
          setIsEditMode(true);
          setEditId(editData.purchase_id);

          setFormData({
            supplier_id: editData.supplier || "",
            purchase_date: editData.purchase_date || new Date().toISOString().split("T")[0],
            landline_no: editData.landline_no || "",
            mobile_no: editData.mobile_no || "",
            email: editData.email || "",
            billing_address: editData.billing_address || "",
            image_path: null,
            imagePreview: editData.image_path || "",
            branch: editData.branch || "",
          });

          const itemsRes = await fetch(`${apiEndpoints.purchaseItems}?purchase_id=${editData.purchase_id}`, { headers });
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            if (itemsData.success && Array.isArray(itemsData.data)) {
              setPurchaseDetails(itemsData.data.map(item => ({
                item_id: item.item_id,
                product_id: item.product_id,
                product_name: productsList.find(p => String(p.id) === String(item.product_id))?.product_name || "Unknown Product",
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
              })));
            }
          }
        }
      } catch (err) {
        console.error("fetchInitialData failure:", err);
        setSnackbar({ open: true, message: `Load failed: ${err.message}`, severity: "error" });
      } finally {
        hide();
      }
    };

    fetchInitialData();
    fetchBranches();
  }, [location.state, fetchBranches, show, hide]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          image_path: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
      return;
    }

    if (name === "supplier_id") {
      const s = suppliers.find(sup => String(sup.supplier_id) === String(value));
      setFormData(prev => ({
        ...prev,
        supplier_id: value,
        mobile_no: s?.mobile_no || "",
        email: s?.email || "",
        landline_no: s?.landline_no || "",
        billing_address: s?.address || "",
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    let errs = {};
    if (!formData.supplier_id) errs.supplier_id = "Supplier required";
    if (!formData.purchase_date) errs.purchase_date = "Date required";
    if (!formData.mobile_no) errs.mobile_no = "Mobile required";
    if (!formData.branch) errs.branch = "Branch required";

    if (purchaseDetails.length === 0) errs.purchaseDetails = "Add at least one item";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
      return;
    }

    setIsLoading(true);
    show();

    try {
      const df = new FormData();
      df.append("supplier", formData.supplier_id);
      df.append("purchase_date", formData.purchase_date);
      df.append("mobile_no", formData.mobile_no);
      df.append("email", formData.email);
      df.append("landline_no", formData.landline_no);
      df.append("billing_address", formData.billing_address);
      df.append("branch", formData.branch);
      if (formData.image_path) df.append("image_path", formData.image_path);
      if (isEditMode) df.append("purchase_id", editId);

      const res = await fetch(apiEndpoints.purchase, {
        method: "POST",
        body: df,
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to save purchase");

      const pid = isEditMode ? editId : result.id;
      
      // Save details
      await Promise.all(purchaseDetails.map(async (d) => {
        const payload = { purchase_id: pid, product_id: d.product_id, quantity: d.quantity, price: d.price };
        const method = (isEditMode && d.item_id) ? "PUT" : "POST";
        const url = (isEditMode && d.item_id) ? `${apiEndpoints.purchaseItems}?id=${d.item_id}` : apiEndpoints.purchaseItems;
        
        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        // Stock update
        await fetch(isEditMode ? `${apiEndpoints.stock}?product_id=${d.product_id}` : apiEndpoints.stock, {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          body: JSON.stringify({ purchase_id: pid, product_id: d.product_id, quantity: d.quantity })
        });
      }));

      setSnackbar({ open: true, message: `Purchase ${isEditMode ? 'updated' : 'saved'}!`, severity: "success" });
      if (fetchData) fetchData();
      setTimeout(() => navigate("/purchase"), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setIsLoading(false);
      hide();
    }
  };

  const handleDeleteItem = async (item_id) => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await fetch(`${apiEndpoints.purchaseItems}?id=${item_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.success) {
        console.error("Failed to delete item from DB:", result);
        setSnackbar({ open: true, message: result.message || "Failed to delete item", severity: "error" });
      }
    } catch (err) {
      console.error("Delete item error:", err);
      setSnackbar({ open: true, message: "Error deleting item", severity: "error" });
    }
  };

  const grandTotal = purchaseDetails.reduce((acc, curr) => acc + (Number(curr.quantity || 0) * Number(curr.price || 0)), 0);

  return (
    <Box sx={{ 
      px: { xs: 1.5, sm: 4, md: 6 }, 
      py: { xs: 2, sm: 4 }, 
      width: "100%", 
      maxWidth: "100%", 
      overflowX: "hidden" 
    }}>
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* ── SECTION 1: Purchase Information ── */}
        <SectionCard title="Purchase Information" icon={Package} iconColor="#3B82F6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>
            <Field label="Purchase Date *" icon={Calendar} error={errors.purchase_date}>
              <input name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange}
                style={inputSx(!!errors.purchase_date)} />
            </Field>

            <Field label="Branch *" icon={Building2} error={errors.branch}>
              <SearchableSelect
                value={formData.branch}
                placeholder="Select Branch"
                options={branches.map(b => ({ value: String(b.branch_id), label: b.branch_name }))}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, branch: val }));
                  if (errors.branch) setErrors(p => ({ ...p, branch: "" }));
                }}
              />
            </Field>

            <Field label="Supplier *" icon={User} error={errors.supplier_id}>
              <SearchableSelect
                value={formData.supplier_id}
                placeholder="Select Supplier"
                options={suppliers.map(s => ({ value: String(s.supplier_id), label: s.supplier_name }))}
                onChange={(val) => {
                  const s = suppliers.find(sup => String(sup.supplier_id) === String(val));
                  setFormData(prev => ({
                    ...prev,
                    supplier_id: val,
                    mobile_no: s?.mobile_no || "",
                    email: s?.email || "",
                    landline_no: s?.landline_no || "",
                    billing_address: s?.address || "",
                  }));
                  if (errors.supplier_id) setErrors(p => ({ ...p, supplier_id: "" }));
                }}
              />
            </Field>

            <Field label="Mobile Number *" icon={Phone} error={errors.mobile_no}>
              <input name="mobile_no" value={formData.mobile_no} onChange={handleChange}
                placeholder="10-digit number" style={inputSx(!!errors.mobile_no)} />
            </Field>

            <Field label="Email Address" icon={Mail}>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="supplier@example.com" style={inputSx(false)} />
            </Field>

            <Field label="Purchase Receipt / Image" icon={Upload}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 2 }}>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: "1px solid #0EA5E9", color: "#0EA5E9", cursor: "pointer", background: "#fff",
                }}>
                  <Upload size={14} /> Choose Image
                  <input type="file" name="image_path" accept="image/*" hidden onChange={handleChange} />
                </label>
                {formData.imagePreview && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={formData.imagePreview.startsWith("blob:") ? formData.imagePreview : `${apiEndpoints.blob}${formData.imagePreview}`}
                      alt="Preview"
                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #E5E7EB" }}
                    />
                    <button type="button"
                      onClick={() => setFormData((p) => ({ ...p, image_path: null, imagePreview: "" }))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0 }}
                    ><X size={16} /></button>
                  </div>
                )}
              </div>
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Billing Address" icon={MapPin}>
                <textarea name="billing_address" value={formData.billing_address} onChange={handleChange}
                  placeholder="Full address..." rows={2}
                  style={{ ...inputSx(false), resize: "vertical", height: "auto" }}
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 2: Order Items ── */}
        <SectionCard title="Order Inventory Items" icon={ShoppingCart} iconColor="#10B981">
          {errors.purchaseDetails && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errors.purchaseDetails}</Alert>
          )}
          <PurchaseDetailsForm
            rows={purchaseDetails}
            onRowsChange={setPurchaseDetails}
            products={products}
            isEditMode={isEditMode}
            isSubmitting={isLoading}
            onDeleteItem={handleDeleteItem}
          />
        </SectionCard>

        {/* ── SECTION 3: Summary & Actions ── */}
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", mt: 4, gap: 3 }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: { xs: 3, md: 5 },
            background: "#F8FAFC",
            padding: "16px 28px",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
          }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: '0.05em', mb: 0.5 }}>Total Items</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>{purchaseDetails.length}</Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0', height: 40, alignSelf: 'center' }} />
            
            <Box>
              <Typography sx={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: '0.05em', mb: 0.5 }}>Total Qty</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>{purchaseDetails.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0)}</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0', height: 40, alignSelf: 'center' }} />

            <Box>
              <Typography sx={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: '0.05em', mb: 0.5 }}>Grand Total</Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#0EA5E9", display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>₹</span>
                {grandTotal.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/purchase")}
              sx={{
                borderRadius: "10px",
                px: 3,
                textTransform: "none",
                color: "#64748B",
                borderColor: "#E2E8F0",
                "&:hover": { bgcolor: "#F8FAF8", borderColor: "#CBD5E1" }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={<Save size={16} />}
              sx={{
                backgroundColor: "rgba(14, 165, 233, 0.9)",
                "&:hover": { backgroundColor: "rgba(14, 165, 233, 1)" },
                color: "#fff",
                borderRadius: "10px",
                px: 4,
                py: 1.2,
                fontWeight: 600,
                textTransform: "none",
                fontSize: 14,
              }}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update Purchase" : "Save Purchase"}
            </Button>
          </Stack>
        </Box>
      </form>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddPurchase;