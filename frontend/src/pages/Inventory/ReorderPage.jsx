import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemById } from '../../api/inventoryApi';
import { createReorder, getReorders } from '../../api/inventoryReorderApi';
import Sidebar from '../UserManagement/Sidebar';

const ReorderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reorderData, setReorderData] = useState({
    quantity: 0,
    supplier: '',
    expectedDate: '',
    priority: 'Medium',
    notes: ''
  });
  const [allReorders, setAllReorders] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isLowStock = (item) => {
    // Only show low stock if quantity is BELOW threshold (not equal to)
    // AND if threshold is a reasonable value (not 0 or very low)
    if (!item || item.quantity === undefined || item.threshold === undefined) {
      return false;
    }
    
    // Convert to numbers to ensure proper comparison
    const quantity = Number(item.quantity);
    const threshold = Number(item.threshold);
    
    // Check for NaN values
    if (isNaN(quantity) || isNaN(threshold)) {
      return false;
    }
    
    return threshold > 0 && quantity < threshold;
  };

  // Print ref for PDF generation
  const printRef = useRef();

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [itemResponse, reordersResponse] = await Promise.all([
        getItemById(id),
        getReorders({ limit: 100 }) // Get recent reorders for PDF
      ]);

      if (itemResponse.success) {
        setItem(itemResponse.data);
        // Set default reorder quantity based on threshold
        setReorderData(prev => ({
          ...prev,
          quantity: Math.max(10, itemResponse.data.threshold * 2) // Order at least 2x threshold
        }));
      }

      if (reordersResponse.success) {
        setAllReorders(reordersResponse.data);
      }
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReorderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const reorderPayload = {
        inventoryItemId: id,
        quantity: reorderData.quantity,
        priority: reorderData.priority,
        expectedDate: reorderData.expectedDate,
        supplier: reorderData.supplier || 'To be determined',
        notes: reorderData.notes
      };

      const response = await createReorder(reorderPayload);
      
      if (response.success) {
        // Refresh reorders list for PDF
        const reordersResponse = await getReorders({ limit: 100 });
        if (reordersResponse.success) {
          setAllReorders(reordersResponse.data);
        }
        
        alert('Reorder submitted successfully! You can now generate a PDF report.');
        // Don't navigate away - let user generate PDF first
      }
    } catch (err) {
      setError('Failed to submit reorder: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Enhanced PDF Generation with reorder items table
  const handleGeneratePDF = () => {
    try {
      console.log('Generating PDF with reorder items table...');
      
      // Show the printable content temporarily
      const printContent = printRef.current;
      if (!printContent) {
        alert('Print content not found. Please refresh the page.');
        return;
      }

      // Make the content visible for printing
      printContent.style.display = 'block';
      printContent.style.position = 'absolute';
      printContent.style.left = '-9999px';
      printContent.style.top = '0';
      printContent.style.zIndex = '9999';

      // Trigger print
      window.print();

      // Hide the content again after printing
      setTimeout(() => {
        printContent.style.display = 'none';
        printContent.style.position = 'static';
        printContent.style.left = 'auto';
        printContent.style.top = 'auto';
        printContent.style.zIndex = 'auto';
      }, 1000);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reorder form...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Item not found'}</p>
          <Link to="/inventory" className="text-blue-600 hover:underline">
            ← Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reorder Item</h1>
            <p className="text-gray-600">Create reorder for low stock item</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/inventory"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Item Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Item Name</p>
            <p className="text-lg text-gray-900">{item.item_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Item ID</p>
            <p className="text-lg text-gray-900">{item.item_ID}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="text-lg text-gray-900">{item.category}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Stock</p>
            <p className="text-lg text-gray-900">{item.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Threshold</p>
            <p className="text-lg text-gray-900">{item.threshold}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              (item.threshold > 0 && item.quantity < item.threshold) ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {(item.threshold > 0 && item.quantity < item.threshold) ? 'Low Stock' : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Reorder Summary */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Current Reorder Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Quantity to Order</p>
            <p className="text-2xl font-bold text-blue-600">{reorderData.quantity} units</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Priority</p>
            <p className={`text-lg font-semibold ${
              reorderData.priority === 'Urgent' ? 'text-red-600' :
              reorderData.priority === 'High' ? 'text-orange-600' :
              reorderData.priority === 'Medium' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {reorderData.priority}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Expected Date</p>
            <p className="text-lg text-gray-900">{reorderData.expectedDate || 'Not set'}</p>
          </div>
        </div>
        {reorderData.supplier && (
          <div className="mt-4 bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Supplier</p>
            <p className="text-lg text-gray-900">{reorderData.supplier}</p>
          </div>
        )}
        {reorderData.notes && (
          <div className="mt-4 bg-white p-3 rounded border">
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="text-gray-900">{reorderData.notes}</p>
          </div>
        )}
      </div>

      {/* Reorder Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reorder Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Order *
              </label>
              <input
                type="number"
                name="quantity"
                value={reorderData.quantity}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: {Math.max(10, item.threshold * 2)} units
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                name="priority"
                value={reorderData.priority}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                name="expectedDate"
                value={reorderData.expectedDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={reorderData.supplier}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={reorderData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any additional information about this reorder..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {submitting ? 'Submitting...' : '📋 Submit Reorder'}
            </button>
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={allReorders.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              📄 Generate PDF Report
            </button>
            <Link
              to="/inventory"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Hidden Printable Component for PDF */}
      <div ref={printRef} className="hidden">
        <div className="print-content p-8 max-w-4xl mx-auto bg-white">
          {/* Company Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FireLink SL</h1>
            <p className="text-lg text-gray-600">Fire Response Monitoring and Management System</p>
            <p className="text-sm text-gray-500">123 Fire Station Road, Colombo, Sri Lanka</p>
            <p className="text-sm text-gray-500">Phone: +94 11 234 5678 | Email: orders@firelink.lk</p>
          </div>

          {/* Document Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">INVENTORY REORDER REPORT</h2>
            <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Current Reorder Details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Current Reorder</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Item Name:</p>
                <p className="text-lg text-gray-900 font-semibold">{item.item_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Item ID:</p>
                <p className="text-lg text-gray-900">{item.item_ID}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category:</p>
                <p className="text-lg text-gray-900">{item.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Stock:</p>
                <p className="text-lg text-gray-900">{item.quantity} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Reorder Threshold:</p>
                <p className="text-lg text-gray-900">{item.threshold} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stock Status:</p>
                              <p className={`text-lg font-semibold ${(item.threshold > 0 && item.quantity < item.threshold) ? 'text-red-600' : 'text-green-600'}`}>
                {(item.threshold > 0 && item.quantity < item.threshold) ? 'LOW STOCK' : 'NORMAL'}
                </p>
              </div>
            </div>
          </div>

          {/* Reorder Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Reorder Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Quantity to Order:</p>
                <p className="text-2xl font-bold text-blue-600">{reorderData.quantity} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Priority Level:</p>
                <p className={`text-lg font-semibold ${
                  reorderData.priority === 'Urgent' ? 'text-red-600' :
                  reorderData.priority === 'High' ? 'text-orange-600' :
                  reorderData.priority === 'Medium' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {reorderData.priority.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expected Delivery:</p>
                <p className="text-lg text-gray-900">{reorderData.expectedDate || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier:</p>
                <p className="text-lg text-gray-900">{reorderData.supplier || 'To be determined'}</p>
              </div>
            </div>
            
            {/* Additional Notes */}
            {reorderData.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Additional Notes:</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border">{reorderData.notes}</p>
              </div>
            )}
          </div>

          {/* Debug Information for PDF - Shows Current Form Data */}
          <div className="mb-8 bg-yellow-50 p-4 rounded border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Current Reorder Form Data</h3>
            <div className="text-sm text-yellow-800">
              <p><strong>Quantity:</strong> {reorderData.quantity} units</p>
              <p><strong>Priority:</strong> {reorderData.priority}</p>
              <p><strong>Expected Date:</strong> {reorderData.expectedDate || 'Not set'}</p>
              <p><strong>Supplier:</strong> {reorderData.supplier || 'Not set'}</p>
              <p><strong>Notes:</strong> {reorderData.notes || 'No notes'}</p>
            </div>
          </div>

          {/* Detailed Reorder Summary */}
          <div className="mb-8 bg-blue-50 p-4 rounded border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Detailed Reorder Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Item Being Reordered:</p>
                <p className="text-lg font-bold text-blue-900">{item.item_name}</p>
                <p className="text-sm text-blue-600">ID: {item.item_ID} | Category: {item.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Reorder Details:</p>
                <p className="text-lg font-bold text-blue-900">{reorderData.quantity} units</p>
                <p className="text-sm text-blue-600">Priority: {reorderData.priority}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Delivery Information:</p>
                <p className="text-lg text-blue-900">{reorderData.expectedDate || 'Date not set'}</p>
                <p className="text-sm text-blue-600">Supplier: {reorderData.supplier || 'To be determined'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Current Stock Status:</p>
                <p className="text-lg text-blue-900">{item.quantity} units available</p>
                <p className="text-sm text-blue-600">Threshold: {item.threshold} units</p>
              </div>
            </div>
            {reorderData.notes && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm font-medium text-blue-700">Additional Notes:</p>
                <p className="text-blue-900 bg-white p-2 rounded">{reorderData.notes}</p>
              </div>
            )}
          </div>

          {/* All Reorder Items Table */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">All Reorder Items</h3>
            {allReorders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Item Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Priority</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Expected Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {allReorders.map((reorder, index) => (
                      <tr key={reorder._id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{reorder.item_name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{reorder.category}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{reorder.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          <span className={`font-semibold ${
                            reorder.priority === 'Urgent' ? 'text-red-600' :
                            reorder.priority === 'High' ? 'text-orange-600' :
                            reorder.priority === 'Medium' ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {reorder.priority}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          <span className={`font-semibold ${
                            reorder.status === 'Pending' ? 'text-yellow-600' :
                            reorder.status === 'Approved' ? 'text-green-600' :
                            reorder.status === 'In Transit' ? 'text-blue-600' :
                            reorder.status === 'Delivered' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {reorder.status}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {new Date(reorder.expectedDate).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{reorder.supplier || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No reorders found</p>
            )}
          </div>

          {/* Summary */}
          <div className="mb-8 bg-blue-50 p-4 rounded border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Order Summary</h3>
            <p className="text-blue-800">
              <strong>Total Reorders:</strong> {allReorders.length} items
              <br />
              <strong>Current Reorder:</strong> {reorderData.quantity} units of {item.item_name}
              {(item.threshold > 0 && item.quantity < item.threshold) && (
                <span className="block mt-2 text-red-700 font-semibold">
                  ⚠️ URGENT: Current stock ({item.quantity}) is below threshold ({item.threshold})
                </span>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-300">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Prepared By:</p>
                <p className="text-gray-900">Inventory Manager</p>
                <p className="text-sm text-gray-500">FireLink SL</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Approved By:</p>
                <p className="text-gray-900">_________________</p>
                <p className="text-sm text-gray-500">Date: _________________</p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-8 text-xs text-gray-600">
            <p className="font-medium mb-2">Terms and Conditions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Delivery must be made by the expected date specified</li>
              <li>Items must meet quality standards and specifications</li>
              <li>Payment terms: Net 30 days from delivery</li>
              <li>Returns accepted within 7 days for defective items</li>
              <li>This reorder request is valid for 30 days</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ReorderPage;
