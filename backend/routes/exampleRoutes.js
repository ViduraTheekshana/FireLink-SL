const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  requirePermission, 
  requireAnyPermission, 
  requireAllPermissions,
  requireMinimumLevel,
  requireRole,
  requireAnyRole,
  permissions,
  levels 
} = require('../middlewares/roleMiddleware');

// Example controller functions (you would replace these with your actual controllers)
const exampleController = {
  // User Management Routes
  getAllUsers: (req, res) => res.json({ message: 'Get all users' }),
  createUser: (req, res) => res.json({ message: 'Create user' }),
  updateUser: (req, res) => res.json({ message: 'Update user' }),
  deleteUser: (req, res) => res.json({ message: 'Delete user' }),
  
  // Financial Routes
  getFinancialReports: (req, res) => res.json({ message: 'Get financial reports' }),
  createBudget: (req, res) => res.json({ message: 'Create budget' }),
  approveExpense: (req, res) => res.json({ message: 'Approve expense' }),
  
  // Training Routes
  getTrainingSessions: (req, res) => res.json({ message: 'Get training sessions' }),
  createTrainingSession: (req, res) => res.json({ message: 'Create training session' }),
  generateCertificate: (req, res) => res.json({ message: 'Generate certificate' }),
  
  // Prevention Routes
  getInspections: (req, res) => res.json({ message: 'Get inspections' }),
  createInspection: (req, res) => res.json({ message: 'Create inspection' }),
  scheduleOutreach: (req, res) => res.json({ message: 'Schedule outreach' }),
  
  // Records Routes
  getRecords: (req, res) => res.json({ message: 'Get records' }),
  createRecord: (req, res) => res.json({ message: 'Create record' }),
  generateReport: (req, res) => res.json({ message: 'Generate report' }),
  
  // Operations Routes
  getIncidents: (req, res) => res.json({ message: 'Get incidents' }),
  createIncident: (req, res) => res.json({ message: 'Create incident' }),
  commandIncident: (req, res) => res.json({ message: 'Command incident' })
};

// USER MANAGEMENT ROUTES

// Get all users - Admin only
router.get('/users', 
  protect, 
  requireRole('admin'),
  exampleController.getAllUsers
);

// Create user - Admin or CFO
router.post('/users', 
  protect, 
  requireAnyRole(['admin', 'cfo']),
  exampleController.createUser
);

// Update user - Admin or user management permission
router.put('/users/:id', 
  protect, 
  requireAnyPermission(['user_management', 'all_access']),
  exampleController.updateUser
);

// Delete user - Admin only
router.delete('/users/:id', 
  protect, 
  requireRole('admin'),
  exampleController.deleteUser
);

// FINANCIAL ROUTES

// Get financial reports - CFO, Finance Manager, Admin
router.get('/financial/reports', 
  protect, 
  requireAnyPermission(permissions.FINANCIAL_ACCESS),
  exampleController.getFinancialReports
);

// Create budget - CFO, Finance Manager
router.post('/financial/budget', 
  protect, 
  requireAnyRole(['cfo', 'finance_manager']),
  exampleController.createBudget
);

// Approve expense - CFO only
router.post('/financial/approve', 
  protect, 
  requirePermission('expense_approval'),
  exampleController.approveExpense
);

// ============================================================================
// TRAINING ROUTES
// ============================================================================

// Get training sessions - Anyone with training access
router.get('/training/sessions', 
  protect, 
  requireAnyPermission(permissions.TRAINING_ACCESS),
  exampleController.getTrainingSessions
);

// Create training session - Training Manager, Admin
router.post('/training/sessions', 
  protect, 
  requireAnyRole(['training_session_manager', 'admin']),
  exampleController.createTrainingSession
);

// Generate certificate - Training Manager only
router.post('/training/certificate', 
  protect, 
  requirePermission('certificate_generation'),
  exampleController.generateCertificate
);

// ============================================================================
// PREVENTION ROUTES
// ============================================================================

// Get inspections - Prevention Manager, Admin
router.get('/prevention/inspections', 
  protect, 
  requireAnyPermission(permissions.PREVENTION_ACCESS),
  exampleController.getInspections
);

// Create inspection - Prevention Manager
router.post('/prevention/inspections', 
  protect, 
  requireRole('prevention_manager'),
  exampleController.createInspection
);

// Schedule outreach - Prevention Manager, Admin
router.post('/prevention/outreach', 
  protect, 
  requireAnyPermission(['community_outreach', 'all_access']),
  exampleController.scheduleOutreach
);

// ============================================================================
// RECORDS ROUTES
// ============================================================================

// Get records - Record Manager, Admin
router.get('/records', 
  protect, 
  requireAnyPermission(permissions.RECORDS_ACCESS),
  exampleController.getRecords
);

// Create record - Record Manager, Admin
router.post('/records', 
  protect, 
  requireAnyRole(['record_manager', 'admin']),
  exampleController.createRecord
);

// Generate report - Record Manager, Admin
router.post('/records/report', 
  protect, 
  requirePermission('report_generation'),
  exampleController.generateReport
);

// ============================================================================
// OPERATIONS ROUTES
// ============================================================================

// Get incidents - Anyone with operations access
router.get('/operations/incidents', 
  protect, 
  requireAnyPermission(permissions.OPERATIONS_ACCESS),
  exampleController.getIncidents
);

// Create incident - Anyone with operations access
router.post('/operations/incidents', 
  protect, 
  requireAnyPermission(['incident_operations', 'all_access']),
  exampleController.createIncident
);

// Command incident - Incident Commander, Admin, Officer
router.post('/operations/command', 
  protect, 
  requireAnyRole(['incident_commander', 'admin', '1st_class_officer']),
  exampleController.commandIncident
);

// ============================================================================
// LEVEL-BASED ACCESS ROUTES
// ============================================================================

// High-level operations - Level 8+ (Commander, Officer, Admin, CFO)
router.get('/high-level', 
  protect, 
  requireMinimumLevel(levels.COMMANDER),
  (req, res) => res.json({ message: 'High-level access granted' })
);

// Management operations - Level 5+ (Managers and above)
router.get('/management', 
  protect, 
  requireMinimumLevel(levels.MANAGER),
  (req, res) => res.json({ message: 'Management access granted' })
);

// ============================================================================
// COMPLEX PERMISSION ROUTES
// ============================================================================

// Route requiring multiple permissions
router.post('/complex-operation', 
  protect, 
  requireAllPermissions(['financial_management', 'inventory_management']),
  (req, res) => res.json({ message: 'Complex operation access granted' })
);

// Route requiring any of multiple roles
router.get('/multi-role-access', 
  protect, 
  requireAnyRole(['admin', 'cfo', '1st_class_officer']),
  (req, res) => res.json({ message: 'Multi-role access granted' })
);

module.exports = router;
