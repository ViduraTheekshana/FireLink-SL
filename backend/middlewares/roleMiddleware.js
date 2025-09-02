const User = require('../models/User');
const Role = require('../models/Role');

// Check if user has specific permission
const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('all_access');
};

// Check if user has any of the required permissions
const hasAnyPermission = (userPermissions, requiredPermissions) => {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission) || userPermissions.includes('all_access')
  );
};

// Check if user has all required permissions
const hasAllPermissions = (userPermissions, requiredPermissions) => {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission) || userPermissions.includes('all_access')
  );
};

// Check if user has minimum role level
const hasMinimumLevel = (userLevel, requiredLevel) => {
  return userLevel >= requiredLevel;
};

// Get user permissions from roles
const getUserPermissions = async (userId) => {
  try {
    const user = await User.findById(userId).populate('roles');
    if (!user) return [];
    
    const permissions = new Set();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => permissions.add(permission));
    });
    
    return Array.from(permissions);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

// Get user's highest role level
const getUserLevel = async (userId) => {
  try {
    const user = await User.findById(userId).populate('roles');
    if (!user || !user.roles.length) return 0;
    
    return Math.max(...user.roles.map(role => role.level));
  } catch (error) {
    console.error('Error getting user level:', error);
    return 0;
  }
};

// Middleware to check specific permission
exports.requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userPermissions = await getUserPermissions(req.user._id);
      
      if (!hasPermission(userPermissions, permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

// Middleware to check any of the required permissions
exports.requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userPermissions = await getUserPermissions(req.user._id);
      
      if (!hasAnyPermission(userPermissions, permissions)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required one of: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

// Middleware to check all required permissions
exports.requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userPermissions = await getUserPermissions(req.user._id);
      
      if (!hasAllPermissions(userPermissions, permissions)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required all: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

// Middleware to check minimum role level
exports.requireMinimumLevel = (level) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userLevel = await getUserLevel(req.user._id);
      
      if (!hasMinimumLevel(userLevel, level)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required minimum level: ${level}`
        });
      }

      next();
    } catch (error) {
      console.error('Level check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during level check'
      });
    }
  };
};

// Middleware to check specific role
exports.requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(req.user._id).populate('roles');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasRole = user.roles.some(role => role.name === roleName);
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roleName}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during role check'
      });
    }
  };
};

// Middleware to check any of the required roles
exports.requireAnyRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(req.user._id).populate('roles');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasAnyRole = user.roles.some(role => roleNames.includes(role.name));
      
      if (!hasAnyRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required one of roles: ${roleNames.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during role check'
      });
    }
  };
};

// Predefined permission groups for common operations
exports.permissions = {
  // User management
  USER_MANAGEMENT: ['user_management', 'all_access'],
  
  // Financial operations
  FINANCIAL_ACCESS: ['financial_reports', 'budget_management', 'financial_analytics', 'all_access'],
  FINANCIAL_ADMIN: ['financial_management', 'expense_approval', 'cost_center_management', 'all_access'],
  
  // Inventory operations
  INVENTORY_ACCESS: ['equipment_tracking', 'supply_management', 'inventory_management', 'all_access'],
  INVENTORY_ADMIN: ['procurement_requests', 'asset_allocation', 'maintenance_scheduling', 'all_access'],
  
  // Training operations
  TRAINING_ACCESS: ['training_participation', 'training_management', 'all_access'],
  TRAINING_ADMIN: ['training_program_creation', 'session_scheduling', 'certificate_generation', 'all_access'],
  
  // Records operations
  RECORDS_ACCESS: ['record_management', 'document_access', 'all_access'],
  RECORDS_ADMIN: ['incident_documentation', 'report_generation', 'data_archival', 'all_access'],
  
  // Prevention operations
  PREVENTION_ACCESS: ['prevention_management', 'fire_safety_inspections', 'all_access'],
  PREVENTION_ADMIN: ['community_outreach', 'risk_assessments', 'prevention_campaigns', 'all_access'],
  
  // Operations
  OPERATIONS_ACCESS: ['incident_operations', 'equipment_usage', 'all_access'],
  OPERATIONS_ADMIN: ['operations_management', 'incident_command', 'emergency_operations', 'all_access'],
  
  // System administration
  SYSTEM_ADMIN: ['system_configuration', 'role_management', 'all_access']
};

// Predefined role levels
exports.levels = {
  ADMIN: 10,
  CFO: 9,
  COMMANDER: 8,
  OFFICER: 8,
  CAPTAIN: 7,
  LIEUTENANT: 6,
  MANAGER: 5,
  ENGINEER: 4,
  FIGHTER: 3
};
