import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInventoryDashboardStats } from '../../api/inventoryDashboardApi';

// Safe mini line chart component with error handling
const LineChart = ({ data, height = 60, stroke = '#2563eb' }) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-gray-400 text-sm">No trend data available</div>;
    }
    
    const max = Math.max(...data.map(d => d?.count || 0), 1);
    const stepX = 100 / (data.length - 1 || 1);
    
    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = max === 0 ? 100 : 100 - ((d?.count || 0) / max) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }}>
          <polyline 
            fill="none" 
            stroke={stroke} 
            strokeWidth="3" 
            points={points} 
            strokeLinejoin="round" 
            strokeLinecap="round" 
          />
          {data.map((d, i) => {
            const x = i * stepX;
            const y = max === 0 ? 100 : 100 - ((d?.count || 0) / max) * 100;
            return <circle key={i} cx={x} cy={y} r={2} fill={stroke} />;
          })}
        </svg>
      </div>
    );
  } catch (error) {
    console.error('LineChart error:', error);
    return <div className="text-red-400 text-sm">Chart error</div>;
  }
};

const InventoryManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getInventoryDashboardStats();
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.error || 'Failed to load dashboard data');
          // Still set safe default data to prevent UI crashes
          setStats(response.data);
        }
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Unable to load dashboard data');
        // Set minimal safe data
        setStats({
          inventory: { totalItems: 0, lowStockCount: 0, expiredCount: 0, expiringSoonCount: 0 },
          vehicles: { totalVehicles: 0, availableVehicles: 0, inUseVehicles: 0, maintenanceVehicles: 0 },
          reorders: {},
          assignments: { totalAssignments: 0, totalAssignedQuantity: 0, vehiclesWithAssignments: 0 },
          recentLogs: [],
          trends: { itemsAddedLast7Days: [] },
          categories: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800 text-center">
              <h3 className="text-lg font-medium mb-2">Dashboard Error</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe data extraction with fallbacks
  const inventory = stats?.inventory || {};
  const vehicles = stats?.vehicles || {};
  const reorders = stats?.reorders || {};
  const assignments = stats?.assignments || {};
  const recentLogs = Array.isArray(stats?.recentLogs) ? stats.recentLogs : [];
  const trends = stats?.trends || {};
  const categories = Array.isArray(stats?.categories) ? stats.categories : [];

  const kpis = [
    { label: 'Total Items', value: inventory.totalItems || 0, color: 'bg-blue-50 text-blue-700' },
    { label: 'Low Stock', value: inventory.lowStockCount || 0, color: 'bg-amber-50 text-amber-700' },
    { label: 'Expired', value: inventory.expiredCount || 0, color: 'bg-red-50 text-red-700' },
    { label: 'Expiring Soon', value: inventory.expiringSoonCount || 0, color: 'bg-orange-50 text-orange-700' },
    { label: 'Total Vehicles', value: vehicles.totalVehicles || 0, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Available Vehicles', value: vehicles.availableVehicles || 0, color: 'bg-green-50 text-green-700' },
    { label: 'Assignments', value: assignments.totalAssignments || 0, color: 'bg-teal-50 text-teal-700' },
    { label: 'Assigned Qty', value: assignments.totalAssignedQuantity || 0, color: 'bg-sky-50 text-sky-700' }
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Manager Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of inventory, vehicles, and operations.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <div key={index} className={`rounded-lg border p-4 shadow-sm ${kpi.color}`}> 
              <div className="text-sm font-medium">{kpi.label}</div>
              <div className="mt-2 text-2xl font-bold">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Items Added (Last 7 Days)</h2>
            </div>
            <LineChart data={trends.itemsAddedLast7Days || []} />
            <div className="mt-4 flex gap-4 text-sm text-gray-600 overflow-x-auto">
              {(trends.itemsAddedLast7Days || []).map((d, index) => (
                <div key={index} className="flex flex-col items-center whitespace-nowrap">
                  <span className="font-medium">{d?.count || 0}</span>
                  <span>{d?.date ? d.date.slice(5) : '--'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h2>
            {categories.length > 0 ? (
              <div className="text-sm max-h-48 overflow-y-auto">
                {/* Column Headers */}
                <div className="flex justify-between mb-3 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <span>Category</span>
                  <span>ITEM types / Quantity</span>
                </div>
                {/* Data Rows */}
                <ul className="space-y-2">
                  {categories.slice(0, 8).map((cat, index) => (
                    <li key={index} className="flex justify-between">
                      <span className="font-medium text-gray-700">{cat.category || 'Uncategorized'}</span>
                      <span className="text-gray-600">{cat.items || 0} / {cat.quantity || 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No category data available</div>
            )}
          </div>
        </div>

        {/* Status Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Reorders */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Reorders by Status</h2>
            <ul className="space-y-2 text-sm">
              {Object.keys(reorders).length > 0 ? (
                Object.entries(reorders).map(([status, count]) => (
                  <li key={status} className="flex justify-between capitalize">
                    <span>{status.replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{count || 0}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No reorder data</li>
              )}
            </ul>
          </div>

          {/* Assignments Summary */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Assignments</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Records</span>
                <span className="font-semibold">{assignments.totalAssignments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Quantity</span>
                <span className="font-semibold">{assignments.totalAssignedQuantity || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicles With Items</span>
                <span className="font-semibold">{assignments.vehiclesWithAssignments || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link to="/inventory" className="px-3 py-2 rounded bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors">
                Inventory
              </Link>
              <Link to="/inventory/vehicle-items" className="px-3 py-2 rounded bg-indigo-600 text-white text-center hover:bg-indigo-700 transition-colors">
                Vehicle Items
              </Link>
              <Link to="/inventory/vehicles" className="px-3 py-2 rounded bg-emerald-600 text-white text-center hover:bg-emerald-700 transition-colors">
                Vehicles
              </Link>
              <Link to="/inventory/reorders" className="px-3 py-2 rounded bg-amber-600 text-white text-center hover:bg-amber-700 transition-colors">
                Reorders
              </Link>
              <Link to="/inventory/logs" className="px-3 py-2 rounded bg-gray-700 text-white text-center hover:bg-gray-800 transition-colors">
                Logs
              </Link>
              <Link to="/dashboard" className="px-3 py-2 rounded bg-slate-600 text-white text-center hover:bg-slate-700 transition-colors">
                Main
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Inventory Activity</h2>
            <Link to="/inventory/logs" className="text-sm text-blue-600 hover:underline">
              View All Logs
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 uppercase text-xs border-b">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? (
                  recentLogs.slice(0, 5).map((log) => (
                    <tr key={log._id || Math.random()} className="border-b last:border-none">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-2 pr-4 font-medium">{log.action || 'N/A'}</td>
                      <td className="py-2 pr-4">{log.itemName || 'N/A'}</td>
                      <td className="py-2 pr-4 text-gray-600 max-w-xs truncate" title={log.description}>
                        {log.description || 'No description'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-500 text-center">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerDashboard;