import { useState, useEffect } from "react";
import apiEndpoints from "./apiconfig/index";
import useAutoRefresh from "./hooks/useAutoRefresh";

export default function useAppData() {
  const [data, setData] = useState(() => ({
    customers: JSON.parse(localStorage.getItem("customers")) || [],
    employees: JSON.parse(localStorage.getItem("employees")) || [],
    quotations: JSON.parse(localStorage.getItem("quotations")) || [],
    invoices: JSON.parse(localStorage.getItem("invoices")) || [],
    suppliers: JSON.parse(localStorage.getItem("suppliers")) || [],
    products: JSON.parse(localStorage.getItem("products")) || [],
    purchases: JSON.parse(localStorage.getItem("purchases")) || [],
    stock: JSON.parse(localStorage.getItem("stock")) || [],
    isLoading: true,
    error: null,
  }));

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));
      const endpoints = [
        {
          key: "customers",
          url: `${apiEndpoints.usersdata}?user_type=customer`,
        },
        {
          key: "employees",
          url: `${apiEndpoints.usersdata}?user_type=employee`,
        },
        { key: "suppliers", url: apiEndpoints.supplier },
        { key: "products", url: apiEndpoints.product },
        { key: "purchases", url: apiEndpoints.purchase },
        { key: "stock", url: apiEndpoints.stock },
      ];

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            console.log(`Fetching ${key} from:`, url);
            const response = await fetch(url, {
              headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch ${key}`);
            }

            const data = await response.json();
            return { key, data: data.data || data };
          } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            return { key, data: [] };
          }
        })
      );

      const newData = results.reduce((acc, { key, data }) => {
        acc[key] = Array.isArray(data) ? data : []; // Ensure we always have an array
        return acc;
      }, {});

      setData((prev) => ({
        ...prev,
        ...newData,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error in fetchData:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Auto-sync: background poll + tab-focus for all data pages ── */
  useAutoRefresh(fetchData);

  // Persist data in localStorage when it changes
  useEffect(() => {
    for (const key in data) {
      if (key !== "isLoading" && key !== "error") {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    }
  }, [data]);

  const handleSaveUser = (newUserData, userType) => {
    debugger;
    // setData(prev => {
    //   const userTypeKey = userType === "Support Staff" ? "supportStaff" :
    //     userType === "Accountants" ? "accountants" :
    //       userType === "Employees" ? "employees" : "customers";

    //   // Check if updating existing user or adding new
    //   const existingIndex = prev[userTypeKey].findIndex(
    //     u => u.user_guid === newUserData.user_guid
    //   );

    //   if (existingIndex >= 0) {
    //     // Update existing user
    //     const updated = [...prev[userTypeKey]];
    //     updated[existingIndex] = { ...updated[existingIndex], ...newUserData };
    //     return { ...prev, [userTypeKey]: updated };
    //   }

    //   // Add new user
    //   return {
    //     ...prev,
    //     [userTypeKey]: [...prev[userTypeKey], newUserData]
    //   };
    // });

    fetchData();
  };

  const handleSaveInvoice = async (invoice) => {
    try {
      setData((prev) => ({ ...prev, isLoading: true }));

      const method = invoice.id ? "PUT" : "POST";
      const url = invoice.id
        ? `${apiEndpoints.invoices}/${invoice.id}`
        : apiEndpoints.invoices;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...invoice,
          status: invoice.status || "Unpaid",
          paidAmount: invoice.paidAmount || "0.00",
        }),
      });

      if (!response.ok) throw new Error("Failed to save invoice");

      const savedInvoice = await response.json();

      setData((prev) => {
        const existingIndex = prev.invoices.findIndex(
          (i) =>
            i.id === savedInvoice.id || i.user_guid === savedInvoice.user_guid
        );

        if (existingIndex >= 0) {
          const updatedInvoices = [...prev.invoices];
          updatedInvoices[existingIndex] = savedInvoice;
          return { ...prev, invoices: updatedInvoices, isLoading: false };
        }

        return {
          ...prev,
          invoices: [...prev.invoices, savedInvoice],
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error saving invoice:", error);
      setData((prev) => ({ ...prev, isLoading: false, error: error.message }));
    }
  };

  const handleUserUpdate = async (userType, newList) => {
    try {
      setData((prev) => ({
        ...prev,
        [userType]: newList,
        isLoading: true,
      }));

      // Force a refresh from API to ensure consistency
      await fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
      setData((prev) => ({ ...prev, error: error.message }));
    } finally {
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const deleteItems = async (type, userIds = null, vehicleGuid = null, userGuid = null) => {
    try {
      setData((prev) => ({ ...prev, isLoading: true }));

      let url = apiEndpoints.usersdata;

      // 🚗 VEHICLE DELETE
      if (vehicleGuid) {
        url += `?vehicle_guid=${vehicleGuid}&user_guid=${userGuid}`;
      }
      // 👤 USER DELETE
      else if (userGuid) {
        url += `?user_guid=${userGuid}`;
      } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        url += `?user_guid=${userIds[0]}`;
      } else {
        throw new Error("Nothing to delete");
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      // Refresh from API (important because customer rows are joined with vehicles)
      await fetchData();

    } catch (error) {
      console.error("Error deleting items:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };


  const addQuotation = async (newQuotation) => {
    try {
      setData((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch("/garage/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuotation),
      });

      if (!response.ok) throw new Error("Failed to add quotation");

      const savedQuotation = await response.json();

      setData((prev) => ({
        ...prev,
        quotations: [...prev.quotations, savedQuotation],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error adding quotation:", error);
      setData((prev) => ({ ...prev, isLoading: false, error: error.message }));
    }
  };

  const updateQuotation = async (updatedQuotation) => {
    try {
      setData((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch(
        `/garage/quotations/${updatedQuotation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuotation),
        }
      );

      if (!response.ok) throw new Error("Failed to update quotation");

      const savedQuotation = await response.json();

      setData((prev) => ({
        ...prev,
        quotations: prev.quotations.map((q) =>
          q.id === savedQuotation.id ? savedQuotation : q
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating quotation:", error);
      setData((prev) => ({ ...prev, isLoading: false, error: error.message }));
    }
  };

  return {
    data,
    setData,
    fetchData,
    handleSaveInvoice,
    handleUserUpdate,
    handleSaveUser,
    deleteItems,
    addQuotation,
    updateQuotation,
  };
}
