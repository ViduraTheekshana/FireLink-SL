import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInventoryDashboardStats } from '../../api/inventoryDashboardApi';

// Enhanced line chart component with detailed X and Y axes
const LineChart = ({ data, height = 200, stroke = '#2563eb' }) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-gray-400 text-sm">No trend data available</div>;
    }
    
    const maxCount = Math.max(...data.map(d => d?.count || 0), 5); // Minimum scale of 5
    const padding = { top: 20, right: 30, bottom: 60, left: 50 };
    const chartWidth = 500;
    const chartHeight = height - padding.top - padding.bottom;
    const chartInnerWidth = chartWidth - padding.left - padding.right;
    
    // Calculate positions
    const stepX = chartInnerWidth / (data.length - 1 || 1);
    
    const points = data.map((d, i) => {
      const x = padding.left + (i * stepX);
      const y = padding.top + (chartHeight - ((d?.count || 0) / maxCount) * chartHeight);
      return { x, y, count: d?.count || 0, date: d?.date };
    });
    
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Y-axis ticks (5 levels)
    const yTicks = [];
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxCount / 4) * i);
      const y = padding.top + chartHeight - (i / 4) * chartHeight;
      yTicks.push({ value, y });
    }
    
    return (
      <div className="w-full">
        <svg 
          viewBox={`0 0 ${chartWidth} ${height}`} 
          className="w-full overflow-visible"
          style={{ height: height }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={chartInnerWidth} 
            height={chartHeight} 
            fill="url(#grid)" 
          />
          
          {/* Y-axis */}
          <line 
            x1={padding.left} 
            y1={padding.top} 
            x2={padding.left} 
            y2={padding.top + chartHeight} 
            stroke="#6b7280" 
            strokeWidth="2"
          />
          
          {/* Y-axis ticks and labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line 
                x1={padding.left - 5} 
                y1={tick.y} 
                x2={padding.left} 
                y2={tick.y} 
                stroke="#6b7280" 
                strokeWidth="1"
              />
              <text 
                x={padding.left - 10} 
                y={tick.y + 4} 
                textAnchor="end" 
                className="text-xs fill-gray-600"
                fontSize="11"
              >
                {tick.value}
              </text>
              {/* Horizontal grid lines */}
              <line 
                x1={padding.left} 
                y1={tick.y} 
                x2={padding.left + chartInnerWidth} 
                y2={tick.y} 
                stroke="#e5e7eb" 
                strokeWidth="0.5" 
                strokeDasharray="2,2"
              />
            </g>
          ))}
          
          {/* X-axis */}
          <line 
            x1={padding.left} 
            y1={padding.top + chartHeight} 
            x2={padding.left + chartInnerWidth} 
            y2={padding.top + chartHeight} 
            stroke="#6b7280" 
            strokeWidth="2"
          />
          
          {/* X-axis ticks and labels */}
          {points.map((point, i) => {
            const date = new Date(point.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            
            return (
              <g key={i}>
                <line 
                  x1={point.x} 
                  y1={padding.top + chartHeight} 
                  x2={point.x} 
                  y2={padding.top + chartHeight + 5} 
                  stroke="#6b7280" 
                  strokeWidth="1"
                />
                <text 
                  x={point.x} 
                  y={padding.top + chartHeight + 18} 
                  textAnchor="middle" 
                  className="text-xs fill-gray-600 font-medium"
                  fontSize="10"
                >
                  {dayName}
                </text>
                <text 
                  x={point.x} 
                  y={padding.top + chartHeight + 32} 
                  textAnchor="middle" 
                  className="text-xs fill-gray-500"
                  fontSize="9"
                >
                  {monthName} {dayNumber}
                </text>
                {/* Vertical grid lines */}
                <line 
                  x1={point.x} 
                  y1={padding.top} 
                  x2={point.x} 
                  y2={padding.top + chartHeight} 
                  stroke="#f3f4f6" 
                  strokeWidth="1"
                />
              </g>
            );
          })}
          
          {/* Chart line */}
          <path 
            d={pathData}
            fill="none" 
            stroke={stroke} 
            strokeWidth="3" 
            strokeLinejoin="round" 
            strokeLinecap="round"
          />
          
          {/* Data points with hover areas */}
          {points.map((point, i) => (
            <g key={i}>
              <circle 
                cx={point.x} 
                cy={point.y} 
                r="4" 
                fill={stroke}
                stroke="white"
                strokeWidth="2"
              />
              {/* Hover area */}
              <circle 
                cx={point.x} 
                cy={point.y} 
                r="12" 
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{`${point.count} items added on ${new Date(point.date).toLocaleDateString()}`}</title>
              </circle>
              {/* Value label on hover */}
              {point.count > 0 && (
                <text 
                  x={point.x} 
                  y={point.y - 8} 
                  textAnchor="middle" 
                  className="text-xs fill-gray-700 font-medium"
                  fontSize="10"
                >
                  {point.count}
                </text>
              )}
            </g>
          ))}
          
          {/* Chart title and axis labels */}
          <text 
            x={padding.left + chartInnerWidth / 2} 
            y={height - 10} 
            textAnchor="middle" 
            className="text-sm fill-gray-600 font-medium"
            fontSize="12"
          >
            Date (Last 7 Days)
          </text>
          
          <text 
            x="15" 
            y={padding.top + chartHeight / 2} 
            textAnchor="middle" 
            className="text-sm fill-gray-600 font-medium"
            fontSize="12"
            transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
          >
            Items Added
          </text>
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
    { 
      label: 'Total Items', 
      value: inventory.totalItems || 0, 
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', 
      link: '/inventory',
      description: 'View all inventory items'
    },
    { 
      label: 'Low Stock', 
      value: inventory.lowStockCount || 0, 
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', 
      link: '/inventory?condition=Low Stock',
      description: 'Items needing restock'
    },
    { 
      label: 'Expired', 
      value: inventory.expiredCount || 0, 
      color: 'bg-red-50 text-red-700 hover:bg-red-100', 
      link: '/inventory?condition=Expired',
      description: 'Expired items requiring attention'
    },
    { 
      label: 'Expiring Soon', 
      value: inventory.expiringSoonCount || 0, 
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100', 
      link: '/inventory?search=expiring',
      description: 'Items expiring within 120 days'
    },
    { 
      label: 'Total Vehicles', 
      value: vehicles.totalVehicles || 0, 
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', 
      link: '/inventory/vehicles',
      description: 'View all vehicles'
    },
    { 
      label: 'Available Vehicles', 
      value: vehicles.availableVehicles || 0, 
      color: 'bg-green-50 text-green-700 hover:bg-green-100', 
      link: '/inventory/vehicles?status=Available',
      description: 'Vehicles ready for use'
    },
    { 
      label: 'Assignments', 
      value: assignments.totalAssignments || 0, 
      color: 'bg-teal-50 text-teal-700 hover:bg-teal-100', 
      link: '/inventory/vehicle-items',
      description: 'View vehicle assignments'
    },
    { 
      label: 'Assigned Qty', 
      value: assignments.totalAssignedQuantity || 0, 
      color: 'bg-sky-50 text-sky-700 hover:bg-sky-100', 
      link: '/inventory/vehicle-items',
      description: 'Total assigned quantities'
    }
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Manager Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of inventory, vehicles, and operations.</p>
        </div>

        {/* KPI Grid - Clickable Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <Link 
              key={index} 
              to={kpi.link}
              className={`rounded-lg border p-4 shadow-sm transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-md ${kpi.color}`}
              title={kpi.description}
            > 
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{kpi.label}</div>
                  <div className="mt-2 text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs opacity-75 mt-1">{kpi.description}</div>
                </div>
                <div className="ml-2 opacity-60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Enhanced Trend Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Inventory Activity Trends</h2>
                <p className="text-sm text-gray-500">Daily items added and removed over the last 7 days</p>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-600">Added</div>
                    <div className="text-lg font-bold text-green-700">
                      +{(trends.itemsAddedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-red-600">Removed</div>
                    <div className="text-lg font-bold text-red-700">
                      -{(trends.itemsRemovedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Items Added Chart */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="bg-white p-2 rounded shadow-sm">
                  <LineChart data={trends.itemsAddedLast7Days || []} height={180} />
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center">
                  <span>📈 Items Added Trend</span>
                </div>
              </div>
              
              {/* Items Removed Chart */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="bg-white p-2 rounded shadow-sm">
                  <LineChart 
                    data={trends.itemsRemovedLast7Days || []} 
                    height={180} 
                    stroke="#dc2626"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center">
                  <span>📉 Items Removed Trend</span>
                </div>
              </div>
            </div>
            
            {/* Detailed Daily Breakdown */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Activity Breakdown</h3>
              
              {/* Added Items */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-green-700 mb-2">📈 Items Added</h4>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {(trends.itemsAddedLast7Days || []).map((d, index) => {
                    const date = new Date(d?.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isHighest = d?.count === Math.max(...(trends.itemsAddedLast7Days || []).map(item => item?.count || 0));
                    
                    return (
                      <div key={index} className={`p-2 rounded text-center ${
                        isToday ? 'bg-green-100 border-2 border-green-300' : 
                        isHighest && d?.count > 0 ? 'bg-green-50 border border-green-300' : 
                        'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className={`font-medium ${isToday ? 'text-green-700' : isHighest && d?.count > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                          +{d?.count || 0}
                        </div>
                        <div className="text-gray-500 text-xs">{dayName}</div>
                        <div className="text-gray-400 text-xs">{d?.date ? d.date.slice(8, 10) : '--'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Removed Items */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-red-700 mb-2">📉 Items Removed</h4>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {(trends.itemsRemovedLast7Days || []).map((d, index) => {
                    const date = new Date(d?.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isHighest = d?.count === Math.max(...(trends.itemsRemovedLast7Days || []).map(item => item?.count || 0));
                    
                    return (
                      <div key={index} className={`p-2 rounded text-center ${
                        isToday ? 'bg-red-100 border-2 border-red-300' : 
                        isHighest && d?.count > 0 ? 'bg-red-50 border border-red-300' : 
                        'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className={`font-medium ${isToday ? 'text-red-700' : isHighest && d?.count > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          -{d?.count || 0}
                        </div>
                        <div className="text-gray-500 text-xs">{dayName}</div>
                        <div className="text-gray-400 text-xs">{d?.date ? d.date.slice(8, 10) : '--'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Comprehensive Statistics */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Summary</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  {/* Added Items Stats */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-green-600 font-medium">Total Added</div>
                    <div className="text-green-800 font-bold">
                      +{(trends.itemsAddedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-green-600 font-medium">Avg Added/Day</div>
                    <div className="text-green-800 font-bold">
                      {((trends.itemsAddedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0) / 7).toFixed(1)}
                    </div>
                  </div>
                  
                  {/* Removed Items Stats */}
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-red-600 font-medium">Total Removed</div>
                    <div className="text-red-800 font-bold">
                      -{(trends.itemsRemovedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0)}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-red-600 font-medium">Avg Removed/Day</div>
                    <div className="text-red-800 font-bold">
                      {((trends.itemsRemovedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0) / 7).toFixed(1)}
                    </div>
                  </div>
                </div>
                
                {/* Net Change */}
                <div className="mt-3 bg-blue-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-medium">Net Inventory Change (7 days)</span>
                    <span className="text-blue-800 font-bold text-lg">
                      {(() => {
                        const added = (trends.itemsAddedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0);
                        const removed = (trends.itemsRemovedLast7Days || []).reduce((sum, d) => sum + (d?.count || 0), 0);
                        const net = added - removed;
                        return net >= 0 ? `+${net}` : `${net}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Peak Day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h2>
            {categories.length > 0 ? (
              <div className="text-sm max-h-96 overflow-y-auto">
                {/* Column Headers */}
                <div className="flex justify-between mb-3 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase sticky top-0 bg-white">
                  <span>Category</span>
                  <span>ITEM types / Quantity</span>
                </div>
                {/* Data Rows */}
                <ul className="space-y-2">
                  {categories.map((cat, index) => (
                    <li key={index} className="flex justify-between py-1 hover:bg-gray-50 px-2 -mx-2 rounded">
                      <span className="font-medium text-gray-700">{cat.category || 'Uncategorized'}</span>
                      <span className="text-gray-600">{cat.items || 0} / {cat.quantity || 0}</span>
                    </li>
                  ))}
                </ul>
                {categories.length > 15 && (
                  <div className="mt-4 text-center text-xs text-gray-500 border-t pt-2">
                    Showing all {categories.length} categories
                  </div>
                )}
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