import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems, getCategories, getLocations, deleteItem } from '../../api/inventoryApi';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
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

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadInventoryData();// runs when components mout or filters change
  }, [currentPage, itemsPerPage, sortBy, sortOrder]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, locationsData] = await Promise.all([
        getCategories(),
        getLocations()
      ]);
      
      setCategories(categoriesData);
      setLocations(locationsData);
      
  // await loadInventoryData();
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleBulkReorder = () => {
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
    
    // Navigate to bulk reorder page or show modal
    const itemIds = lowStockItems.map(item => item._id).join(',');
    window.open(`/inventory/bulk-reorder?items=${itemIds}`, '_blank');
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

  const getConditionColor = (condition) => {
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
              to="/inventory/add"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              + Add New Item
            </Link>
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
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                📋 Bulk Reorder ({inventory.filter(item => selectedItems.includes(item._id) && isLowStock(item)).length})
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
              {inventory.map((item) => (
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
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
    </div>
  );
};

export default InventoryList;
