require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const CostCenter = require('../models/CostCenter');
const Timesheet = require('../models/Timesheet');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await CostCenter.deleteMany();
    await Timesheet.deleteMany();

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@timetrack.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Management',
      position: 'System Administrator',
      hourlyRate: 100
    });

    console.log('Admin user created');

    // Create employees
    const employees = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@timetrack.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Engineering',
        position: 'Senior Developer',
        hourlyRate: 75
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@timetrack.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Engineering',
        position: 'Frontend Developer',
        hourlyRate: 65
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@timetrack.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Design',
        position: 'UI/UX Designer',
        hourlyRate: 60
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@timetrack.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Engineering',
        position: 'Backend Developer',
        hourlyRate: 70
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@timetrack.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'QA',
        position: 'QA Engineer',
        hourlyRate: 55
      }
    ]);

    console.log('Employees created');

    // Create cost centers
    const costCenters = await CostCenter.create([
      {
        name: 'Product Development',
        code: 'CC-PROD',
        description: 'Product development and innovation',
        budget: 500000,
        department: 'Engineering',
        manager: admin._id
      },
      {
        name: 'Client Services',
        code: 'CC-CLIENT',
        description: 'Client projects and services',
        budget: 300000,
        department: 'Services',
        manager: admin._id
      },
      {
        name: 'Research & Development',
        code: 'CC-RND',
        description: 'Research and development initiatives',
        budget: 200000,
        department: 'Engineering',
        manager: admin._id
      },
      {
        name: 'Marketing',
        code: 'CC-MKT',
        description: 'Marketing and promotional activities',
        budget: 150000,
        department: 'Marketing',
        manager: admin._id
      }
    ]);

    console.log('Cost centers created');

    // Create projects
    const projects = await Project.create([
      {
        name: 'E-Commerce Platform',
        code: 'PROJ-ECOM',
        description: 'Building a modern e-commerce platform',
        costCenter: costCenters[0]._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 200000,
        status: 'active',
        assignedEmployees: [employees[0]._id, employees[1]._id, employees[3]._id]
      },
      {
        name: 'Mobile App Development',
        code: 'PROJ-MOBILE',
        description: 'Cross-platform mobile application',
        costCenter: costCenters[0]._id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-10-31'),
        budget: 150000,
        status: 'active',
        assignedEmployees: [employees[0]._id, employees[1]._id, employees[2]._id]
      },
      {
        name: 'Client Portal',
        code: 'PROJ-PORTAL',
        description: 'Customer self-service portal',
        costCenter: costCenters[1]._id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        budget: 100000,
        status: 'active',
        assignedEmployees: [employees[1]._id, employees[3]._id, employees[4]._id]
      },
      {
        name: 'AI Integration',
        code: 'PROJ-AI',
        description: 'Integrating AI capabilities into products',
        costCenter: costCenters[2]._id,
        startDate: new Date('2024-04-01'),
        budget: 180000,
        status: 'planning',
        assignedEmployees: [employees[0]._id, employees[3]._id]
      },
      {
        name: 'Website Redesign',
        code: 'PROJ-WEB',
        description: 'Company website redesign',
        costCenter: costCenters[3]._id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        budget: 50000,
        status: 'completed',
        assignedEmployees: [employees[2]._id]
      }
    ]);

    console.log('Projects created');

    // Update employees with assigned projects
    await User.updateMany(
      { _id: employees[0]._id },
      { assignedProjects: [projects[0]._id, projects[1]._id, projects[3]._id] }
    );
    await User.updateMany(
      { _id: employees[1]._id },
      { assignedProjects: [projects[0]._id, projects[1]._id, projects[2]._id] }
    );
    await User.updateMany(
      { _id: employees[2]._id },
      { assignedProjects: [projects[1]._id, projects[4]._id] }
    );
    await User.updateMany(
      { _id: employees[3]._id },
      { assignedProjects: [projects[0]._id, projects[2]._id, projects[3]._id] }
    );
    await User.updateMany(
      { _id: employees[4]._id },
      { assignedProjects: [projects[2]._id] }
    );

    // Create sample timesheets
    const timesheets = [];
    const today = new Date();
    
    // Generate timesheets for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // John Doe timesheets
      timesheets.push({
        employee: employees[0]._id,
        project: projects[0]._id,
        date: new Date(date),
        hours: Math.floor(Math.random() * 4) + 4, // 4-8 hours
        description: 'Working on backend API development',
        status: i < 5 ? 'submitted' : 'approved'
      });

      // Jane Smith timesheets
      timesheets.push({
        employee: employees[1]._id,
        project: projects[1]._id,
        date: new Date(date),
        hours: Math.floor(Math.random() * 4) + 4,
        description: 'Developing UI components',
        status: i < 5 ? 'submitted' : 'approved'
      });

      // Mike Johnson timesheets
      if (i % 2 === 0) {
        timesheets.push({
          employee: employees[2]._id,
          project: projects[1]._id,
          date: new Date(date),
          hours: Math.floor(Math.random() * 4) + 4,
          description: 'Creating design mockups and prototypes',
          status: i < 5 ? 'draft' : 'approved'
        });
      }

      // Sarah Williams timesheets
      timesheets.push({
        employee: employees[3]._id,
        project: projects[2]._id,
        date: new Date(date),
        hours: Math.floor(Math.random() * 4) + 4,
        description: 'Database optimization and API development',
        status: i < 5 ? 'submitted' : 'approved'
      });

      // David Brown timesheets
      if (i % 3 === 0) {
        timesheets.push({
          employee: employees[4]._id,
          project: projects[2]._id,
          date: new Date(date),
          hours: Math.floor(Math.random() * 4) + 4,
          description: 'Testing and quality assurance',
          status: 'approved'
        });
      }
    }

    await Timesheet.create(timesheets);

    console.log('Timesheets created');
    console.log('\n=== Seed Data Summary ===');
    console.log(`Admin: admin@timetrack.com / Admin@123`);
    console.log(`Employees: ${employees.length}`);
    console.log(`Cost Centers: ${costCenters.length}`);
    console.log(`Projects: ${projects.length}`);
    console.log(`Timesheets: ${timesheets.length}`);
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(() => seedData());
