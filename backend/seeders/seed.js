const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const User = require('../models/User');
const connectDatabase = require('../config/database');

dotenv.config({ path: require('path').join(__dirname, '../config/config.env') });

const seedData = async () => {
  try {
    console.log('DB_URI:', process.env.DB_URI ? 'Found' : 'Not found');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('Starting seed process...');

    // Clear existing data
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Roles with proper permissions
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
        description: 'Senior operational management',
        permissions: [
          'operations_management',
          'incident_command',
          'staff_supervision',
          'training_oversight',
          'equipment_management',
          'report_access',
          'shift_coordination',
          'team_performance_evaluation'
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
          'crew_communication',
          'incident_operations',
          'equipment_usage',
          'basic_reporting',
          'training_participation'
        ],
        level: 6
      },
      {
        name: 'finance_manager',
        displayName: 'Finance Manager',
        description: 'Budget tracking and financial management',
        permissions: [
          'budget_tracking',
          'expense_reporting',
          'financial_analytics',
          'cost_center_management',
          'procurement_oversight',
          'financial_reports',
          'expense_approval'
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
          'maintenance_scheduling',
          'procurement_requests',
          'asset_allocation',
          'inventory_management',
          'equipment_usage_tracking',
          'maintenance_records'
        ],
        level: 5
      },
      {
        name: 'suppliermanager',
        displayName: 'Supplier Manager',
        description: 'Supplier relations and procurement management',
        permissions: [
          'supplier_management',
          'procurement_oversight',
          'vendor_relations',
          'contract_management',
          'supply_chain_coordination',
          'purchase_approval',
          'supplier_evaluation',
          'cost_negotiation'
        ],
        level: 5
      },
      {
        name: 'record_manager',
        displayName: 'Record Manager',
        description: 'Documentation and compliance management',
        permissions: [
          'incident_documentation',
          'report_generation',
          'data_archival',
          'compliance_tracking',
          'record_management',
          'document_access',
          'data_entry',
          'archive_management'
        ],
        level: 5
      },
      {
        name: 'prevention_manager',
        displayName: 'Prevention Manager',
        description: 'Fire safety and prevention programs',
        permissions: [
          'fire_safety_inspections',
          'community_outreach',
          'risk_assessments',
          'prevention_campaigns',
          'prevention_management',
          'inspection_scheduling',
          'safety_programs',
          'code_enforcement'
        ],
        level: 5
      },
      {
        name: 'training_session_manager',
        displayName: 'Training Session Manager',
        description: 'Training program coordination and management',
        permissions: [
          'training_program_creation',
          'session_scheduling',
          'certificate_generation',
          'qr_attendance_tracking',
          'training_compliance',
          'training_management',
          'curriculum_development',
          'progress_tracking'
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

    const createdRoles = await Role.insertMany(roles);
    console.log('Created roles:', createdRoles.map(r => r.name).join(', '));

    // Initial admin user
    const adminRole = createdRoles.find(role => role.name === 'admin');

    const adminUser = await User.create({
      name: 'System Administrator',
      username: 'admin',  // added
      email: 'admin@fire.local',
      password: 'admin123',
      roles: [adminRole._id],
      phoneNumber: '0771234567',
      emergencyContact: {  // added
        name: 'Admin Emergency',
        relationship: 'None',
        phoneNumber: '0771234567',
        email: 'admin.emergency@fire.local'
      }
    });

    console.log('Created admin user:', adminUser.email);

    // Test users for each role
    const testUsers = [
      { 
        name: 'Chief Financial Officer', 
        email: 'cfo@fire.local', 
        password: 'cfo123', 
        roleNames: ['cfo'],
        username: 'cfo123', // added
        phoneNumber: '0712345678',
        address: {
          street: '123 Finance Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Sarah Johnson',
          relationship: 'Spouse',
          phoneNumber: '0712345678',
          email: 'sarah.johnson@email.com'
        },
        personalInfo: {
          dateOfBirth: '1980-05-15',
          gender: 'male',
          bloodType: 'A+',
          height: 175,
          weight: 75
        }
      },
      { 
        name: 'John Smith', 
        email: 'officer@fire.local', 
        password: 'officer123', 
        roleNames: ['1st_class_officer'],
        username: 'officer', // added
        phoneNumber: '0771234567',
        address: {
          street: '456 Officer St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Mary Smith',
          relationship: 'Wife',
          phoneNumber: '0712345678',
          email: 'mary.smith@email.com'
        },
        personalInfo: {
          dateOfBirth: '1985-08-22',
          gender: 'male',
          bloodType: 'O+',
          height: 180,
          weight: 80
        }
      },
      { 
        name: 'Captain Mike Johnson',
        username: 'officer', 
        email: 'captain@fire.local', 
        password: 'captain123', 
        roleNames: ['captain'],
        phoneNumber: '0712345678',
        address: {
          street: '789 Captain Dr',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Lisa Johnson',
          relationship: 'Sister',
          phoneNumber: '0712345678',
          email: 'lisa.johnson@email.com'
        },
        personalInfo: {
          dateOfBirth: '1982-12-10',
          gender: 'male',
          bloodType: 'B+',
          height: 178,
          weight: 82
        }
      },
      { 
        name: 'Lieutenant Sarah Wilson', 
        username: 'officer',
        email: 'lieutenant@fire.local', 
        password: 'lieutenant123', 
        roleNames: ['lieutenant'],
        phoneNumber: '0712345678',
        address: {
          street: '321 Lieutenant Ln',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704',
          country: 'USA'
        },
        emergencyContact: {
          name: 'David Wilson',
          relationship: 'Husband',
          phoneNumber: '0712345678',
          email: 'david.wilson@email.com'
        },
        personalInfo: {
          dateOfBirth: '1988-03-18',
          gender: 'female',
          bloodType: 'AB+',
          height: 165,
          weight: 60
        }
      },
      { 
        name: 'Jane Doe', 
        username: 'officer',
        email: 'finance@fire.local', 
        password: 'finance123', 
        roleNames: ['finance_manager'],
        phoneNumber: '0712345678',
        address: {
          street: '654 Finance Blvd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62705',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Robert Doe',
          relationship: 'Father',
          phoneNumber: '0712345678',
          email: 'robert.doe@email.com'
        },
        personalInfo: {
          dateOfBirth: '1987-07-25',
          gender: 'female',
          bloodType: 'A-',
          height: 162,
          weight: 58
        }
      },
      { 
        name: 'Tom Brown', 
        username: 'officer',
        email: 'inventory@fire.local', 
        password: 'inventory123', 
        roleNames: ['inventory_manager'],
        phoneNumber: '0712345678',
        address: {
          street: '987 Inventory Rd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62706',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jennifer Brown',
          relationship: 'Daughter',
          phoneNumber: '0712345678',
          email: 'jennifer.brown@email.com'
        },
        personalInfo: {
          dateOfBirth: '1983-11-30',
          gender: 'male',
          bloodType: 'O-',
          height: 175,
          weight: 78
        }
      },
      { 
        name: 'Sarah Thompson', 
        username: 'officer',
        email: 'supplier@fire.local', 
        password: 'supplier123', 
        roleNames: ['suppliermanager'],
        phoneNumber: '0712345678',
        address: {
          street: '456 Supplier Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62707',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Michael Thompson',
          relationship: 'Husband',
          phoneNumber: '0712345678',
          email: 'michael.thompson@email.com'
        },
        personalInfo: {
          dateOfBirth: '1982-04-18',
          gender: 'female',
          bloodType: 'B+',
          height: 168,
          weight: 62
        }
      },
      { 
        name: 'Lisa Anderson', 
        username: 'officer',
        email: 'records@fire.local', 
        password: 'records123', 
        roleNames: ['record_manager'],
        phoneNumber: '0712345678',
        address: {
          street: '147 Records Way',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62707',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Michael Anderson',
          relationship: 'Brother',
          phoneNumber: '0712345678',
          email: 'michael.anderson@email.com'
        },
        personalInfo: {
          dateOfBirth: '1986-04-12',
          gender: 'female',
          bloodType: 'B-',
          height: 168,
          weight: 65
        }
      },
      { 
        name: 'David Clark', 
        username: 'officer',
        email: 'prevention@fire.local', 
        password: 'prevention123', 
        roleNames: ['prevention_manager'],
        phoneNumber: '0712345678',
        address: {
          street: '258 Prevention Pl',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62708',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Emily Clark',
          relationship: 'Wife',
          phoneNumber: '0712345678',
          email: 'emily.clark@email.com'
        },
        personalInfo: {
          dateOfBirth: '1981-09-05',
          gender: 'male',
          bloodType: 'AB-',
          height: 182,
          weight: 85
        }
      },
      { 
        name: 'Maria Garcia', 
        username: 'officer',
        email: 'training@fire.local', 
        password: 'training123', 
        roleNames: ['training_session_manager'],
        phoneNumber: '0712345678',
        address: {
          street: '369 Training Trl',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62709',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Carlos Garcia',
          relationship: 'Husband',
          phoneNumber: '0712345678',
          email: 'carlos.garcia@email.com'
        },
        personalInfo: {
          dateOfBirth: '1984-01-20',
          gender: 'female',
          bloodType: 'A+',
          height: 170,
          weight: 62
        }
      },
      { 
        name: 'Commander Robert Lee', 
        username: 'officer',
        email: 'commander@fire.local', 
        password: 'commander123', 
        roleNames: ['incident_commander'],
        phoneNumber: '0712345678',
        address: {
          street: '741 Commander Ct',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62710',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Patricia Lee',
          relationship: 'Mother',
          phoneNumber: '0712345678',
          email: 'patricia.lee@email.com'
        },
        personalInfo: {
          dateOfBirth: '1978-06-14',
          gender: 'male',
          bloodType: 'O+',
          height: 185,
          weight: 88
        }
      },
      { 
        name: 'Engineer James Wilson', 
        username: 'officer',
        email: 'engineer@fire.local', 
        password: 'engineer123', 
        roleNames: ['driver_engineer'],
        phoneNumber: '0712345678',
        address: {
          street: '852 Engineer Est',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62711',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Rachel Wilson',
          relationship: 'Sister',
          phoneNumber: '0712345678',
          email: 'rachel.wilson@email.com'
        },
        personalInfo: {
          dateOfBirth: '1989-02-28',
          gender: 'male',
          bloodType: 'B+',
          height: 177,
          weight: 76
        }
      },
      { 
        name: 'Fire Fighter Alex Turner', 
        username: 'officer',
        email: 'fighter@fire.local', 
        password: 'fighter123', 
        roleNames: ['fighter'],
        phoneNumber: '0712345678',
        address: {
          street: '963 Fighter Fwy',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62712',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jordan Turner',
          relationship: 'Partner',
          phoneNumber: '0712345678',
          email: 'jordan.turner@email.com'
        },
        personalInfo: {
          dateOfBirth: '1990-10-08',
          gender: 'other',
          bloodType: 'A-',
          height: 172,
          weight: 70
        }
      }
    ];

   for (const userData of testUsers) {
      const userRoles = createdRoles.filter(role =>
        userData.roleNames.includes(role.name)
      );

      await User.create({
        name: userData.name,
        username: userData.username, // added
        email: userData.email,
        password: userData.password,
        roles: userRoles.map(role => role._id),
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        emergencyContact: userData.emergencyContact,
        personalInfo: userData.personalInfo
      });
    }

    console.log('Created test users:', testUsers.map(u => u.email).join(', '));

    console.log('\n Seed completed successfully!');
    console.log('\n Login Credentials:');
    console.log('Admin: admin@fire.local / admin123');
    console.log('CFO: cfo@fire.local / cfo123');
    console.log('Officer: officer@fire.local / officer123');
    console.log('Captain: captain@fire.local / captain123');
    console.log('Lieutenant: lieutenant@fire.local / lieutenant123');
    console.log('Finance: finance@fire.local / finance123');
    console.log('Inventory: inventory@fire.local / inventory123');
    console.log('Supplier: supplier@fire.local / supplier123');
    console.log('Records: records@fire.local / records123');
    console.log('Prevention: prevention@fire.local / prevention123');
    console.log('Training: training@fire.local / training123');
    console.log('Commander: commander@fire.local / commander123');
    console.log('Engineer: engineer@fire.local / engineer123');
    console.log('Fighter: fighter@fire.local / fighter123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
};

seedData();