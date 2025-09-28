import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addItem, updateItem, getItemById, getCategories, getLocations, checkItemIdExists } from '../../api/inventoryApi';
import Sidebar from '../UserManagement/Sidebar';

// This form is used for both adding new items and editing existing items
const InventoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id); // update 2 : True if editing an existing item

  // Get user data for sidebar
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/staff-login");
  };

  // Form state
  //Read 1.1 : User enters this data in the form
  const [formData, setFormData] = useState({
    item_ID: '',
    item_name: '',
    category: '',
    quantity: '',
    condition: 'Good',
    location: '',
    status: 'Available',
    threshold: '30',
    expire_date: '',
    notes: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [itemIdExists, setItemIdExists] = useState(false);
  const [checkingItemId, setCheckingItemId] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadItemData();                  //update 3: Automatically load existing item data
      setItemIdExists(false); // Clear item ID validation when editing
    }
  }, [id, isEditing]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        getCategories(),
        getLocations()
      ]);
      
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (err) {
      setError('Failed to load form data');
      console.error(err);
    }
  };

  const loadItemData = async () => {
    try {
      setLoading(true);
      const response = await getItemById(id);//update 4: Calls inventoryApi.js getItemById function which sends request to backend 
                                            // (API makes HTTP GET request to /api/inventory/:id and waits for response)
      
      // form processes the response and prefills
      if (response.success) {// update 4A: If response is successful, populate form with existing item data
        const item = response.data; //update 11 A: extract item data from response
        setFormData({                 //update 11 B: prefill form fields
          item_ID: item.item_ID || '',
          item_name: item.item_name || '',
          category: item.category || '',
          quantity: item.quantity || '',
          condition: item.condition || 'Good',
          location: item.location || '',
          status: item.status || 'Available',
          threshold: item.threshold || '30',
          expire_date: item.expire_date ? new Date(item.expire_date).toISOString().split('T')[0] : '',
          notes: item.notes || ''
        });
      }
    } catch (err) {
      setError('Failed to load item data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check if item ID exists when user types in item_ID field
    if (name === 'item_ID' && !isEditing && value && value.length > 0) {
      debouncedCheckItemId(value);
    } else if (name === 'item_ID') {
      setItemIdExists(false);
    }
  };

  const validateItemId = useCallback(async (itemId) => {
    if (!itemId || itemId < 1) {
      setItemIdExists(false);
      return;
    }

    try {
      setCheckingItemId(true);
      console.log('🔍 Checking item ID:', itemId);
      
      // Use the new API function to check if item ID exists
      const response = await checkItemIdExists(itemId);
      console.log('📡 API Response:', response);
      
      setItemIdExists(response.exists);
      console.log('✅ Set itemIdExists to:', response.exists);
    } catch (err) {
      console.error('❌ Error checking item ID:', err);
      // If error, item ID doesn't exist (which is what we want)
      setItemIdExists(false);
    } finally {
      setCheckingItemId(false);
    }
  }, []);

  // Debounced version to avoid too many API calls
  const debouncedCheckItemId = useCallback((itemId) => {
    const timeoutId = setTimeout(() => {
      validateItemId(itemId);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [validateItemId]);

  const validateForm = () => {
    if (!formData.item_ID || !formData.item_name || !formData.category) {
      setError('Item ID, Item Name, and Category are required');
      return false;
    }
    
    if (formData.quantity < 0) {
      setError('Quantity cannot be negative');
      return false;
    }
    
    if (formData.threshold < 0) {
      setError('Threshold cannot be negative');
      return false;
    }

    // Check if item ID already exists (only for new items)
    if (!isEditing && itemIdExists) {
      setError('❌ Item ID already exists! Please choose a different Item ID.');
      return false;
    }
    
    return true;
  };

  //2. When user clicks "Save", this function runs
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) { // Validate form before submitting
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      //3. Convert strings to numbers for API
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        threshold: parseInt(formData.threshold),
        expire_date: formData.expire_date || null
      };

      if (isEditing) { //update 12 : If editing, call update API and wait for response
        await updateItem(id, submitData); 
      } else {
        //4. Call the API to add a new item AND WAIT FOR RESPONSE //23. THIS LINE ALSO WAIT FOR BACKEND RESPONSE AND CATCHES IT BUT DOESN'T STORE IT
        await addItem(submitData);//5. Redirect to inventory list --> look inventoryApi.js
      }
      navigate('/inventory');//24. nOW FETCHES FRESH DATA FROM DATABASE

    } catch (err) {
      // Handle specific error messages for better user experience
      let errorMessage = 'Failed to save item';
      
      if (err.response?.data?.message) {        //CATCHES ERRORS FROM BACKEND
        const backendMessage = err.response.data.message; // Extract error message
        
        if (backendMessage.includes('Item ID already exists')) {
          errorMessage = '❌ Item ID already exists! Please choose a different Item ID.';
        } else if (backendMessage.includes('validation failed')) {
          errorMessage = `Validation Error: ${backendMessage}`;
        } else {
          errorMessage = backendMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Update the inventory item details below.' : 'Fill in the details to add a new item to inventory.'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item ID */}
            <div>
              <label htmlFor="item_ID" className="block text-sm font-medium text-gray-700 mb-2">
                Item ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="item_ID"
                name="item_ID"
                value={formData.item_ID}
                onChange={handleInputChange}
                required
                min="1"
                readOnly={isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter unique item ID (1 or greater)"
              />
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Item ID cannot be changed once created (Primary Key)
                </p>
              )}
              
              {/* Real-time Item ID validation */}
              {!isEditing && formData.item_ID && (
                <div className="mt-2">
                  {checkingItemId ? (
                    <p className="text-xs text-blue-600">
                      🔍 Checking if Item ID is available...
                    </p>
                  ) : itemIdExists ? (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ This Item ID already exists! Please choose a different one.
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium">
                      ✅ Item ID is available
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Item Name */}
            <div>
              <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter item name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity"
              />
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Threshold */}
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="threshold"
                name="threshold"
                value={formData.threshold}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter threshold (default: 30)"
              />
            </div>

            {/* Expire Date */}
            <div>
              <label htmlFor="expire_date" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                id="expire_date"
                name="expire_date"
                value={formData.expire_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes - Full Width */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes about this item"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {submitting ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
