import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAllVehicleItems } from '../../api/inventoryVehicleItemsApi';
import { getItems } from '../../api/inventoryApi';
import { getVehicles } from '../../api/inventoryVehicleApi';

const VehicleItemsPage = () => {
  const { vehicleId } = useParams(); // Get vehicleId from URL if present
  const [vehicleItems, setVehicleItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleId || ''); // Auto-select if vehicleId in URL
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Update selected vehicle when vehicleId from URL changes
    if (vehicleId && vehicleId !== selectedVehicle) {
      setSelectedVehicle(vehicleId);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicleItemsData();
  }, [currentPage, itemsPerPage, selectedVehicle, selectedItem]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, vehiclesResponse] = await Promise.all([
        getItems({ limit: 1000 }), // Get all items for filter dropdown
        getVehicles(1, 1000) // Get all vehicles for filter dropdown
      ]);
      
      if (itemsResponse.success) {
        setAvailableItems(itemsResponse.data);
      }
      
      if (vehiclesResponse.success) {
        setAvailableVehicles(vehiclesResponse.data);
      }
      
      await loadVehicleItemsData();
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleItemsData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedVehicle) filters.vehicle_ID = selectedVehicle;
      if (selectedItem) filters.item_ID = selectedItem;

      const response = await getAllVehicleItems(currentPage, itemsPerPage, filters);
      
      if (response.success) {
        setVehicleItems(response.data);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to load vehicle items data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadVehicleItemsData();
  };

  const clearFilters = () => {
    setSelectedVehicle('');
    setSelectedItem('');
    setCurrentPage(1);
    loadVehicleItemsData();
  };

  const getExpiryStatus = (expireDate) => {
    if (!expireDate) return 'No Expiry';
    const expiry = new Date(expireDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (expiry < now) return 'Expired';
    if (expiry <= thirtyDaysFromNow) return 'Expiring Soon';
    return 'OK';
  };

  const getExpiryColor = (expireDate) => {
    const status = getExpiryStatus(expireDate);
    switch (status) {
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800';
      case 'OK': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && vehicleItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicleId ? 'Vehicle Items - Specific Vehicle' : 'Vehicle Items Management'}
            </h1>
            <p className="text-gray-600">
              {vehicleId 
                ? `Viewing items for selected vehicle${selectedVehicle ? ` (${availableVehicles.find(v => v._id === selectedVehicle)?.vehicle_name || 'Loading...'})` : ''}`
                : 'Manage items assigned to vehicles'
              }
            </p>
          </div>
          <div className="flex gap-4">
            {vehicleId && (
              <Link
                to={`/inventory/vehicles/${vehicleId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                🚛 Back to Vehicle
              </Link>
            )}
            <Link
              to="/inventory"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              📦 Back to Inventory
            </Link>
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              🏠 Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Vehicles</option>
                      {availableVehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.vehicle_name} ({vehicle.vehicle_type})
                        </option>
                      ))}
                    </select>
                  </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Items</option>
              {availableItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.item_name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilterChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 mr-2"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Items Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Items</h2>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicleItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No vehicle items found
                  </td>
                </tr>
              ) : (
                vehicleItems.map((vehicleItem) => (
                  <tr key={vehicleItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicleItem.vehicle_ID?.vehicle_name || 'Unknown Vehicle'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicleItem.vehicle_ID?.vehicle_type || 'Unknown Type'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicleItem.item_ID?.item_name || 'Unknown Item'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicleItem.item_ID?.category || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicleItem.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicleItem.item_ID?.expire_date 
                          ? new Date(vehicleItem.item_ID.expire_date).toLocaleDateString()
                          : 'No expiry'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExpiryColor(vehicleItem.item_ID?.expire_date)}`}>
                        {getExpiryStatus(vehicleItem.item_ID?.expire_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(vehicleItem.assignedDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleItemsPage;
