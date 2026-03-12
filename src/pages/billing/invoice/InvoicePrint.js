import apiEndpoints from "../../../apiconfig";

export function formatCurrency(v = 0) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


export function printInvoice(invoice = {}, templateId = "standard") {
  if (!invoice) return;

  const invoiceNo = invoice.invoiceNumber || invoice.invoice_no || "AUTO";
  const dateStr = new Date().toLocaleDateString();

  const customer = {
    name: invoice.customerName || invoice.customer_name || "Customer",
    address: invoice.customerAddress || "",
    mobile:
      invoice.customer_mobile ||
      invoice.customerMobile ||
      invoice.customer?.mobile ||
      "-",
  };

  const vehicleNo = invoice.vehicle_number || invoice.numberPlate || "-";

  const parts =
    invoice.parts ||
    invoice.items?.filter((i) => i.category === "Product") ||
    [];

  const labour =
    invoice.labour ||
    invoice.items?.filter((i) => i.category === "Service") ||
    [];

  const partsTotal = parts.reduce((s, p) => s + Number(p.total), 0);
  const labourTotal = labour.reduce((s, l) => s + Number(l.total), 0);

  /* =========================
     🔥 IMPORTANT FIX START
  ========================== */

  const totals = invoice.totals || {};

  const discountPercent = Number(
    totals.discountPercent ?? invoice.discount ?? 0
  );

  const discountAmount = (partsTotal * discountPercent) / 100;

  const subtotal = Number(
    totals.subtotal ?? partsTotal - discountAmount
  );

  const gstPercent = Number(
    totals.gstPercent ?? invoice.gst ?? 0
  );

  const gstAmount = (subtotal * gstPercent) / 100;

  const grandTotal =
    Number(totals.grandTotal ?? invoice.grandTotal) ||
    Math.round(subtotal + gstAmount + labourTotal);

  /* =========================
     🔥 IMPORTANT FIX END
  ========================== */

  // Company details
  const admin = invoice.admin || {};
  const company = {
    name: admin.userName || "Your Garage",
    address: admin.address || "",
    city: admin.city_name || "",
    state: admin.state_name || "",
    pincode: admin.pincode || "",
    email: admin.email || "",
    phone: admin.phone_number || "-",
    logo: admin.profile_image || null,
  };

  const baseUrl = apiEndpoints.blob;
  const logoUrl = company.logo ? baseUrl + company.logo : null;

  // Data object for templates
  const data = {
    invoiceNo,
    dateStr,
    customer,
    vehicleNo,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountPercent,
    discountAmount,
    subtotal,
    gstPercent,
    gstAmount,
    grandTotal,
    company,
    logoUrl,
  };

  let htmlContent = "";

  switch (templateId) {
    case "modern":
      htmlContent = getModernTemplate(data);
      break;
    case "minimalist":
      htmlContent = getMinimalistTemplate(data);
      break;
    case "professional":
      htmlContent = getProfessionalTemplate(data);
      break;
    case "standard":
    default:
      htmlContent = getStandardTemplate(data);
      break;
  }

  const popup = window.open("", "_blank", "width=1000,height=800");
  popup.document.write(htmlContent);
  popup.document.close();

  popup.onload = () => {
    setTimeout(() => popup.print(), 300);
  };
}


// ==========================================
// TEMPLATE 1: STANDARD (ORIGINAL)
// ==========================================
function getStandardTemplate(data) {
  const {
    invoiceNo,
    dateStr,
    customer,
    vehicleNo,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountPercent,
    discountAmount,
    subtotal,
    gstPercent,
    gstAmount,
    grandTotal,
    company,
    logoUrl,
  } = data;

  const partsHtml = parts
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td class="right">${p.qty}</td>
        <td class="right">₹ ${formatCurrency(p.price)}</td>
        <td class="right">₹ ${formatCurrency(p.total)}</td>
      </tr>`
    )
    .join("");

  const labourHtml = labour
    .map(
      (l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.name)}</td>
        <td class="right">₹ ${formatCurrency(l.total)}</td>
      </tr>`
    )
    .join("");

  const css = `
    :root {
      --primary: #f97316;
      --text-muted: #555;
    }

    html, body {
      height: 100%;
      margin: 0;
    }

    body {
      font-family: 'Arial';
      background: #f0f3f9;
      padding: 20px;
      box-sizing: border-box;
    }

    .page {
      background: #fff;
      max-width: 900px;
      margin: auto;
      padding: 30px;
      border-radius: 10px;
      border: 1px solid #e5e5e5;
      min-height: 95vh;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }

    header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }

    .logo {
      width: 70px;
      height: 70px;
      background: #eaf3ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }


    .company-details {
      font-size: 13px;
      color: var(--text-muted);
    }

    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h2 {
      margin: 0;
      color: var(--primary);
    }

    h3 {
      margin-top: 25px;
      color: #333;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 14px;
    }
    th {
      background: #f4f8ff;
      text-align: left;
      padding: 10px;
      font-weight: bold;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    .right {
      text-align: right;
    }

    .totals-box {
      margin-top: 25px;
      max-width: 320px;
      margin-left: auto;
      padding: 15px;
      border-radius: 10px;
      background: #f8fbff;
      border: 1px solid #dbe7f5;
    }
    .t-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      font-size: 15px;
    }
    .t-final {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid #d0d7e2;
      margin-top: 10px;
      padding-top: 10px;
    }

    @media print {
  body {
    background: #ffffff !important;
  }

  .page {
    min-height: auto !important;
    height: auto !important;
    border-radius: 0;
  }
}
  `;

  return `
  <html>
    <head>
      <title>Invoice ${invoiceNo}</title>
      <style>${css}</style>
    </head>

    <body>
      <div class="page">
        // <script>window.__PREVIEW__ = true;</script>

        <!-- HEADER -->
        <header>
          <div style="display:flex; gap:15px;">
            <div class="logo">
  ${logoUrl
      ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;" />`
      : `<span>GM</span>`
    }
</div>

            <div>
              <h2>${company.name}</h2>
              <div class="company-details">
                ${company.address}<br>
                ${company.city}, ${company.state} - ${company.pincode}<br>
                Email: ${company.email}<br>
                Phone: ${company.phone}
              </div>
            </div>
          </div>

          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <div>Invoice No: <b>${invoiceNo}</b></div>
            <div>Date: ${dateStr}</div>
          </div>
        </header>

        <!-- INFO GRID -->
        <div class="info-grid">
          <div>
            <h3>Bill To</h3>
            <div>${customer.name}</div>
            <div>${customer.address}</div>
            <div>Mobile: ${customer.mobile}</div>
          </div>

          <div>
            <h3>Vehicle Info</h3>
            <div>Vehicle No: ${vehicleNo}</div>
          </div>
        </div>

        <!-- PARTS -->
        <h3>Parts</h3>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Description</th>
              <th class="right">Qty</th>
              <th class="right">Rate</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${partsHtml ||
    `<tr><td colspan="5" style="text-align:center;color:#777;padding:15px;">No parts added</td></tr>`
    }
          </tbody>
        </table>

        <!-- LABOUR -->
        <h3>Labour Charges</h3>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Description</th><th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${labourHtml ||
    `<tr><td colspan="3" style="text-align:center;color:#777;padding:15px;">No labour added</td></tr>`
    }
          </tbody>
        </table>

        <!-- TOTALS -->
        <div class="totals-box">
          <div class="t-row"><div>Parts Total</div><div>₹ ${formatCurrency(
      partsTotal
    )}</div></div>

          <div class="t-row"><div>Discount (${discountPercent}%)</div><div>- ₹ ${formatCurrency(
      discountAmount
    )}</div></div>

          <div class="t-row"><div>GST (${gstPercent}%)</div><div>₹ ${formatCurrency(
      gstAmount
    )}</div></div>

          <div class="t-row"><div>Labour Total</div><div>₹ ${formatCurrency(
      labourTotal
    )}</div></div>

          <div class="t-row t-final">
            <div>Grand Total</div>
            <div>₹ ${formatCurrency(grandTotal)}</div>
          </div>
        </div>

      </div>
      </body>
  </html>
  `;
}

// ==========================================
// TEMPLATE 2: MODERN
// ==========================================
function getModernTemplate(data) {
  const {
    invoiceNo,
    dateStr,
    customer,
    vehicleNo,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountPercent,
    discountAmount,
    subtotal,
    gstPercent,
    gstAmount,
    grandTotal,
    company,
    logoUrl,
  } = data;

  const partsRows = parts
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td class="text-right">${p.qty}</td>
        <td class="text-right">₹ ${formatCurrency(p.price)}</td>
        <td class="text-right">₹ ${formatCurrency(p.total)}</td>
      </tr>`
    )
    .join("");

  const labourRows = labour
    .map(
      (l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.name)}</td>
        <td class="text-right">₹ ${formatCurrency(l.total)}</td>
      </tr>`
    )
    .join("");

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --primary: #2563eb;
  --secondary: #eff6ff;
  --text-dark: #1e293b;
  --text-light: #64748b;
}
html, body {
  overflow: hidden;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-dark);
  background: #f8fafc;
  margin: 0;
  padding: 20px;
  height: auto;
}



/* 🔥 KEY CHANGE */
.page {
  background: #fff;
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-radius: 8px;

  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* unchanged */
header {
  background: var(--primary);
  color: white;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
}

header .company-info {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
  text-align: right;
}

.meta-bar {
  background: var(--text-dark);
  color: white;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

/* 🔥 KEY CHANGE */
.content {
  padding:20px;
  // flex: 1;
}

.bill-to-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-light);
  font-weight: 600;
  margin-bottom: 10px;
}

.client-details {
  font-size: 15px;
  line-height: 1.6;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

th {
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-light);
  padding: 12px 0;
  border-bottom: 2px solid #e2e8f0;
}

td {
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.text-right { text-align: right; }

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}

.totals {
  display: flex;
  justify-content: flex-end;
}

.totals-table {
  width: 300px;
}

.totals-table td {
  border: none;
  padding: 8px 0;
}

.total-row {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  padding-top: 15px;
  border-top: 2px solid #e2e8f0;
}

/* ---------------- PRINT ---------------- */
@media print {
  body {
    background: #f8fafc !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .page {
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0;
  }

  /* 🔥 spacing for page 2+ */
  .content {
    padding-top: 20mm;
  }

  @page {
    margin: 18mm 15mm 25mm 15mm;
  }
}
  
`;

  return `
    <html>
      <head><title>Invoice ${invoiceNo}</title><style>${css}</style></head>
      <body>
        <div class="page">
         <script>window.__PREVIEW__ = true;</script>

          <header>
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="
                  width:70px;
                  height:70px;
                  background:#2563eb;
                  border-radius:10px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  overflow:hidden;
                ">
                  ${logoUrl
      ? `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;" />`
      : `<strong style="font-size:24px;">${company.name?.charAt(0) || "G"}</strong>`
    }
                </div>
                <h1>INVOICE</h1>
            </div>
            <div class="company-info">
              <strong>${company.name}</strong><br>
              ${company.email}<br>
              ${company.phone}
            </div>
          </header>
          
          <div class="meta-bar">
            <div>NO: <strong>${invoiceNo}</strong></div>
            <div>DATE: <strong>${dateStr}</strong></div>
          </div>

          <div class="content">
            <div class="bill-to-section">
              <div>
                <div class="section-title">BILL TO</div>
                <div class="client-details">
                  <strong>${customer.name}</strong><br>
                  ${customer.address}<br>
                  ${customer.mobile}
                </div>
              </div>
              <div style="text-align:right;">
                <div class="section-title">VEHICLE DETAILS</div>
                <div class="client-details">
                  ${vehicleNo}
                </div>
              </div>
            </div>

            <div class="section-title">PARTS & PRODUCTS</div>
            <table>
              <thead>
                <tr>
                  <th style="width:50px">#</th>
                  <th>Item Description</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${partsRows ||
    `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">No parts</td></tr>`
    }
              </tbody>
            </table>

            <div class="section-title">LABOUR & SERVICES</div>
            <table>
              <thead>
                <tr>
                   <th style="width:50px">#</th>
                   <th>Description</th>
                   <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${labourRows ||
    `<tr><td colspan="3" style="text-align:center;color:#94a3b8;padding:20px;">No labour charges</td></tr>`
    }
              </tbody>
            </table>

            <div class="totals">
              <table class="totals-table">
                <tr><td>Parts Total</td><td class="text-right">₹ ${formatCurrency(
      partsTotal
    )}</td></tr>
                <tr><td>Labour Total</td><td class="text-right">₹ ${formatCurrency(
      labourTotal
    )}</td></tr>
                
                ${discountAmount > 0
      ? `<tr><td style="color:#ef4444">Discount (${discountPercent}%)</td><td class="text-right" style="color:#ef4444">- ₹ ${formatCurrency(
        discountAmount
      )}</td></tr>`
      : ""
    }
                
                <tr><td>GST (${gstPercent}%)</td><td class="text-right">₹ ${formatCurrency(
      gstAmount
    )}</td></tr>
                <tr><td colspan="2"><div class="total-row" style="display:flex;justify-content:space-between;"><span>Total</span> <span>₹ ${formatCurrency(
      grandTotal
    )}</span></div></td></tr>
              </table>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ==========================================
// TEMPLATE 3: MINIMALIST
// ==========================================
function getMinimalistTemplate(data) {
  const {
    invoiceNo,
    dateStr,
    customer = {},
    vehicleNo = "-",
    parts = [],
    labour = [],
    partsTotal = 0,
    labourTotal = 0,
    discountPercent = 0,
    discountAmount = 0,
    subtotal = 0,
    gstPercent = 0,
    gstAmount = 0,
    grandTotal = 0,
    company = {},
    logoUrl, // 👈 allow direct logoUrl also
  } = data;

  const logo =
    logoUrl ||
    company.logoUrl ||
    company.logo ||
    null;

  const partsRows = parts
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(p.name || "-")}</td>
        <td class="text-right">${p.qty ?? "-"}</td>
        <td class="text-right">${formatCurrency(p.price ?? 0)}</td>
        <td class="text-right">${formatCurrency(p.total ?? 0)}</td>
      </tr>`
    )
    .join("");

  const labourRows = labour
    .map(
      (l) => `
      <tr>
        <td colspan="3">${escapeHtml(l.name || "-")} (Labour)</td>
        <td class="text-right">${formatCurrency(l.total ?? 0)}</td>
      </tr>`
    )
    .join("");

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');

@page {
  margin-top: 20mm;
}

body {
  font-family: 'Courier Prime', monospace;
  color: #000;
  max-width: 800px;
  margin: auto;
  box-sizing: border-box;
  padding-top: 40px; /* 🔥 preview fix */
}

@media print {
  body {
    // padding-top: 20mm;
  }
}

h1 {
  font-size: 22px;
  margin-bottom: 30px;
  text-transform: uppercase;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
}

/* ---------- HEADER ---------- */
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 60px;
}

.col {
  width: 45%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.brand img {
  height: 55px;
  max-width: 120px;
  object-fit: contain;
}

.brand-name {
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
}

.label {
  font-size: 10px;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: #555;
}

.val {
  margin-bottom: 14px;
  font-size: 14px;
}

/* ---------- TABLE ---------- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
  page-break-inside: auto;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}

th {
  text-align: left;
  border-bottom: 1px solid #000;
  padding: 10px 0;
  font-weight: normal;
  font-size: 12px;
  text-transform: uppercase;
}

td {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.text-right {
  text-align: right;
}

/* ---------- TOTALS ---------- */
.totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  page-break-inside: avoid;
  break-inside: avoid;
}

.total-row {
  display: flex;
  justify-content: space-between;
  width: 260px;
  margin-bottom: 8px;
  font-size: 14px;
}

.total-row.discount {
  color: #555;
}

.total-row.gst {
  color: #000;
}

.total-row.grand {
  font-size: 18px;
  border-top: 2px solid #000;
  padding-top: 10px;
  margin-top: 10px;
  font-weight: bold;
}
`;

  return `
<html>
  <head>
    <title>Invoice #${invoiceNo}</title>
    <style>${css}</style>
  </head>
  <body>

    <div class="brand">
      ${logo ? `<img src="${logo}" />` : ""}
      <div class="brand-name">${company.name || "-"}</div>
    </div>

    <div class="header">
  <!-- LEFT -->
  <div class="col">

    <div class="label">From</div>
    <div class="val">
      ${company.email || "-"}<br>
      ${company.phone || "-"}
    </div>

    <!-- 👇 MOVED HERE -->
    <div class="label">Invoice No</div>
    <div class="val"><strong>${invoiceNo}</strong></div>

    <div class="label">Date</div>
    <div class="val">${dateStr}</div>
  </div>

  <!-- RIGHT -->
  <div class="col">
    <div class="label">Bill To</div>
    <div class="val">
      <strong>${customer.name || "-"}</strong><br>
      ${customer.address || "-"}<br>
      ${customer.mobile || "-"}
    </div>

    <div class="label">Vehicle</div>
    <div class="val">${vehicleNo}</div>
  </div>
</div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${partsRows}
        ${labourRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal + labourTotal)}</span>
      </div>

      ${discountAmount > 0
      ? `<div class="total-row discount">
               <span>Discount (${discountPercent}%)</span>
               <span>- ${formatCurrency(discountAmount)}</span>
             </div>`
      : ""
    }

      ${gstAmount > 0
      ? `<div class="total-row gst">
               <span>GST (${gstPercent}%)</span>
               <span>${formatCurrency(gstAmount)}</span>
             </div>`
      : ""
    }
    <div class="total-row">
      <span>Labour Charges</span>
      <span>${formatCurrency(labourTotal)}</span>
    </div>

      <div class="total-row grand">
        <span>Total</span>
        <span>${formatCurrency(grandTotal)}</span>
      </div>
    </div>

  </body>
</html>
`;
}



// ==========================================
// TEMPLATE 4: PROFESSIONAL
// ==========================================
function getProfessionalTemplate(data) {
  const {
    invoiceNo,
    dateStr,
    customer,
    vehicleNo,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountPercent,
    discountAmount,
    subtotal,
    gstPercent,
    gstAmount,
    grandTotal,
    company,
    logoUrl,
  } = data;

  const css = `
   @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  padding: 40px;
  color: #333;
}

.container {
  // border: 1px solid #ccc;
  padding: 10px;
  max-width: 900px;
}

/* ---------------- HEADER ---------------- */
.header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.logo-area img {
  height: 50px;
}

.company-addr {
  font-size: 12px;
  margin-top: 10px;
  line-height: 1.4;
  color: #555;
}

.inv-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  text-align: right;
}

.inv-detail {
  text-align: right;
  font-size: 14px;
  margin-top: 5px;
}

/* ---------------- INFO ROW ---------------- */
.row {
  display: flex;
  margin-bottom: 30px;
  gap: 40px;
}

.box {
  flex: 1;
}

.box-title {
  font-weight: bold;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
  padding-bottom: 5px;
  text-transform: uppercase;
  font-size: 13px;
}

.box-content {
  font-size: 14px;
  line-height: 1.6;
}

/* ---------------- TABLE ---------------- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;

  /* 🔥 allow table to break across pages */
  page-break-inside: auto;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}

th {
  background: #333;
  color: white;
  padding: 10px;
  text-align: left;
  font-size: 13px;
  text-transform: uppercase;
}

td {
  border-bottom: 1px solid #ddd;
  padding: 10px;
  font-size: 14px;
}

.text-right {
  text-align: right;
}

/* ---------------- TOTALS (CRITICAL FIX) ---------------- */
.summary-section {
  width: 40%;
  margin-left: auto;

  /* 🔥 PREVENT SPLITTING */
  page-break-inside: avoid;
  break-inside: avoid;
  page-break-before: auto;
}

.s-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.s-total {
  font-weight: bold;
  font-size: 18px;
  border-bottom: 2px solid #333;
  color: #000;
}


/* ---------------- PRINT ---------------- */
@media print {
  body {
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .container {
    box-shadow: none !important;
    
  }

  .header {
    border-bottom: 3px solid #111 !important;
  }

  .inv-title {
    color: #111 !important;
  }

  table th {
    background: #111 !important;
    color: #ffffff !important;
    border: 1px solid #111 !important;
  }

  table td {
    background: #ffffff !important;
    color: #111 !important;
    border: 1px solid #ddd !important;
  }

  .summary-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}

  `;

  return `
    <html>
      <head><title>Invoice ${invoiceNo}</title><style>${css}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-area" style="display:flex; align-items:center; gap:12px;">
  ${logoUrl
      ? `<img src="${logoUrl}" />`
      : ""
    }
  <div>
    <h2 style="margin:0; line-height:1;">${company.name}</h2>
    <div class="company-addr">
      ${company.address}<br>
      ${company.city}, ${company.state}, ${company.pincode}<br>
      ${company.email} | ${company.phone}
    </div>
  </div>
</div>

            <div>
              <div class="inv-title">INVOICE</div>
              <div class="inv-detail">#${invoiceNo}</div>
              <div class="inv-detail">${dateStr}</div>
            </div>
          </div>
          
          <div class="row">
            <div class="box">
              <div class="box-title">Bill To</div>
              <div class="box-content">
                <strong>${customer.name}</strong><br>
                ${customer.address}<br>
                Phone: ${customer.mobile}
              </div>
            </div>
            <div class="box">
              <div class="box-title">Vehicle Details</div>
              <div class="box-content">
                Vehicle No: <strong>${vehicleNo}</strong>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${parts.map(p => `
                <tr>
                  <td>${escapeHtml(p.name)}</td>
                  <td class="text-right">${p.qty}</td>
                  <td class="text-right">${formatCurrency(p.price)}</td>
                  <td class="text-right">${formatCurrency(p.total)}</td>
                </tr>
              `).join('')}
              
              ${labour.map(l => `
                <tr>
                   <td>${escapeHtml(l.name)} (Labour)</td>
                   <td class="text-right">-</td>
                   <td class="text-right">-</td>
                   <td class="text-right">${formatCurrency(l.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
         <div class="summary-section">
  <div class="s-row">
    <span>Parts Total</span>
    <span>${formatCurrency(partsTotal)}</span>
  </div>

  ${discountAmount > 0
      ? `<div class="s-row">
         <span>Discount</span>
         <span>- ${formatCurrency(discountAmount)}</span>
       </div>`
      : ''
    }

  <div class="s-row">
    <span>GST (${gstPercent}%)</span>
    <span>${formatCurrency(gstAmount)}</span>
  </div>

  <div class="s-row">
    <span>Labour Charges</span>
    <span>${formatCurrency(labourTotal)}</span>
  </div>

  <div class="s-row s-total">
    <span>Total</span>
    <span>₹ ${formatCurrency(grandTotal)}</span>
  </div>
</div>

          
        </div>
      </body>
    </html>
  `;
}

export function getInvoiceTemplatePreview(templateId, mockData) {
  switch (templateId) {
    case "modern":
      return getModernTemplate(mockData);

    case "minimalist":
      return getMinimalistTemplate(mockData);

    case "professional":
      return getProfessionalTemplate(mockData);

    case "standard":
    default:
      return getStandardTemplate(mockData);
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


