import React, { useEffect, useState } from "react";
import InvoiceList from "./InvoiceList";
import apiEndpoints from "../../../apiconfig";
import { useLoading } from "../../LoadingContext";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const { show, hide } = useLoading();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchInvoices();
  }, []);

const fetchInvoices = async () => {
  try {
   

    const res = await fetch(apiEndpoints.Invoice + "?list=1", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rawData = await res.json();

    const formatted = rawData.map((inv) => ({
      id: inv.invoice_guid,
      invoiceNumber: inv.invoice_no,
      customerName: inv.customer_name,
      invoiceFor: inv.job_guid ? "Service" : "Parts",
      numberPlate: inv.vehicle_number || "-",
      totalAmount: inv.totals?.grandTotal ?? 0,
      paidAmount: inv.paid_amount,
      invoiceDate: inv.created_on?.split(" ")[0] ?? "",
      status: (() => {
        if (inv.status && inv.status !== "Completed" && inv.status !== "Paid") return inv.status;
        const total = Number(inv.totals?.grandTotal || 0);
        const paid = Number(inv.paid_amount || 0);
        if (paid >= total && total > 0) return "Paid";
        if (paid > 0) return "Partial";
        return "Unpaid";
      })(),
    }));

    setInvoices(formatted);
  } catch (err) {
    console.error("Failed to fetch invoices:", err);
  } finally {
    
  }
};


const deleteItems = async (type, ids) => {
  try {
    

    for (let invoice_guid of ids) {
      await fetch(apiEndpoints.Invoice + "?invoice_guid=" + invoice_guid, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    await fetchInvoices();
  } catch (err) {
    console.error("Failed to delete invoices:", err);
  } finally {
    
  }
};

  return (
    <InvoiceList
      invoices={invoices}
      deleteItems={deleteItems}
      addRoute="/add-invoice"
    />
  );
}
