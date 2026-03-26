import apiEndpoints from "../../../apiconfig";

export function formatCurrency(v = 0) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function printQuotation(quote = {}, templateId = "standard") {
  if (!quote) return;

  const quotationNo = quote.quotation_no || quote.quotationNo || "-";
  const dateStr = new Date(quote.created_on || Date.now()).toLocaleDateString();
  const jobcardNo = quote.jobcard_no || quote.jobcardNo || "-";
  const vehicleNo = quote.vehicle_number || quote.number_plate || quote.numberPlate || quote.vehicleNumber || quote.vehicleNo || quote.vehicle_no || quote.reg_no || "-";
  const vehicleModel = quote.vehicle_model || quote.vehicleModel || quote.model || quote.vehicle_details?.model || "-";
  const preparedBy = quote.created_by_name || quote.prepared_by || quote.admin?.userName || "Admin";
  
  const customer = {
    name: quote.customer_name || quote.customer?.name || "Customer",
    mobile: quote.customer_mobile || quote.customer?.mobile || "-",
    address: quote.customer_address || quote.customer?.address || "",
  };

  // Improved data extraction for parts/labour
  let items = [];
  if (Array.isArray(quote.items) && quote.items.length > 0) {
    items = quote.items;
  } else {
    // Try to extract from parts/labour strings or arrays
    const rawParts = typeof quote.parts === "string" ? JSON.parse(quote.parts || "[]") : (quote.parts || []);
    const rawLabour = typeof quote.labour === "string" ? JSON.parse(quote.labour || "[]") : (quote.labour || []);
    
    items = [
      ...rawParts.map(p => ({ ...p, category: "Product", product: p.name || p.product || "" })),
      ...rawLabour.map(l => ({ ...l, category: "Service", product: l.title || l.name || "" }))
    ];
  }

  const parts = items.filter((i) => i.category === "Product" || i.type === "Product");
  const labour = items.filter((i) => i.category === "Service" || i.type === "Service");

  const totals = typeof quote.totals === "string" ? JSON.parse(quote.totals || "{}") : quote.totals || {};
  
  // Use totals from object if available, else calculate
  const partsTotal = Number(totals.partsTotal ?? parts.reduce((acc, p) => acc + (Number(p.amount || p.total || 0)), 0));
  const labourTotal = Number(totals.labourTotal ?? labour.reduce((acc, l) => acc + (Number(l.amount || l.total || 0)), 0));
  const discountAmount = Number(totals.discountAmount || totals.discount || 0);
  const gstAmount = Number(totals.gstAmount || totals.gst || 0);
  const gstRate = Number(totals.gstRate || quote.gstRate || 18);
  const grandTotal = Number(totals.grandTotal || quote.grand_total || (partsTotal + labourTotal - discountAmount + gstAmount));

  // Company details - Prioritize Branch info
  const admin = quote.admin || {};
  const branch = quote.branch || quote.branch_details || {};
  const company = {
    name: branch.branch_name || branch.name || quote.branch_name || admin.userName || "Your Garage",
    address: branch.address || branch.branch_address || quote.branch_address || admin.address || "",
    city: branch.city || branch.branch_city || quote.branch_city || admin.city_name || "",
    state: branch.state || branch.branch_state || quote.branch_state || admin.state_name || "",
    pincode: branch.pincode || branch.branch_pincode || quote.branch_pincode || admin.pincode || "",
    email: branch.email || branch.branch_email || quote.branch_email || admin.email || "",
    phone: branch.contact_number || branch.contact_no || branch.phone || quote.branch_contact || admin.phone_number || "-",
    logo: branch.image_path || branch.branch_logo || branch.logo || admin.profile_image || null,
  };

  const baseUrl = apiEndpoints.blob;
  const logoUrl = company.logo ? baseUrl + company.logo : null;

  const data = {
    quotationNo,
    dateStr,
    jobcardNo,
    vehicleNo,
    vehicleModel,
    preparedBy,
    customer,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountAmount,
    gstAmount,
    gstRate,
    grandTotal,
    company,
    logoUrl,
    notes: quote.notes || ""
  };

  const htmlContent = getStandardTemplate(data);

  const popup = window.open("", "_blank", "width=1000,height=800");
  if (!popup) {
    alert("Pop-up blocked! Please allow pop-ups for this site to print the quotation.");
    return;
  }
  popup.document.write(htmlContent);
  popup.document.close();

  popup.onload = () => {
    setTimeout(() => popup.print(), 300);
  };
}

function getStandardTemplate(data) {
  const {
    quotationNo,
    dateStr,
    jobcardNo,
    vehicleNo,
    vehicleModel,
    preparedBy,
    customer,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountAmount,
    gstAmount,
    gstRate,
    grandTotal,
    company,
    logoUrl,
    notes
  } = data;

  const partsRows = parts
    .map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(it.product || it.name || "-")}</td>
        <td class="right">${it.qty || it.quantity || 1}</td>
        <td class="right">₹ ${formatCurrency(it.rate || it.price || 0)}</td>
        <td class="right">₹ ${formatCurrency(it.amount || it.total || 0)}</td>
      </tr>
    `).join("");

  const labourRows = labour
    .map((l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.product || l.name || l.title || "-")}</td>
        <td class="right">₹ ${formatCurrency(l.amount || l.total || 0)}</td>
      </tr>
    `).join("");

  const css = `
    :root { --primary: #0EA5E9; --text-muted: #64748B; }
    body { font-family: 'Arial'; background: #f0f3f9; padding: 20px; color: #1E293B; }
    .page { background: #fff; max-width: 900px; margin: auto; padding: 25px; border-radius: 12px; border: 1px solid #E2E8F0; min-height: 95vh; display: flex; flex-direction: column; }
    header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .logo-box { width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; }
    .company-details { font-size: 13px; color: var(--text-muted); line-height: 1.4; }
    .title-area { text-align: right; }
    .title-area h2 { margin: 0; color: var(--primary); font-size: 26px; font-weight: 800; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    h3 { margin: 25px 0 10px; font-size: 16px; border-bottom: 2px solid #F1F5F9; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: #F8FAFC; text-align: left; padding: 12px; font-weight: 700; border-bottom: 2px solid #E2E8F0; }
    td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; }
    .right { text-align: right; }
    .totals-box { margin-top: 30px; max-width: 340px; margin-left: auto; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; }
    .t-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
    .t-final { font-size: 18px; font-weight: 800; border-top: 2px solid #E2E8F0; margin-top: 12px; padding-top: 12px; color: #0F172A; }
    .notes-section { margin-top: 25px; padding: 10px 15px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 4px; font-size: 11px; }
    footer { margin-top: auto; padding-top: 40px; display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); }
    @media print { body { background: #fff !important; padding: 0; } .page { border: none; border-radius: 0; min-height: auto; } }
  `;

  return `
  <html>
    <head><title>Quotation ${quotationNo}</title><style>${css}</style></head>
    <body>
      <div class="page">
        <header>
          <div style="display:flex; gap:20px;">
            <div class="logo-box">
              ${logoUrl 
                ? `<img src="${logoUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" />` 
                : `<div style="width:80px; height:80px; background:#E0F2FE; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#0EA5E9; font-size:24px;">GM</div>`
              }
            </div>
            <div>
              <h2 style="margin:0 0 5px; color:#0F172A;">${company.name}</h2>
              <div class="company-details">
                ${company.address}<br>
                ${company.city}, ${company.state} - ${company.pincode}<br>
                Email: ${company.email}<br>
                Phone: ${company.phone}
              </div>
            </div>
          </div>
          <div class="title-area">
            <h2>QUOTATION</h2>
            <div style="margin-top:8px;">No: <b>${quotationNo}</b></div>
            <div>Date: ${dateStr}</div>
            ${jobcardNo !== "-" ? `<div>Job Card: <b>${jobcardNo}</b></div>` : ""}
          </div>
        </header>

        <div class="info-grid">
          <div>
            <h3>Bill To</h3>
            <div style="font-weight:700; font-size:15px; margin-bottom:4px;">${customer.name}</div>
            ${customer.address ? `<div class="company-details">${customer.address}</div>` : ""}
            <div style="margin-top:6px; font-size:13px;">Mobile: <b>${customer.mobile}</b></div>
            <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #E5E7EB;">
               <div style="font-size:12px; color:var(--text-muted);">Vehicle Info:</div>
               <div style="font-weight:700;">${vehicleNo} ${vehicleModel !== "-" ? `(${vehicleModel})` : ""}</div>
            </div>
          </div>
          <div>
            <h3>Quotation Details</h3>
            <div style="font-size:13px; margin-bottom:4px;">Prepared By: <b>${preparedBy}</b></div>
            <div style="font-size:13px; color:var(--text-muted); line-height:1.4;">
               This estimate is based on a preliminary inspection of the vehicle. 
            </div>
          </div>
        </div>

        <h3>Parts & Products</h3>
        <table>
          <thead>
            <tr><th>#</th><th>Description</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr>
          </thead>
          <tbody>
            ${partsRows || `<tr><td colspan="5" style="text-align:center; color:#94A3B8; padding:20px;">No parts listed</td></tr>`}
          </tbody>
        </table>

        ${labourRows ? `
          <h3>Labour & Services</h3>
          <table>
            <thead>
              <tr><th>#</th><th>Description</th><th class="right">Amount</th></tr>
            </thead>
            <tbody>
              ${labourRows}
            </tbody>
          </table>
        ` : ""}

        <div class="totals-box">
          <div class="t-row"><span>Parts Total</span><span>₹ ${formatCurrency(partsTotal)}</span></div>
          <div class="t-row"><span>Labour Total</span><span>₹ ${formatCurrency(labourTotal)}</span></div>
          <div class="t-row"><span>Discount</span><span>- ₹ ${formatCurrency(discountAmount)}</span></div>
          <div class="t-row"><span>GST (${formatCurrency(gstRate)}%)</span><span>₹ ${formatCurrency(gstAmount)}</span></div>
          <div class="t-row t-final"><span>Estimated Total</span><span>₹ ${formatCurrency(grandTotal)}</span></div>
        </div>

        <div class="notes-section">
          <strong>Important Note:</strong>
          <div style="margin-top:5px; line-height:1.4;">
            ${notes || "The final service amount may vary based on the actual condition of the vehicle and additional parts or labor required during service. This quotation is valid for 15 days."}
          </div>
        </div>

        <footer style="margin-top:50px;">
          <div>Valid for 15 days from the date of issue.</div>
          <div style="text-align:right;">
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:30px;">For ${company.name}</div>
            <div style="border-bottom:1px solid #CCC; width:180px; display:inline-block;"></div>
            <div style="font-size:11px; margin-top:5px; font-weight:700;">Authorized Signatory</div>
          </div>
        </footer>
      </div>
    </body>
  </html>
  `;
}
