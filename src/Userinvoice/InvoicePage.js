import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PartEntryRow from './PartEntryRow';
import InvoiceTable from './InvoiceTable';

const InvoicePage = ({ onServiceSelect, selectedService, setInvoiceData }) => {
  const [rows, setRows] = useState([
    { partName: 'Brake Pad', qty: 2, price: 500, labour: 100, gstOption: 'withGST', approval: '', reason: '', id: 1 },
    { partName: 'Oil Filter', qty: 1, price: 300, labour: 50, gstOption: 'withoutGST', approval: '', reason: '', id: 2 },
  ]);

  const { state } = useLocation();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({});

  useEffect(() => {
    const data = state?.jobData || JSON.parse(localStorage.getItem('currentJob')) || {};
    
    // Ensure we're not mixing with previous jobs
    if (state?.isNewJob) {
      localStorage.removeItem('currentJob');
      setJobData({});
      setRows([]);
    } else {
      setJobData(data);
      if (data.invoiceItems) setRows(data.invoiceItems);
    }
  }, [state]);

  useEffect(() => {
    setInvoiceData(rows);
  }, [rows, setInvoiceData]);
  

  // Add new part from PartEntryRow
  const handleAddRow = (newRow) => {
    setRows((prev) => [...prev, { ...newRow, id: Date.now() }]);
    onServiceSelect(null);
  };


  // Save all data (including PartEntryRow inputs) to Dashboard
  const handleSaveInvoice = (invoiceItems) => {
    const existingJobs = JSON.parse(localStorage.getItem('jobCards')) || [];
    const currentJob = JSON.parse(localStorage.getItem('currentJob')) || {};
    
    // Create fresh job object
    const updatedJob = {
      ...currentJob,
      invoiceItems,
      status: 'Completed',
      invoiceDate: new Date().toISOString(),
      // Ensure we don't merge with previous jobs
      id: currentJob.id || Date.now()
    };
  
    // Filter out if this was a previous job
    const otherJobs = existingJobs.filter(job => job.id !== updatedJob.id);
    
    localStorage.setItem('jobCards', JSON.stringify([...otherJobs, updatedJob]));
    
    // Clear temporary storage
    localStorage.removeItem('currentJob');
    
    navigate('/dashboard');
  };



  

  return (
    <div style={{ padding: '20px' }}>
      <h2>Invoice for Job #{jobData.jobCardNo}</h2>
      
      {/* PartEntryRow - Adds new parts to the table */}
      <PartEntryRow onAdd={handleAddRow}  selectedService={selectedService}/>
      
      {/* InvoiceTable - Displays and manages parts */}
      <InvoiceTable
        rows={rows}
        onChange={(index, field, value) => {
          const updatedRows = [...rows];
          updatedRows[index][field] = value;
          setRows(updatedRows);
        }}
        onDelete={(index) => setRows(rows.filter((_, i) => i !== index))}
        onSaveInvoice={handleSaveInvoice} // Pass the save function
      />
    </div>
  );
};

export default InvoicePage;