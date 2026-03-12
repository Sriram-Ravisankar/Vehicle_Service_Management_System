// src/utils/printQuotation.js
import apiEndpoints from "../../../apiconfig";

export function formatCurrency(v = 0) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


export async function printQuotation(quote = {}, templateId = "standard") {
  if (!quote) return;

  // normalize fields
  const quotationNo =
    quote.quotation_no || quote.quotationNo || quote.quotationNo || "-";
  const date = quote.created_on ? new Date(quote.created_on) : new Date();
  const dateStr = date.toLocaleDateString();
  const customer = quote.customer_name
    ? { name: quote.customer_name, mobile: quote.customer_mobile || quote.customer?.mobile || "" }
    : {
      name: quote.customer?.name || "Customer",
      mobile: quote.customer?.mobile || "",
      address: "",
      gst: "",
    };
  const items =
    Array.isArray(quote.items) && quote.items.length
      ? quote.items
      : // try parts+labour if items not present (quotation from backend)
      (() => {
        try {
          const parts =
            typeof quote.parts === "string"
              ? JSON.parse(quote.parts || "[]")
              : quote.parts || [];
          const labour =
            typeof quote.labour === "string"
              ? JSON.parse(quote.labour || "[]")
              : quote.labour || [];
          const mappedParts = (parts || []).map((p) => ({
            category: "Product",
            product: p.name || p.product || "",
            qty: p.qty ?? p.quantity ?? 1,
            rate: p.rate ?? p.price ?? 0,
            discountPct: p.discount ?? 0,
            amount: p.amount ?? 0,
          }));
          const mappedLabour = (labour || []).map((l) => ({
            category: "Service",
            product: l.title || l.name || "",
            qty: l.hours ?? 1,
            rate: l.rate ?? l.amount ?? 0,
            discountPct: 0,
            amount: l.amount ?? 0,
          }));
          return [...mappedParts, ...mappedLabour];
        } catch (e) {
          return [];
        }
      })();

  const totals =
    typeof quote.totals === "string"
      ? JSON.parse(quote.totals || "{}")
      : quote.totals || {};

  const admin = quote.admin || {};

  const company = {
    name: admin.userName || "Your Garage",
    address: admin.address || "",
    city: admin.city_name || "",
    state: admin.state_name || "",
    pincode: admin.pincode || "",
    email: admin.email || "",
    phone: admin.phone_number || "",
    logo: admin.profile_image || null
  };

  const baseUrl = apiEndpoints.blob;
  const logoUrl = company.logo ? baseUrl + company.logo : null;

  // Separate parts & labour
  const parts = items.filter((i) => i.category === "Product");
  const labour = items.filter((i) => i.category === "Service");

  // Calculate totals if not present or to ensure consistency
  const partsTotal = parts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const labourTotal = labour.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);

  const discountAmount = Number(totals.discountAmount || 0);
  const subtotal = Number(totals.subtotal || (partsTotal + labourTotal - discountAmount));
  const gstAmount = Number(totals.gstAmount || totals.gst || 0);
  const gstRate = Number(totals.gstRate || quote.gstRate || 0);
  const grandTotal = Number(totals.grandTotal || (subtotal + gstAmount));

  const data = {
    quotationNo,
    dateStr,
    customer,
    quote,
    items,
    totals,
    company,
    logoUrl,
    parts,
    labour,
    partsTotal,
    labourTotal,
    discountAmount,
    subtotal,
    gstAmount,
    gstRate,
    grandTotal
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

  // open new window
  const popup = window.open(
    "",
    "_blank",
    "toolbar=0,location=0,menubar=0,width=1000,height=800"
  );
  if (!popup) {
    alert("Please allow popups for this site to print the quotation.");
    return;
  }

  popup.document.open();
  popup.document.write(htmlContent);
  popup.document.close();
}

function getStandardTemplate(data) {
  const {
    quotationNo,
    dateStr,
    customer,
    quote,
    totals,
    company,
    logoUrl,
    parts,
    labour,
    partsTotal,
    discountAmount,
    subtotal,
    gstAmount,
    gstRate,
    grandTotal,
    labourTotal
  } = data;

  // Build PARTS rows only
  const rowsHtml = parts
    .map((it, i) => {
      const name = it.product || it.title || "-";
      const qty = Number(it.qty ?? 1);
      const rate = Number(it.rate ?? 0);
      const discountPct = Number(it.discountPct ?? 0);
      const base = qty * rate;
      const discounted = discountPct ? base - (base * discountPct) / 100 : base;
      const amount = Number(it.amount ?? discounted);
      return `
        <tr class="item-row">
          <td class="col-no">${i + 1}</td>
          <td class="col-desc">${escapeHtml(name)}</td>
          <td class="col-qty">${qty}</td>
          <td class="col-rate">${formatCurrency(rate)}</td>
          <td class="col-disc">${discountPct ? discountPct + "%" : "-"}</td>
          <td class="col-amt">${formatCurrency(amount)}</td>
        </tr>
      `;
    })
    .join("");

  // Inline CSS optimized for print
  const css = `
    /* Reset and base */
:root {
  --primary: #f97316;
  --muted: #666;
  --paper: #fff;
}

* {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
}

/* ---------- PAGE MARGINS ---------- */
/* First page bottom space comes from @page */
@page {
  margin-top: 18mm;
  margin-bottom: 28mm; /* 👈 space at bottom of FIRST page */
  margin-left: 16mm;
  margin-right: 16mm;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial;
  margin: 0;
  padding: 0;
  background: #f5f7fb;
  color: #222;
}

/* ---------- MAIN PAGE ---------- */
.page {
  background: #fff;
  max-width: 900px;
  margin: auto;
  padding: 30px;
  border-radius: 10px;
  border: 1px solid #e5e5e5;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
}

/* ---------- HEADER ---------- */
header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}

.brand .logo {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #f5f5f5, #fff);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--primary);
  border: 1px solid #eee;
}

.brand .title {
  font-size: 20px;
  font-weight: 800;
}

.meta {
  text-align: right;
  min-width: 220px;
}

.meta .h1 {
  font-weight: 800;
  color: var(--primary);
  font-size: 18px;
}

/* ---------- INFO ---------- */
.two-col {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-top: 16px;
}

.left,
.right {
  flex: 1;
  min-width: 200px;
}

/* ---------- TABLE ---------- */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  page-break-inside: auto;
}

.table thead {
  display: table-header-group;
}

.table tr {
  page-break-inside: avoid;
}

.table th,
.table td {
  padding: 8px 10px;
  border-bottom: 1px solid #eef3f6;
  text-align: left;
  font-size: 13px;
  vertical-align: middle;
}

.table th {
  background: #f7fbfd;
  font-weight: 700;
  color: #222;
}

.col-no {
  width: 44px;
  text-align: center;
}

.col-qty,
.col-rate,
.col-amt,
.col-disc {
  text-align: right;
}

/* ---------- TOTALS (CRITICAL FIX) ---------- */
.totals {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;

  /* 🔥 KEY: move totals to next page if needed */
  page-break-inside: avoid;
  break-inside: avoid;
}

.totals .box {
  width: 320px;
}

.totals .row {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 14px;
}

.totals .row.total {
  font-weight: 800;
  font-size: 16px;
  border-top: 1px solid #e9f0f5;
  margin-top: 6px;
  padding-top: 10px;
}

/* ---------- NOTES & FOOTER ---------- */
.notes {
  margin-top: 16px;
  font-size: 13px;
  color: var(--muted);
}

/* ---------- PRINT RULES ---------- */
@media print {
  body {
    background: #ffffff !important;
    margin: 0;
    padding: 0;
  }

  .page {
    min-height: auto !important;
    height: auto !important;
    border-radius: 0;
    border: none;
  }

  /* 🔥 CONTINUED PAGES TOP SPACE (page 2+) */
  .page {
    padding-top: 22mm;
  }

  header,
  .two-col,
  footer {
    page-break-inside: avoid;
  }

  .totals {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
  `;

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Quotation ${escapeHtml(quotationNo)}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="page" id="page-content">
      <header>
        <div class="brand">
          <div class="logo">
  ${logoUrl
      ? `<img  id="company-logo" src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;" />`
      : `GM`
    }
</div>
          <div>
<div class="title">${escapeHtml(company.name)}</div>
<div style="color:var(--muted); font-size:13px;">
  ${escapeHtml(company.address)}<br/>
  ${escapeHtml(company.city)}, ${escapeHtml(company.state)} - ${escapeHtml(
      company.pincode
    )}<br/>
  Phone: ${escapeHtml(company.phone)} | Email: ${escapeHtml(company.email)}
</div>

          </div>
        </div>

        <div class="meta">
          <div class="h1">QUOTATION</div>
          <div>Quotation No: <strong>${escapeHtml(quotationNo)}</strong></div>
          <div>Date: ${escapeHtml(dateStr)}</div>
          ${quote.jobcardNo
      ? `<div>Jobcard: ${escapeHtml(quote.jobcardNo)}</div>`
      : ""
    }
          <div>Status: ${escapeHtml(quote.status ?? "")}</div>
        </div>
      </header>

      <div class="two-col">
        <div class="left">
          <strong>Bill To</strong>
          <div>${escapeHtml(customer.name || "-")}</div>
          ${customer.address
      ? `<div style="margin-top:6px;">${escapeHtml(
        customer.address
      )}</div>`
      : ""
    }
          <div style="margin-top:6px;">Mobile: ${escapeHtml(
      customer.mobile || "-"
    )}</div>
          ${customer.gst ? `<div>GST: ${escapeHtml(customer.gst)}</div>` : ""}
        </div>

        <div class="right">
          <strong>Quotation Details</strong>
          <div style="margin-top:6px;">Prepared By: <strong>Your Garage</strong></div>
          <div>Expiry Date: ${escapeHtml(quote.expiryDate || "")}</div>
        </div>
      </div>

      <table class="table" aria-hidden="false">
        <thead>
          <tr>
            <th class="col-no">#</th>
            <th class="col-desc">Description</th>
            <th class="col-qty">Qty</th>
            <th class="col-rate">Rate</th>
            <th class="col-disc">Disc</th>
            <th class="col-amt">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml ||
    `<tr><td colspan="6" style="text-align:center;padding:18px;color:var(--muted)">No items</td></tr>`
    }
        </tbody>
      </table>
${labour.length
      ? `
    <h3 style="margin-top:20px;">Labour Charges</h3>
    <table class="table">
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Description</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${labour
        .map(
          (l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(l.product || "")}</td>
                <td style="text-align:right">₹ ${formatCurrency(l.amount)}</td>
              </tr>
            `
        )
        .join("")}
      </tbody>
    </table>
  `
      : ""
    }

      <div class="totals" role="presentation">
        <div class="box">
          <div class="row"><div>Product Total</div><div>₹ ${formatCurrency(
      partsTotal
    )}</div></div>
          <div class="row"><div>Discount</div><div>- ₹ ${formatCurrency(
      discountAmount
    )}</div></div>
           <div class="row"><div>Subtotal</div><div>₹ ${formatCurrency(
      subtotal
    )}</div></div>
          <div class="row"><div>GST (${formatCurrency(
      gstRate
    )}%)</div><div>₹ ${formatCurrency(
      gstAmount
    )}</div></div>
         <div class="row"><div>Labour Charges</div><div>₹ ${formatCurrency(
      labourTotal
    )}</div></div>

<div class="row total"><div>Grand Total</div><div>₹ ${formatCurrency(
      grandTotal
    )}</div></div>


        </div>
      </div>

      ${quote.notes
      ? `<div class="notes"><strong>Notes:</strong><div>${escapeHtml(
        quote.notes
      )}</div></div>`
      : ""
    }
      <footer>
        <div>Thank you for your business</div>
        <div class="signature">
          <div>For Your Garage</div>
          <div style="margin-top:36px;">______________________</div>
        </div>
      </footer>
    </div>

    <script>
      function pageReady() {
        setTimeout(() => {
          window.print();
        }, 300);
      }
      window.onload = pageReady;
    </script>
  </body>
  </html>
  `;
}

// ==========================================
// TEMPLATE 2: MODERN
// ==========================================
function getModernTemplate(data) {
  const {
    quotationNo,
    dateStr,
    customer = {},
    quote = {},
    parts = [],
    labour = [],
    partsTotal = 0,
    labourTotal = 0,
    discountAmount = 0,
    gstAmount = 0,
    gstRate = 0,
    grandTotal = 0,
    company = {},
    logoUrl,
  } = data;

  const partsRows = parts
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.product || p.name || "-")}</td>
        <td class="text-right">${p.qty ?? "-"}</td>
        <td class="text-right">₹ ${formatCurrency(p.rate ?? 0)}</td>
        <td class="text-right">₹ ${formatCurrency(p.amount ?? 0)}</td>
      </tr>`
    )
    .join("");

  const labourRows = labour
    .map(
      (l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.product || l.name || "-")}</td>
        <td class="text-right">₹ ${formatCurrency(l.amount ?? 0)}</td>
      </tr>`
    )
    .join("");

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --primary: #2563eb;
  --dark: #1e293b;
  --muted: #64748b;
  --bg: #f8fafc;
}

@page {
  margin: 18mm 15mm 25mm 15mm;
}

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  background: var(--bg);
  color: var(--dark);
}

.page {
  background: #fff;
  max-width: 900px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---------- HEADER ---------- */
header {
  background: var(--primary);
  color: #fff;
  padding: 35px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
}

.company-info {
  text-align: right;
  font-size: 14px;
  line-height: 1.5;
}

/* ---------- META ---------- */
.meta-bar {
  background: var(--dark);
  color: #fff;
  padding: 14px 40px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

/* ---------- CONTENT ---------- */
.content {
  padding: 24px 40px;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 35px;
}

.section-title {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 8px;
}

.details {
  font-size: 14px;
  line-height: 1.6;
}

/* ---------- TABLE ---------- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  page-break-inside: auto;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}

th {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 2px solid #e2e8f0;
  padding: 10px 0;
  text-align: left;
}

td {
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.text-right {
  text-align: right;
}

/* ---------- TOTALS ---------- */
.totals {
  display: flex;
  justify-content: flex-end;
  page-break-inside: avoid;
  break-inside: avoid;
}

.totals-table {
  width: 320px;
}

.totals-table td {
  padding: 6px 0;
  border: none;
}

.total-row {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  border-top: 2px solid #e2e8f0;
  padding-top: 10px;
}

/* ---------- FOOTER ---------- */
.footer {
  padding: 28px 40px;
  text-align: center;
  font-size: 13px;
  color: var(--muted);
  border-top: 1px solid #f1f5f9;
}

/* ---------- PRINT ---------- */
@media print {
  body {
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .page {
    box-shadow: none;
    border-radius: 0;
  }

  .content {
    padding-top: 22mm;
  }
}
`;

  return `
<html>
<head>
  <title>Quotation ${quotationNo}</title>
  <style>${css}</style>
</head>
<body>
<div class="page">

<header>
  <div style="display:flex;align-items:center;gap:14px;">
    ${logoUrl ? `<img src="${logoUrl}" style="height:55px;background:#fff;border-radius:6px;padding:4px;">` : ""}
    <h1>QUOTATION</h1>
  </div>
  <div class="company-info">
    <strong>${company.name || "-"}</strong><br>
    ${company.email || "-"}<br>
    ${company.phone || "-"}
  </div>
</header>

<div class="meta-bar">
  <div>NO: <strong>${quotationNo}</strong></div>
  <div>DATE: <strong>${dateStr}</strong></div>
</div>

<div class="content">

<div class="bill-row">
  <div>
    <div class="section-title">Bill To</div>
    <div class="details">
      <strong>${customer.name || "-"}</strong><br>
      ${customer.address || "-"}<br>
      ${customer.mobile || "-"}
    </div>
  </div>

  <div style="text-align:right;">
    <div class="section-title">Job Details</div>
    <div class="details">
      Job Card: <strong>${quote.jobcardNo || "-"}</strong><br>
      Status: ${quote.status || "-"}
    </div>
  </div>
</div>

<div class="section-title">Parts & Products</div>
<table>
  <thead>
    <tr>
      <th style="width:50px">#</th>
      <th>Description</th>
      <th class="text-right">Qty</th>
      <th class="text-right">Rate</th>
      <th class="text-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${partsRows || `<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No parts</td></tr>`}
  </tbody>
</table>

<div class="section-title">Labour & Services</div>
<table>
  <thead>
    <tr>
      <th style="width:50px">#</th>
      <th>Description</th>
      <th class="text-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${labourRows || `<tr><td colspan="3" style="text-align:center;color:#94a3b8;">No labour</td></tr>`}
  </tbody>
</table>

<div class="totals">
  <table class="totals-table">
    <tr><td>Parts Total</td><td class="text-right">₹ ${formatCurrency(partsTotal)}</td></tr>
    <tr><td>Labour Total</td><td class="text-right">₹ ${formatCurrency(labourTotal)}</td></tr>
    ${discountAmount > 0 ? `<tr><td style="color:#ef4444">Discount</td><td class="text-right" style="color:#ef4444">- ₹ ${formatCurrency(discountAmount)}</td></tr>` : ""}
    <tr><td>GST (${gstRate}%)</td><td class="text-right">₹ ${formatCurrency(gstAmount)}</td></tr>
    <tr>
      <td colspan="2">
        <div class="total-row" style="display:flex;justify-content:space-between;">
          <span>Total</span>
          <span>₹ ${formatCurrency(grandTotal)}</span>
        </div>
      </td>
    </tr>
  </table>
</div>

</div>

</div>

<script>
  window.onload = () => setTimeout(() => window.print(), 300);
</script>
</body>
</html>
`;
}



// ==========================================
// TEMPLATE 3: MINIMALIST
// ==========================================
function getMinimalistTemplate(data) {
  const {
    quotationNo,
    dateStr,
    customer = {},
    quote = {},
    parts = [],
    labour = [],
    labourTotal = 0,
    subtotal = 0,
    gstAmount = 0,
    gstRate = 0,
    grandTotal = 0,
    company = {},
  } = data;

  const partsRows = parts
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(p.product || p.name || "-")}</td>
        <td class="text-right">${p.qty ?? "-"}</td>
        <td class="text-right">${formatCurrency(p.rate ?? 0)}</td>
        <td class="text-right">${formatCurrency(p.amount ?? 0)}</td>
      </tr>`
    )
    .join("");

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');

@page {
  margin: 18mm 15mm 25mm 15mm;
}

body {
  font-family: 'Courier Prime', monospace;
  color: #000;
  padding: 40px;
  max-width: 800px;
  margin: auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 40px;
  text-transform: uppercase;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 60px;
}

.col {
  width: 45%;
}

.label {
  font-size: 10px;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: #555;
}

.val {
  margin-bottom: 16px;
  font-size: 14px;
}

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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  /* prevent split across pages */
  page-break-inside: avoid;
  break-inside: avoid;
}

.total-row {
  display: flex;
  justify-content: space-between;
  width: 250px;
  margin-bottom: 8px;
  font-size: 14px;
}

.grand {
  font-size: 18px;
  border-top: 2px solid #000;
  padding-top: 10px;
  margin-top: 10px;
  font-weight: bold;
}

/* ---------- PRINT ---------- */
@media print {
  body {
    padding-top: 22mm;
  }
}
`;

  return `
<html>
  <head>
    <title>Quotation #${quotationNo}</title>
    <style>${css}</style>
  </head>
  <body>

    <h1>Quotation #${quotationNo}</h1>

    <div class="header">
      <div class="col">
        <div class="label">From</div>
        <div class="val">
          <strong>${company.name || "-"}</strong><br>
          ${company.email || "-"}<br>
          ${company.phone || "-"}
        </div>

        <div class="label">Date</div>
        <div class="val">${dateStr || "-"}</div>
      </div>

      <div class="col">
        <div class="label">To</div>
        <div class="val">
          <strong>${customer.name || "-"}</strong><br>
          ${customer.address || "-"}<br>
          ${customer.mobile || "-"}
        </div>

        <div class="label">Job Details</div>
        <div class="val">
          Job Card: <strong>${quote.jobcardNo || "-"}</strong><br>
          Status: ${quote.status || "-"}
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
        ${partsRows || `<tr><td colspan="4" style="text-align:center;color:#777;">No items</td></tr>`}
        ${
          labour
            .map(
              (l) => `
              <tr>
                <td colspan="3">${escapeHtml(l.product || l.name || "-")} (Labour)</td>
                <td class="text-right">${formatCurrency(l.amount ?? 0)}</td>
              </tr>`
            )
            .join("")
        }
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal + labourTotal)}</span>
      </div>

      ${
        gstAmount > 0
          ? `<div class="total-row">
               <span>GST (${gstRate}%)</span>
               <span>${formatCurrency(gstAmount)}</span>
             </div>`
          : ""
      }

      <div class="total-row grand">
        <span>Total</span>
        <span>${formatCurrency(grandTotal)}</span>
      </div>
    </div>

    <script>
      window.onload = () => setTimeout(() => window.print(), 300);
    </script>

  </body>
</html>
`;
}

// ==========================================
// TEMPLATE 4: PROFESSIONAL
// ==========================================
function getProfessionalTemplate(data) {
  const {
    quotationNo,
    dateStr,
    customer = {},
    quote = {},
    parts = [],
    labour = [],
    partsTotal = 0,
    labourTotal = 0,
    discountAmount = 0,
    gstAmount = 0,
    gstRate = 0,
    grandTotal = 0,
    company = {},
    logoUrl,
  } = data;

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

@page {
  margin: 15mm;
}

body {
  font-family: 'Roboto', sans-serif;
  // padding: 10px;
  color: #333;
  background: #fff;
}

.container {
  padding: 10px;
  max-width: 1000px;
  margin: auto;
  box-sizing: border-box;
}

/* ---------- HEADER ---------- */
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

/* ---------- INFO ROW ---------- */
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

/* ---------- TABLE ---------- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
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
  color: #fff;
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

/* ---------- TOTALS ---------- */
.summary-section {
  width: 40%;
  margin-left: auto;
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

/* ---------- PRINT ---------- */
@media print {
  body {
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* space on page 2+ */

  table th {
    background: #111 !important;
    color: #ffffff !important;
  }

  .summary-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
`;

  return `
<html>
<head>
  <title>Quotation ${quotationNo}</title>
  <style>${css}</style>
</head>
<body>

<div class="container">

  <div class="header">
    <div class="logo-area">
      ${logoUrl ? `<img src="${logoUrl}" />` : `<h2>${company.name || "-"}</h2>`}
      <div class="company-addr">
        ${company.address || "-"}<br>
        ${company.city || ""} ${company.state || ""} ${company.pincode || ""}<br>
        ${company.email || "-"} | ${company.phone || "-"}
      </div>
    </div>

    <div>
      <div class="inv-title">QUOTATION</div>
      <div class="inv-detail">#${quotationNo}</div>
      <div class="inv-detail">${dateStr || "-"}</div>
    </div>
  </div>

  <div class="row">
    <div class="box">
      <div class="box-title">Bill To</div>
      <div class="box-content">
        <strong>${customer.name || "-"}</strong><br>
        ${customer.address || "-"}<br>
        Phone: ${customer.mobile || "-"}
      </div>
    </div>

    <div class="box">
      <div class="box-title">Job Details</div>
      <div class="box-content">
        Job Card: <strong>${quote.jobcardNo || "-"}</strong><br>
        Status: ${quote.status || "-"}
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
      ${parts
        .map(
          (p) => `
        <tr>
          <td>${escapeHtml(p.product || p.name || "-")}</td>
          <td class="text-right">${p.qty ?? "-"}</td>
          <td class="text-right">${formatCurrency(p.rate ?? 0)}</td>
          <td class="text-right">${formatCurrency(p.amount ?? 0)}</td>
        </tr>`
        )
        .join("")}

      ${labour
        .map(
          (l) => `
        <tr>
          <td>${escapeHtml(l.product || l.name || "-")} (Labour)</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">${formatCurrency(l.amount ?? 0)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="s-row"><span>Parts Total</span><span>${formatCurrency(partsTotal)}</span></div>
    <div class="s-row"><span>Labour Total</span><span>${formatCurrency(labourTotal)}</span></div>
    ${
      discountAmount > 0
        ? `<div class="s-row"><span>Discount</span><span>- ${formatCurrency(discountAmount)}</span></div>`
        : ""
    }
    <div class="s-row"><span>GST (${gstRate}%)</span><span>${formatCurrency(gstAmount)}</span></div>
    <div class="s-row s-total"><span>Total</span><span>₹ ${formatCurrency(grandTotal)}</span></div>
  </div>

</div>

<script>
  window.onload = () => setTimeout(() => window.print(), 300);
</script>

</body>
</html>
`;
}



/* small helper to escape text used inside template building above */
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
