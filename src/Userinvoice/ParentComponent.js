import React, { useState } from 'react';
import InvoiceTable from './InvoiceTable';

const ParentComponent = () => {
  const [rows, setRows] = useState([
    { partName: 'Part A', qty: 2, price: 100, discount: 10, gstOption: 'withGST', taxPercent: 5 },
    { partName: 'Part B', qty: 3, price: 150, discount: 20, gstOption: 'withoutGST', taxPercent: 12 },
  ]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleRowDelete = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  return (
    <div>
      <InvoiceTable rows={rows} onChange={handleRowChange} onDelete={handleRowDelete} />
    </div>
  );
};

export default ParentComponent;