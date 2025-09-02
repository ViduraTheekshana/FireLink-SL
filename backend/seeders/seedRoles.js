const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config({ path: './config/config.env' });

const roles = [
  {
    name: 'admin',
    displayName: 'System Administrator',
    description: 'Full system access and administration',
    permissions: [
      'all_access',
      'user_management',
      'role_management',
      'system_configuration',
      'financial_management',
      'operations_management',
      'training_management',
      'inventory_management',
      'prevention_management',
      'record_management',
      'incident_management',
      'shift_management',
      'vehicle_management',
      'equipment_management',
      'report_generation',
      'data_analytics'
    ],
    level: 10
  },
  {
    name: 'cfo',
    displayName: 'Chief Financial Officer',
    description: 'Financial oversight and budget management',
    permissions: [
      'financial_reports',
      'budget_management',
      'equipment_cost_analysis',
      'personnel_cost_management',
      'department_financial_oversight',
      'expense_approval',
      'financial_analytics',
      'cost_center_management'
    ],
    level: 9
  },
  {
    name: '1st_class_officer',
    displayName: 'First Class Officer',
    description: 'Senior operational management with user management capabilities',
    permissions: [
      'operations_management',
      'incident_command',
      'staff_supervision',
      'training_oversight',
      'equipment_management',
      'report_access',
      'shift_coordination',
      'team_performance_evaluation',
      'user_management',
      'user_creation',
      'user_update',
      'user_deletion',
      'role_assignment'
    ],
    level: 8
  },
  {
    name: 'captain',
    displayName: 'Captain',
    description: 'Crew supervision and shift coordination',
    permissions: [
      'crew_supervision',
      'shift_coordination',
      'vehicle_assignments',
      'team_performance_evaluation',
      'incident_operations',
      'equipment_usage',
      'basic_reporting',
      'training_participation'
    ],
    level: 7
  },
  {
    name: 'lieutenant',
    displayName: 'Lieutenant (Team Leader)',
    description: 'Small team supervision and task assignments',
    permissions: [
      'team_supervision',
      'task_assignments',
      'safety_compliance',
      'incident_operations',
      'equipment_usage',
      'basic_reporting',
      'training_participation',
      'team_performance_evaluation'
    ],
    level: 6
  },
  {
    name: 'finance_manager',
    displayName: 'Finance Manager',
    description: 'Budget tracking and financial reporting',
    permissions: [
      'financial_reports',
      'budget_tracking',
      'expense_reporting',
      'financial_analytics',
      'cost_analysis',
      'budget_management',
      'expense_approval',
      'financial_documentation'
    ],
    level: 6
  },
  {
    name: 'inventory_manager',
    displayName: 'Inventory Manager',
    description: 'Equipment and supply management',
    permissions: [
      'equipment_tracking',
      'supply_management',
      'inventory_management',
      'procurement_requests',
      'asset_allocation',
      'maintenance_scheduling',
      'equipment_status',
      'inventory_reports'
    ],
    level: 5
  },
  {
    name: 'record_manager',
    displayName: 'Record Manager',
    description: 'Documentation and record keeping',
    permissions: [
      'record_management',
      'document_access',
      'incident_documentation',
      'report_generation',
      'data_archival',
      'record_retrieval',
      'document_organization',
      'compliance_reporting'
    ],
    level: 5
  },
  {
    name: 'prevention_manager',
    displayName: 'Prevention Manager',
    description: 'Fire safety and prevention programs',
    permissions: [
      'prevention_management',
      'fire_safety_inspections',
      'community_outreach',
      'risk_assessments',
      'prevention_campaigns',
      'safety_education',
      'inspection_reports',
      'prevention_planning'
    ],
    level: 5
  },
  {
    name: 'training_session_manager',
    displayName: 'Training Session Manager',
    description: 'Training program coordination',
    permissions: [
      'training_management',
      'training_program_creation',
      'session_scheduling',
      'certificate_generation',
      'training_participation',
      'progress_tracking',
      'training_reports',
      'skill_assessment'
    ],
    level: 5
  },
  {
    name: 'incident_commander',
    displayName: 'Incident Commander',
    description: 'Emergency scene management and coordination',
    permissions: [
      'emergency_scene_management',
      'strategic_decision_making',
      'inter_agency_coordination',
      'resource_allocation',
      'incident_command',
      'emergency_operations',
      'scene_safety',
      'command_communications'
    ],
    level: 8
  },
  {
    name: 'driver_engineer',
    displayName: 'Driver/Engineer (Pump Operator)',
    description: 'Vehicle operation and technical support',
    permissions: [
      'vehicle_operation',
      'equipment_maintenance',
      'water_supply_management',
      'technical_support',
      'vehicle_maintenance',
      'equipment_usage',
      'basic_reporting',
      'training_participation'
    ],
    level: 4
  },
  {
    name: 'fighter',
    displayName: 'Fire Fighter',
    description: 'Front-line fire fighter with basic system access',
    permissions: [
      'incident_operations',
      'equipment_usage',
      'basic_reporting',
      'training_participation',
      'shift_management',
      'team_assignments',
      'equipment_status_check',
      'incident_report_submission'
    ],
    level: 3
  }
];

const seedRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Create roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`Created ${createdRoles.length} roles:`);
    createdRoles.forEach(role => {
      console.log(`- ${role.name} (${role.displayName})`);
    });

    console.log('Role seeding completed successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedRoles();
}

module.exports = seedRoles;
