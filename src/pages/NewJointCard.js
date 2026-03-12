// NewJobCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewJobCard = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    jobCardNo: `JC-${Date.now().toString().slice(-6)}`,
    customerName: '',
    mobile: '',
    email: '',
    vehicleNo: '',
    make: '',
    model: '',
    serviceType: '',
    fuelType: '',
    status: 'Approval Pending',
    arrivalDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    amount: '0',
    advisor: 'Default Advisor',
    rentalValue: '',
    rentalModel: '',
    serviceFactor: '',
    customerConcerns: '',
    advancePayment: '',
    corporateName: '',
    productionCloserBefore: '',
    availableForPurchase: false,
    purchaseDate: '',
    purchaseTitle: '',
    effectiveContact: '',
    firstOpinion: '',
    qSelect: '',
    source: '',
    hardenedCompany: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingCards = JSON.parse(localStorage.getItem('jobCards')) || [];
    const updatedCards = [...existingCards, form];
    localStorage.setItem('jobCards', JSON.stringify(updatedCards));
    navigate('/');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Job Cards</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Search Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="mr-2 font-medium">1/8 Number / Other Number</span>
            <input 
              name='vehicleNo'
              value={form.vehicleNo}
              onChange={handleChange}
              type="text" 
              placeholder="Search Using Registration No / Customer Name / Mobile No / Email / Corporate Name / Vehicle" 
              className="flex-1 p-2 border rounded"
            />
          </div>

          {/* Customer Info Section */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 border rounded">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <input 
                name="customerName" 
                onChange={handleChange} 
                value={form.customerName} 
                className="w-full p-2 border rounded"
              />
              <span className="text-xs text-gray-500">25</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select name="serviceType" onChange={handleChange} value={form.serviceType} className="w-full p-2 border rounded">
                <option value="">Select</option>
                <option value="VH">VH</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category No</label>
              <input className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Rental Car Section */}
        <div className="mb-6 p-4 border rounded">
          <h3 className="font-medium mb-3">Rental Car (e.g. Hydola HG, Novai Metal, Swim Spell) *</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input 
                name="rentalValue" 
                onChange={handleChange} 
                value={form.rentalValue} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input 
                name="rentalModel" 
                onChange={handleChange} 
                value={form.rentalModel} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Vehicle Closer Section */}
        <div className="mb-6 p-4 border rounded">
          <h3 className="font-medium mb-3">Vehicle Closer</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fuel Type</label>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="fuelTypePetrol" 
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Petrol</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Service Type</label>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="serviceTypeRegular" 
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Regular</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Service Factor Select</label>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="serviceFactorStandard" 
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Standard</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Production Closer Before</label>
            <input 
              name="productionCloserBefore" 
              onChange={handleChange} 
              value={form.productionCloserBefore} 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Customer Concerns */}
        <div className="mb-6 p-4 border rounded">
          <label className="block text-sm font-medium mb-1">Enter Customer Concerns / Complaints (e.g. A/C not working)</label>
          <textarea 
            name="customerConcerns" 
            onChange={handleChange} 
            value={form.customerConcerns} 
            className="w-full p-2 border rounded h-20"
          />
        </div>

        {/* Available for Purchase Section */}
        <div className="mb-6 p-4 border rounded">
          <h3 className="font-medium mb-3">Available for full purchase:</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                name="purchaseDate" 
                onChange={handleChange} 
                value={form.purchaseDate} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                name="purchaseTitle" 
                onChange={handleChange} 
                value={form.purchaseTitle} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Effective Contact</label>
              <input 
                name="effectiveContact" 
                onChange={handleChange} 
                value={form.effectiveContact} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City + First Opinion</label>
              <input 
                name="firstOpinion" 
                onChange={handleChange} 
                value={form.firstOpinion} 
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Q Select and Source */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <label className="block text-sm font-medium mb-1">Q Select: Compare / Fines</label>
            <select 
              name="qSelect" 
              onChange={handleChange} 
              value={form.qSelect} 
              className="w-full p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="Compare">Compare</option>
              <option value="Fines">Fines</option>
            </select>
          </div>
          <div className="p-4 border rounded">
            <label className="block text-sm font-medium mb-1">Source: Multi-to-SIGSs</label>
            <input 
              name="source" 
              onChange={handleChange} 
              value={form.source} 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Hardened Company */}
        <div className="mb-6 p-4 border rounded">
          <label className="block text-sm font-medium mb-1">Select: Hardened Company</label>
          <select 
            name="hardenedCompany" 
            onChange={handleChange} 
            value={form.hardenedCompany} 
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Company A">Company A</option>
            <option value="Company B">Company B</option>
          </select>
        </div>

        {/* Advance Payment */}
        <div className="mb-6 p-4 border rounded">
          <h3 className="font-medium mb-3">Advance Payment Call:</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input 
                name="customerName" 
                onChange={handleChange} 
                value={form.customerName} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email ID</label>
              <input 
                name="email" 
                onChange={handleChange} 
                value={form.email} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone No</label>
              <input 
                name="mobile" 
                onChange={handleChange} 
                value={form.mobile} 
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input 
                name="advancePayment" 
                onChange={handleChange} 
                value={form.advancePayment} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                name="arrivalDate" 
                onChange={handleChange} 
                value={form.arrivalDate} 
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Add Contact Button */}
        <div className="mb-6">
          <button 
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium"
          >
            Add Contact
          </button>
        </div>

        <div className="text-center mt-6">
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            backgroundColor="rgba(249, 115, 22, 0.9)"
          >
            Save Job Card
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJobCard;