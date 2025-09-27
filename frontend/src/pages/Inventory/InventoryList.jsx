import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getItems, getCategories, getLocations, deleteItem } from '../../api/inventoryApi';
import { createReorder } from '../../api/inventoryReorderApi';
import firelinkLogo from '../../assets/images/firelink-logo.png';

const InventoryList = () => {
  const [searchParams] = useSearchParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Search and filter state - Initialize from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Sort state
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Report generation state
  const [showReportModal, setShowReportModal] = useState(false);
  const [allInventoryData, setAllInventoryData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Dashboard data state - for showing all inventory items in dashboard
  const [dashboardData, setDashboardData] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const status = searchParams.get('status') || '';
    const location = searchParams.get('location') || '';
    
    setSearchTerm(search);
    setSelectedCategory(category);
    setSelectedCondition(condition);
    setSelectedStatus(status);
    setSelectedLocation(location);
  }, [searchParams]);

  useEffect(() => {
    loadInventoryData();// runs when components mount or filters change
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm, selectedCategory, selectedCondition, selectedStatus, selectedLocation]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, locationsData, dashboardInventoryData] = await Promise.all([
        getCategories(),
        getLocations(),
        loadAllInventoryData() // Load all inventory data for dashboard
      ]);
      
      setCategories(categoriesData);
      setLocations(locationsData);
      setDashboardData(dashboardInventoryData); // Set dashboard data
      
  // await loadInventoryData();
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load all inventory items for reports (no pagination or filters)
  const loadAllInventoryData = async () => {
    try {
      const params = {
        page: 1,
        limit: 10000, // Large number to get all items
        sortBy: 'item_name',
        sortOrder: 'asc'
        // No filters - get all items for report
      };

      const response = await getItems(params);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to load all inventory data for report:', err);
      return [];
    }
  };

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        search: searchTerm || undefined, //user input search term
        category: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        status: selectedStatus || undefined,
        location: selectedLocation || undefined
      };

      // Remove undefined and empty string values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });


      //  Calls inventoryApi.js getItems function which sends request to backend
      //wait for response and processes the response and updates state variables
      const response = await getItems(params);
      if (response.success) {
        setInventory(response.data);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to load inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadInventoryData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        loadInventoryData();
      } catch (err) {
        setError('Failed to delete item');
        console.error(err);
      }
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      const allIds = inventory.map(item => item._id);
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const handleBulkReorder = async () => {
    if (selectedItems.length === 0) {
      setError('Please select items to create reorders');
      return;
    }
    
    const lowStockItems = inventory.filter(item => 
      selectedItems.includes(item._id) && isLowStock(item)
    );
    
    if (lowStockItems.length === 0) {
      setError('No low stock items selected for reorder');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create reorders for each selected low stock item with progress feedback
      const results = [];
      const failed = [];
      
      for (let i = 0; i < lowStockItems.length; i++) {
        const item = lowStockItems[i];
        try {
          const reorderData = {
            inventoryItemId: item._id,
            quantity: Math.max(item.threshold - item.quantity, 10), // Suggest reorder quantity
            supplier: 'To be determined', // To be determined by user later
            priority: item.quantity === 0 ? 'Urgent' : 'Medium',
            notes: `Bulk reorder - Item below threshold (${item.quantity}/${item.threshold})`,
            expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 weeks from now
          };
          
          const result = await createReorder(reorderData);
          results.push({ item: item.item_name, success: true, data: result });
        } catch (itemError) {
          console.error(`Failed to create reorder for ${item.item_name}:`, itemError);
          failed.push({ item: item.item_name, error: itemError.message });
        }
      }
      
      // Clear selection and show detailed results
      setSelectedItems([]);
      setSelectAll(false);
      
      if (results.length > 0) {
        const successMessage = `Successfully created ${results.length} reorder request(s)!\n\nItems processed:\n${results.map(r => `✓ ${r.item}`).join('\n')}`;
        
        if (failed.length > 0) {
          const failedMessage = `\n\nFailed items:\n${failed.map(f => `✗ ${f.item}: ${f.error}`).join('\n')}`;
          alert(successMessage + failedMessage);
        } else {
          alert(successMessage);
        }
        
        // Optionally redirect to reorders page
        if (window.confirm('Would you like to view the created reorder requests?')) {
          window.open('/inventory/reorders', '_blank');
        }
      } else {
        setError('Failed to create any reorder requests. Please try again or create individual reorders.');
      }
      
    } catch (error) {
      console.error('Bulk reorder error:', error);
      setError(`Failed to create reorders: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedStatus('');
    setSelectedLocation('');
    setCurrentPage(1);
    loadInventoryData();
  };

  const getConditionColor = (condition, item = null) => {
    // Check for low stock condition
    if (condition === 'Low Stock' || (item && isLowStock(item))) {
      return 'text-amber-600 bg-amber-100';
    }
    
    switch (condition) {
      case 'Good': return 'text-green-600 bg-green-100';
      case 'Damaged': return 'text-orange-600 bg-orange-100';
      case 'Expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'text-green-600 bg-green-100';
      case 'In Use': return 'text-blue-600 bg-blue-100';
      case 'Maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isLowStock = (item) => {
    // Only show low stock if quantity is BELOW threshold (not equal to)
    // AND if threshold is a reasonable value (not 0 or very low)
    // Add proper validation to prevent errors
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

  const isExpired = (item) => item.expire_date && new Date(item.expire_date) < new Date();

  const isExpiringSoon = (item) => {
    if (!item.expire_date) return false;
    
    const expiryDate = new Date(item.expire_date);
    const today = new Date();
    const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    // Consider items expiring within 4 months (120 days) as "expiring soon" for reordering
    return daysDiff > 0 && daysDiff <= 120;
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Navigation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Manage fire department equipment and supplies</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              🏠 Dashboard
            </Link>
            <Link
              to="/inventory/vehicles"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              🚛 Vehicles
            </Link>
            <Link
              to="/inventory/vehicle-items"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              🚗 Vehicle Items
            </Link>
            <Link
              to="/inventory/logs"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              📋 View Logs
            </Link>
            <Link
              to="/inventory/reorders"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              📦 Ordered Items
            </Link>
            <button
              onClick={async () => {
                setLoadingReport(true);
                const allData = await loadAllInventoryData();
                setAllInventoryData(allData);
                setShowReportModal(true);
                setLoadingReport(false);
              }}
              disabled={loadingReport}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {loadingReport ? '⏳ Loading...' : '📄 Generate Report'}
            </button>
            <Link
              to="/inventory/add"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              + Add New Item
            </Link>
          </div>
        </div>
      </div>

      {/* Compact Dashboard Overview */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">📊Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Items */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="text-center">
              <p className="text-blue-100 text-xs">Total Items</p>
              <p className="text-xl font-bold">
                {dashboardData.reduce((total, item) => total + (item.quantity || 0), 0)}
              </p>
            </div>
          </div>

          {/* Available */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="text-center">
              <p className="text-green-100 text-xs">Available Item Categories</p>
              <p className="text-xl font-bold">
                {dashboardData.filter(item => item.quantity > item.threshold).length}
              </p>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
            <div className="text-center">
              <p className="text-yellow-100 text-xs">Low Stock Item Categories</p>
              <p className="text-xl font-bold">
                {dashboardData.filter(item => item.quantity <= item.threshold && item.quantity > 0).length}
              </p>
            </div>
          </div>

          {/* Empty */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 text-white">
            <div className="text-center">
              <p className="text-red-100 text-xs">Empty Item Categories</p>
              <p className="text-xl font-bold">
                {dashboardData.filter(item => item.quantity === 0).length}
              </p>
            </div>
          </div>

          {/* Expired Items */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="text-center">
              <p className="text-orange-100 text-xs">Expired Item Categories</p>
              <p className="text-xl font-bold">
                {dashboardData.filter(item => item.expire_date && new Date(item.expire_date) < new Date()).length}
              </p>
              <div className="text-lg opacity-80"></div>
            </div>
          </div>

        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search items, categories, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Conditions</option>
              <option value="Good">Good</option>
              <option value="Damaged">Damaged</option>
              <option value="Expired">Expired</option>
              <option value="Expires Soon">Expires Soon</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Search
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-800">
                {selectedItems.length} item(s) selected
              </span>
              <span className="text-xs text-blue-600">
                {inventory.filter(item => selectedItems.includes(item._id) && isLowStock(item)).length} low stock items
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkReorder}
                disabled={loading || inventory.filter(item => selectedItems.includes(item._id) && isLowStock(item)).length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>⏳ Creating Reorders...</>
                ) : (
                  <>📋 Bulk Reorder ({inventory.filter(item => selectedItems.includes(item._id) && isLowStock(item)).length})</>
                )}
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

              {/*UI renders the items */}
              {inventory
                .filter(item => {
                  // Client-side filtering for "Expires Soon" condition
                  if (selectedCondition === 'Expires Soon') {
                    return isExpiringSoon(item);
                  }
                  return true; // Show all items for other conditions (handled by backend)
                })
                .map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.item_ID}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{item.item_name}</div>
                    {(isLowStock(item) || isExpired(item)) && (
                      <div className="flex flex-col gap-2 mt-1">
                        {isLowStock(item) && (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠️ Low Stock Alert
                            </span>
                            <div className="text-xs text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-yellow-800">Reorder Required!</p>
                                <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                                  {item.quantity} / {item.threshold}
                                </span>
                              </div>
                              
                              <p className="text-yellow-600 mb-3 text-xs">
                                Current stock is below reorder threshold. Immediate action needed.
                              </p>
                              <div className="flex gap-2">
                                <Link
                                  to={`/inventory/${item._id}/reorder`}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors shadow-sm"
                                >
                                  📋 Create Reorder
                                </Link>
                                <Link
                                  to="/inventory/reorders"
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  📋 View All Reorders
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                        {isExpired(item) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⏰ Expired - Replace Immediately
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.threshold || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition, item)}`}>
                        {item.condition}
                      </span>
                      {isLowStock(item) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-amber-600 bg-amber-100">
                          Low Stock
                        </span>
                      )}
                      {isExpiringSoon(item) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-orange-600 bg-orange-100">
                          Expires Soon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.location || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link 
                        to={`/inventory/${item._id}`} 
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        👁️ View
                      </Link>
                      <Link 
                        to={`/inventory/edit/${item._id}`} //update 1: Navigate to edit form
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        ✏️ Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:relative print:inset-auto print:flex-none print:items-start print:justify-start">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto print:w-full print:max-w-none print:max-h-none print:overflow-visible print:rounded-none print:p-4">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h2 className="text-xl font-bold text-gray-800">Inventory Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Ultra Compact Report Header */}
            <div className="border border-red-600 p-2 print:p-1 mb-1 print:mb-0">
              <div className="flex items-center justify-between mb-1 print:mb-0">
                {/* Logo & Title Section */}
                <div className="flex items-center">
                  <div className="w-10 h-10 print:w-8 print:h-8 mr-2 flex-shrink-0">
                    <img 
                      src={firelinkLogo} 
                      alt="FireLink-SL Logo" 
                      className="w-full h-full object-contain rounded print:rounded-none"
                      onError={(e) => {
                        console.log('Logo failed to load, showing fallback');
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm print:text-xs hidden">
                      🔥
                    </div>
                  </div>
                  <div className="text-left">
                    <h1 className="text-lg font-bold text-red-600 print:text-base">FIRELINK-SL</h1>
                    <p className="text-xs font-semibold print:text-[10px] text-gray-700">Fire and Rescue Service</p>
                  </div>
                </div>
                
                {/* Report Title & Quick Stats */}
                <div className="text-right">
                  <h2 className="text-base font-bold text-gray-800 print:text-sm">INVENTORY STATUS REPORT</h2>
                  <p className="text-[10px] text-gray-600 print:text-[8px]">{new Date().toLocaleDateString()} | Items: {allInventoryData.length} | Alerts: {allInventoryData.filter(item => item.quantity <= item.threshold).length}</p>
                </div>
              </div>
            </div>

            {/* Enhanced Inventory Summary */}
            <div className="border border-gray-300 p-2 print:p-1 mb-1 print:mb-0">
              <div className="grid grid-cols-5 gap-2 print:gap-1 text-center text-xs print:text-[10px]">
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Item Categories</p>
                  <p className="text-sm print:text-[10px] font-bold">{allInventoryData.length}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Total Items</p>
                  <p className="text-sm print:text-[10px] font-bold text-blue-600">
                    {allInventoryData.reduce((total, item) => total + (item.quantity || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Available Categories</p>
                  <p className="text-sm print:text-[10px] font-bold text-green-600">
                    {allInventoryData.filter(item => item.quantity > item.threshold).length}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Low Level Categories</p>
                  <p className="text-sm print:text-[10px] font-bold text-yellow-600">
                    {allInventoryData.filter(item => item.quantity <= item.threshold && item.quantity > 0).length}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 print:text-[8px]">Empty Categories</p>
                  <p className="text-sm print:text-[10px] font-bold text-red-600">
                    {allInventoryData.filter(item => item.quantity === 0).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Inventory Table - Starts immediately after stats */}
            <div className="border border-gray-300 mt-0 print:mt-0">
              <h3 className="text-base font-semibold mb-1 print:mb-0 p-2 print:p-1 bg-gray-50 text-red-600 print:bg-white print:border-b print:border-red-600 print:text-sm">DETAILED INVENTORY LISTING</h3>
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-sm print:text-xs">
                  <thead className="bg-red-600 text-white">
                    <tr>
                      <th className="px-3 py-2 text-left">Item Code</th>
                      <th className="px-3 py-2 text-left">Item Name</th>
                      <th className="px-3 py-2 text-center">Category</th>
                      <th className="px-3 py-2 text-center">Current Stock</th>
                      <th className="px-3 py-2 text-center print:hidden">Reorder Level</th>
                      <th className="px-3 py-2 text-center print:hidden">Unit Price (Rs.)</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-center">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInventoryData.map((item, index) => {
                      const getStatusInfo = (item) => {
                        if (item.quantity === 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-800' };
                        if (item.quantity <= item.threshold) return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
                        return { label: 'In Stock', class: 'bg-green-100 text-green-800' };
                      };
                      const status = getStatusInfo(item);
                      
                      return (
                        <tr key={item._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-3 py-2 border-b">{item.item_ID || 'N/A'}</td>
                          <td className="px-3 py-2 border-b">{item.item_name || 'N/A'}</td>
                          <td className="px-3 py-2 border-b text-center">{item.category || 'N/A'}</td>
                          <td className="px-3 py-2 border-b text-center">{item.quantity || '0'}</td>
                          <td className="px-3 py-2 border-b text-center print:hidden">{item.threshold || '0'}</td>
                          <td className="px-3 py-2 border-b text-center print:hidden">{item.unitPrice?.toLocaleString() || item.unit_price?.toLocaleString() || 'N/A'}</td>
                          <td className="px-3 py-2 border-b text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-b text-center">{item.location || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Critical Items Section */}
            {allInventoryData.filter(item => item.quantity <= item.threshold).length > 0 && (
              <div className="border border-red-300 p-4 mt-4 bg-red-50">
                <h3 className="text-lg font-semibold mb-3 text-red-600">
                  <span className="print:hidden">⚠️ </span>ITEMS REQUIRING IMMEDIATE ATTENTION
                </h3>
                <div className="grid gap-2">
                  {allInventoryData
                    .filter(item => item.quantity <= item.threshold)
                    .map(item => (
                      <div key={item._id} className="flex justify-between items-center bg-white p-2 rounded border border-red-200">
                        <div>
                          <span className="font-semibold">{item.item_name}</span>
                          <span className="text-gray-600 ml-2">({item.item_ID})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-red-600 font-bold">Stock: {item.quantity}</span>
                          <span className="text-gray-500 ml-2">/ Threshold: {item.threshold}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Report Footer */}
            <div className="border-t-2 border-red-600 mt-6 pt-4 print:mt-4 print:pt-2">
              <div className="grid grid-cols-3 gap-4 text-sm print:text-xs">
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 print:mb-1">SYSTEM INFORMATION</h4>
                  <p><strong>Generated By:</strong> FireLink-SL IMS</p>
                  <p><strong>Platform Version:</strong> 2.1.0</p>
                  <p><strong>Database:</strong> MongoDB Atlas</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 print:mb-1">CONTACT INFORMATION</h4>
                  <p><strong>Emergency Hotline:</strong> 110</p>
                  <p><strong>Admin Office:</strong> +94-11-XXXXXXX</p>
                  <p><strong>Email:</strong> inventory@firelink.lk</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 print:mb-1">DOCUMENT CONTROL</h4>
                  <p><strong>Valid Until:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  <p><strong>Next Review:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  <p><strong>Page:</strong> 1 of 1</p>
                </div>
              </div>
              
              {/* Official Disclaimer */}
              <div className="bg-red-50 print:bg-gray-100 p-3 print:p-2 rounded print:rounded-none mt-4 print:mt-2 border border-red-200 print:border-gray-300">
                <p className="text-xs print:text-[10px] text-gray-700 text-center">
                  <strong>CONFIDENTIAL DOCUMENT</strong> - This inventory report contains sensitive operational data of the Fire and Rescue Service of Sri Lanka. 
                  Distribution is restricted to authorized personnel only. Any unauthorized disclosure, copying, or distribution is strictly prohibited. 
                  For questions regarding this report, contact the Inventory Management Department at inventory@firelink.lk
                </p>
              </div>
              
              {/* Report Signature Section */}
              <div className="grid grid-cols-2 gap-8 mt-6 print:mt-4 text-sm print:text-xs">
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 print:pt-1 mt-8 print:mt-6">
                    <p><strong>Inventory Manager</strong></p>
                    <p className="text-gray-600">Fire and Rescue Service</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 print:pt-1 mt-8 print:mt-6">
                    <p><strong>Department Head</strong></p>
                    <p className="text-gray-600">Emergency Services Division</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">
              <button
                onClick={() => {
                  // Create a new window with only the report content
                  const printWindow = window.open('', '', 'width=800,height=600');
                  let reportContent = document.querySelector('.fixed.inset-0 .bg-white').innerHTML;
                  
                  // Remove modal-specific elements and keep only report content
                  reportContent = reportContent.replace(/<div class="flex justify-between items-center mb-4 print:hidden">.*?<\/div>/s, '');
                  reportContent = reportContent.replace(/<div class="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">.*?<\/div>/s, '');
                  
                  // Create a clean table without reorder level column
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = reportContent;
                  
                  // Ensure Item Code and Item Name columns are preserved
                  console.log('Preserving Item Code and Item Name columns for print');
                  
                  // Remove reorder level and unit price headers
                  const hiddenHeaders = tempDiv.querySelectorAll('th.print\\:hidden');
                  hiddenHeaders.forEach(header => {
                    console.log('Removing hidden header:', header.textContent);
                    header.remove();
                  });
                  
                  // Remove reorder level and unit price cells
                  const hiddenCells = tempDiv.querySelectorAll('td.print\\:hidden');
                  hiddenCells.forEach(cell => {
                    console.log('Removing hidden cell');
                    cell.remove();
                  });
                  
                  reportContent = tempDiv.innerHTML;
                  
                  let cleanContent = reportContent;
                  
                  // Set custom filename for print
                  const currentDate = new Date().toISOString().split('T')[0];
                  const customFilename = `FireLink-SL_Inventory_Report_${currentDate}`;
                  
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>${customFilename}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        @page { size: A4; margin: 15mm; }
                        body { 
                          font-size: 12px; 
                          line-height: 1.3; 
                          color: black !important;
                          background: white !important;
                          margin: 0;
                          padding: 20px;
                        }
                        * {
                          color: black !important;
                          background: white !important;
                          border-color: black !important;
                        }
                        table { 
                          page-break-inside: auto; 
                          width: 100%; 
                          border-collapse: collapse;
                        }
                        th, td {
                          border: 1px solid black !important;
                          background: white !important;
                          color: black !important;
                          padding: 8px;
                        }
                        th {
                          background: #f5f5f5 !important;
                          font-weight: bold;
                        }
                        tr { 
                          page-break-inside: avoid; 
                          page-break-after: auto; 
                        }
                        .bg-red-600, .bg-green-100, .bg-yellow-100, .bg-red-100,
                        .bg-gray-50, .bg-red-50 {
                          background: white !important;
                          color: black !important;
                        }
                        .text-red-600, .text-green-600, .text-yellow-600,
                        .text-red-800, .text-green-800, .text-yellow-800 {
                          color: black !important;
                        }
                        .border-red-600, .border-red-300, .border-red-200,
                        .border-gray-300, .border-gray-200 {
                          border-color: black !important;
                        }
                        .rounded-full, .rounded, .rounded-lg, .rounded-md {
                          border-radius: 0 !important;
                        }
                        /* Hide any remaining interactive elements */
                        button, input, select {
                          display: none !important;
                        }
                        /* Hide reorder level column in print */
                        .print\\:hidden {
                          display: none !important;
                        }
                      </style>
                    </head>
                    <body>
                      ${cleanContent}
                    </body>
                    </html>
                  `);
                  
                  printWindow.document.close();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 500);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🖨️ Print Report
              </button>
              <button
                onClick={() => {
                  // Create a new window for PDF generation
                  const printWindow = window.open('', '', 'width=800,height=600');
                  let reportContent = document.querySelector('.fixed.inset-0 .bg-white').innerHTML;
                  
                  // Remove emojis, icons, and interactive elements from content
                  reportContent = reportContent.replace(/🔥|📄|📊|📈|📋|⚠️|🖨️/g, '');
                  reportContent = reportContent.replace(/✕/g, '');
                  // Remove modal header and footer controls
                  reportContent = reportContent.replace(/<div class="flex justify-between items-center mb-4 print:hidden">.*?<\/div>/s, '');
                  reportContent = reportContent.replace(/<div class="flex justify-end gap-3 mt-6 pt-4 border-t print:hidden">.*?<\/div>/s, '');
                  // Remove any input, select, or button elements
                  reportContent = reportContent.replace(/<input[^>]*>/g, '');
                  reportContent = reportContent.replace(/<select[^>]*>.*?<\/select>/g, '');
                  reportContent = reportContent.replace(/<button[^>]*>.*?<\/button>/g, '');
                  // Remove search and filter related divs
                  reportContent = reportContent.replace(/<div[^>]*class="[^"]*search[^"]*"[^>]*>.*?<\/div>/g, '');
                  reportContent = reportContent.replace(/<div[^>]*class="[^"]*filter[^"]*"[^>]*>.*?<\/div>/g, '');
                  // Create a temporary DOM to manipulate the content
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = reportContent;
                  
                  // Ensure Item Code and Item Name are preserved in PDF
                  console.log('Preserving Item Code and Item Name columns for PDF');
                  
                  // Remove all hidden headers (reorder level and unit price)
                  const hiddenHeaders = tempDiv.querySelectorAll('th[class*="print:hidden"]');
                  hiddenHeaders.forEach(header => {
                    console.log('Removing hidden header from PDF:', header.textContent);
                    header.remove();
                  });
                  
                  // Remove all hidden cells (reorder level and unit price)
                  const hiddenCells = tempDiv.querySelectorAll('td[class*="print:hidden"]');
                  hiddenCells.forEach(cell => {
                    console.log('Removing hidden cell from PDF');
                    cell.remove();
                  });
                  
                  reportContent = tempDiv.innerHTML;
                  
                  // Set custom filename for PDF
                  const currentDatePDF = new Date().toISOString().split('T')[0];
                  const customFilenamePDF = `FireLink-SL_Inventory_Report_${currentDatePDF}`;
                  
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>${customFilenamePDF}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        @page { size: A4; margin: 15mm; }
                        body { 
                          font-size: 12px; 
                          line-height: 1.3; 
                          color: black !important;
                          background: white !important;
                        }
                        * {
                          color: black !important;
                          background: white !important;
                          border-color: black !important;
                        }
                        /* Hide any search/filter elements in PDF */
                        input, select, button, .search, .filter, .dropdown,
                        .form-control, input[type="text"], input[type="search"] {
                          display: none !important;
                        }
                        table { 
                          page-break-inside: auto; 
                          width: 100%; 
                          border-collapse: collapse;
                        }
                        th, td {
                          border: 1px solid black !important;
                          background: white !important;
                          color: black !important;
                          padding: 8px;
                        }
                        th {
                          background: #f5f5f5 !important;
                          font-weight: bold;
                        }
                        tr { 
                          page-break-inside: avoid; 
                          page-break-after: auto; 
                        }
                        .print\\:hidden { display: none !important; }
                        .print\\:text-xs { font-size: 10px; }
                        .print\\:bg-white { background-color: white !important; }
                        .print\\:border-b { border-bottom: 1px solid black; }
                        .print\\:border-red-600 { border-color: black; }
                        .print\\:break-inside-avoid { page-break-inside: avoid; }
                        .bg-red-600, .bg-green-100, .bg-yellow-100, .bg-red-100,
                        .bg-gray-50, .bg-red-50 {
                          background: white !important;
                          color: black !important;
                        }
                        .text-red-600, .text-green-600, .text-yellow-600,
                        .text-red-800, .text-green-800, .text-yellow-800 {
                          color: black !important;
                        }
                        .border-red-600, .border-red-300, .border-red-200,
                        .border-gray-300, .border-gray-200 {
                          border-color: black !important;
                        }
                        .rounded-full, .rounded, .rounded-lg, .rounded-md {
                          border-radius: 0 !important;
                        }
                      </style>
                    </head>
                    <body class="bg-white p-4">
                      ${reportContent}
                    </body>
                    </html>
                  `);
                  
                  printWindow.document.close();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 500);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
