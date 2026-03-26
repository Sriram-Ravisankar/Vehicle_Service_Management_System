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
  const vehicleModel = invoice.vehicle_model || invoice.vehicleModel || invoice.model || invoice.vehicle_details?.model || "-";

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

  const totals = invoice.totals || {};
  const discountPercent = Number(totals.discountPercent ?? invoice.discount ?? 0);
  const discountAmount = (partsTotal * discountPercent) / 100;
  const subtotal = Number(totals.subtotal ?? partsTotal - discountAmount);
  const gstPercent = Number(totals.gstPercent ?? invoice.gst ?? 0);
  const gstAmount = (subtotal * gstPercent) / 100;

  const grandTotal =
    Number(totals.grandTotal ?? invoice.grandTotal) ||
    Math.round(subtotal + gstAmount + labourTotal);

  const paidAmount = Number(invoice.paid_amount || invoice.paidAmount || 0);
  const paymentMethod = invoice.payment_method || invoice.paymentMethod || "-";
  const balanceAmount = grandTotal - paidAmount;

  // Company details - Prioritize Branch info over Admin personal info
  const admin = invoice.admin || {};
  const branch = invoice.branch || invoice.branch_details || {};
  const company = {
    name: branch.branch_name || invoice.branch_name || admin.userName || "Your Garage",
    address: branch.address || invoice.branch_address || admin.address || "",
    city: branch.city || invoice.branch_city || admin.city_name || "",
    state: branch.state || invoice.branch_state || admin.state_name || "",
    pincode: branch.pincode || invoice.branch_pincode || admin.pincode || "",
    email: branch.email || invoice.branch_email || admin.email || "",
    phone: branch.contact_number || invoice.branch_contact || invoice.branch_mobile || admin.phone_number || "-",
    logo: branch.image_path || admin.profile_image || null,
  };

  const baseUrl = apiEndpoints.blob;
  const logoUrl = company.logo ? baseUrl + company.logo : null;

  const data = {
    invoiceNo,
    dateStr,
    customer,
    vehicleNo,
    vehicleModel,
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
    paidAmount,
    paymentMethod,
    balanceAmount,
    company,
    logoUrl,
  };

  const htmlContent = getStandardTemplate(data);

  const popup = window.open("", "_blank", "width=1000,height=800");
  if (!popup) {
    alert("Pop-up blocked! Please allow pop-ups for this site to print the invoice.");
    return;
  }
  popup.document.write(htmlContent);
  popup.document.close();

  popup.onload = () => {
    setTimeout(() => popup.print(), 300);
  };
}

export function getInvoiceTemplatePreview(templateId, data) {
  return getStandardTemplate(data);
}

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
      --primary: #0EA5E9;
      --text-muted: #555;
    }
    html, body { height: 100%; margin: 0; }
    body { font-family: 'Arial'; background: #f0f3f9; padding: 20px; box-sizing: border-box; }
    .page {
      background: #fff; max-width: 900px; margin: auto; padding: 30px;
      border-radius: 10px; border: 1px solid #e5e5e5; min-height: 95vh;
      box-sizing: border-box; display: flex; flex-direction: column;
    }
    header { display: flex; justify-content: space-between; margin-bottom: 25px; }
    .logo { width: 120px; height: 120px; background: none; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .company-details { font-size: 13px; color: var(--text-muted); }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { margin: 0; color: var(--primary); }
    h3 { margin-top: 25px; color: #333; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
    th { background: #f4f8ff; text-align: left; padding: 10px; font-weight: bold; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    .right { text-align: right; }
    .totals-box { margin-top: 25px; max-width: 320px; margin-left: auto; padding: 15px; border-radius: 10px; background: #f8fbff; border: 1px solid #dbe7f5; }
    .t-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 15px; }
    .t-final { font-size: 18px; font-weight: bold; border-top: 2px solid #d0d7e2; margin-top: 10px; padding-top: 10px; }
    @media print {
      body { background: #fff !important; }
      .page { min-height: auto !important; height: auto !important; border-radius: 0; }
    }
  `;

  return `
  <html>
    <head><title>Invoice ${invoiceNo}</title><style>${css}</style></head>
    <body>
      <div class="page">
        <header>
          <div style="display:flex; gap:15px;">
            <div class="logo">
              ${logoUrl
      ? `<img src="${logoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`
      : `<div style="width: 80px; height: 80px; background: #eaf3ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #0EA5E9; font-size: 24px;">GM</div>`
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
        <h3>Parts</h3>
        <table>
          <thead>
            <tr><th>#</th><th>Description</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr>
          </thead>
          <tbody>
            ${partsHtml || `<tr><td colspan="5" style="text-align:center;color:#777;padding:15px;">No parts added</td></tr>`}
          </tbody>
        </table>
        <h3>Labour Charges</h3>
        <table>
          <thead>
            <tr><th>#</th><th>Description</th><th class="right">Amount</th></tr>
          </thead>
          <tbody>
            ${labourHtml || `<tr><td colspan="3" style="text-align:center;color:#777;padding:15px;">No labour added</td></tr>`}
          </tbody>
        </table>
        <div class="totals-box">
          <div class="t-row"><div>Parts Total</div><div>₹ ${formatCurrency(partsTotal)}</div></div>
          <div class="t-row"><div>Discount (${discountPercent}%)</div><div>- ₹ ${formatCurrency(discountAmount)}</div></div>
          <div class="t-row"><div>GST (${gstPercent}%)</div><div>₹ ${formatCurrency(gstAmount)}</div></div>
          <div class="t-row"><div>Labour Total</div><div>₹ ${formatCurrency(labourTotal)}</div></div>
          <div class="t-row t-final" style="margin-bottom: 15px;"><div>Grand Total</div><div>₹ ${formatCurrency(grandTotal)}</div></div>
          <div style="border-top: 1px dashed #dbe7f5; padding-top: 12px; font-size: 13px; color: #475569;">
            <div class="t-row"><div>Payment Method</div><div>${data.paymentMethod || "-"}</div></div>
            <div class="t-row"><div>Amount Paid</div><div>₹ ${formatCurrency(data.paidAmount)}</div></div>
            ${data.balanceAmount > 0
      ? `<div class="t-row" style="color: #ef4444; font-weight: 700;"><div>Balance Due</div><div>₹ ${formatCurrency(data.balanceAmount)}</div></div>`
      : '<div class="t-row" style="color: #16a34a; font-weight: 700;"><div>Status</div><div>Fully Paid</div></div>'
    }
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}
