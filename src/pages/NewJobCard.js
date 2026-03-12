const handleSubmit = () => {
    const existing = JSON.parse(localStorage.getItem('jobCards')) || [];
  
    const newEntry = {
      jobCardNo: 'INT-J001470',
      vehicleNo: '4567HU',
      invoiceNo: 'INV00123',
      serviceType: 'Repair',
      make: 'KIA',
      model: 'SONET',
      arrivalDate: '2022-05-12',
      status: 'Approval Pending', // <- this value determines the badge color
      deliveryDate: '2022-05-15',
      advisor: 'Long',
      customerName: 'Zia',
      mobile: '*****5816',
      amount: 3200
    };
  
    localStorage.setItem('jobCards', JSON.stringify([...existing, newEntry]));
  };
  