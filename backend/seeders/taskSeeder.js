import { sequelize, Task } from '../models/index.js';

// Staff members for each department
const spaStaff = [
  'Maria Santos', 'Juan Cruz', 'Ana Reyes', 'Carlos Garcia', 'Sofia Mendoza',
  'Miguel Torres', 'Isabella Flores', 'Rafael Morales', 'Camila Ramos', 'Diego Castillo'
];

const receptionStaff = [
  'Sarah Wilson', 'Mark Johnson', 'Emily Davis', 'James Brown', 'Lisa Anderson',
  'Michael Taylor', 'Jennifer Martinez', 'David Lee', 'Amanda White', 'Robert Harris'
];

const restaurantStaff = [
  'Brooklyn Simons', 'Rohit Koli', 'Jerome Bell', 'Joy Williams', 'Kenelli Smith',
  'Kevin Macel', 'Dianne Rusel', 'Marvin McKiney', 'Loren Jenkins', 'David Smith'
];

const barStaff = [
  'Kevin Macel', 'Alex Thompson', 'Sam Rodriguez', 'Chris Martinez', 'Jordan Lee',
  'Taylor Brown', 'Casey Wilson', 'Morgan Davis', 'Riley Johnson', 'Quinn Anderson'
];

const roomServiceStaff = [
  'John Doe', 'Jane Smith', 'Mike Johnson', 'Patricia Garcia', 'Robert Martinez',
  'Linda Brown', 'William Davis', 'Barbara Miller', 'Richard Wilson', 'Susan Moore'
];

// Helper function to get random staff members
function getRandomStaff(staffList, count) {
  const shuffled = [...staffList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to format staff names for display
function formatStaffNames(staffArray) {
  if (staffArray.length === 0) return '';
  if (staffArray.length === 1) return staffArray[0];
  if (staffArray.length === 2) return `${staffArray[0]} & ${staffArray[1]}`;
  // For 3+ staff, use first name + "& others" or list all
  return staffArray.slice(0, 2).join(', ') + ' & ' + staffArray.slice(2).map(s => s.split(' ')[0]).join(', ');
}

// Helper function to add days to date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate Spa tasks for a single day
function generateSpaTasks(date) {
  const tasks = [];
  const spaRooms = [
    'Rest Room No: 01',
    'Rest Room No: 02',
    'Rest Room No: 03',
    'Rest Room No: 04'
  ];

  spaRooms.forEach((roomName, index) => {
    // Closed period: 6pm (18:00) to 7:59am (07:59)
    tasks.push({
      title: 'Closed',
      department: 'spa',
      itemName: roomName,
      startTime: '18:00',
      endTime: '07:59',
      date: formatDate(date),
      status: 'closed',
      assignedStaff: null,
    });

    // Morning shift: 8am to 12noon (2 random staff)
    const morningStaff = getRandomStaff(spaStaff, 2);
    tasks.push({
      title: formatStaffNames(morningStaff),
      department: 'spa',
      itemName: roomName,
      startTime: '08:00',
      endTime: '12:00',
      date: formatDate(date),
      status: 'booked',
      assignedStaff: morningStaff.join(', '),
    });

    // Closed for lunch: 12:00 to 13:00 (1 hour break)
    tasks.push({
      title: 'Closed',
      department: 'spa',
      itemName: roomName,
      startTime: '12:00',
      endTime: '13:00',
      date: formatDate(date),
      status: 'closed',
      assignedStaff: null,
    });

    // Afternoon shift: 1pm to 5pm (2 random staff, different from morning)
    const afternoonStaff = getRandomStaff(
      spaStaff.filter(s => !morningStaff.includes(s)),
      2
    );
    tasks.push({
      title: formatStaffNames(afternoonStaff.length > 0 ? afternoonStaff : getRandomStaff(spaStaff, 2)),
      department: 'spa',
      itemName: roomName,
      startTime: '13:00',
      endTime: '17:00',
      date: formatDate(date),
      status: 'booked',
      assignedStaff: (afternoonStaff.length > 0 ? afternoonStaff : getRandomStaff(spaStaff, 2)).join(', '),
    });
  });

  return tasks;
}

// Generate Reception/Front Desk tasks for a single day
function generateReceptionTasks(date) {
  const tasks = [];
  
  // Front desk operates 24/7 with 2 people swapping shifts
  // Morning: 6am - 12noon
  // Noon: 12noon - 6pm
  // Night: 6pm - 12midnight
  // Midnight: 12midnight - 6am

  const shifts = [
    { name: 'Morning', startTime: '06:00', endTime: '12:00' },
    { name: 'Noon', startTime: '12:00', endTime: '18:00' },
    { name: 'Night', startTime: '18:00', endTime: '00:00' },
    { name: 'Midnight', startTime: '00:00', endTime: '06:00' },
  ];

  shifts.forEach((shift, index) => {
    // Rotate staff so different people work different shifts
    // Calculate days since year start for rotation
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const daysSinceYearStart = Math.floor((date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const staffIndex = (daysSinceYearStart + index) % receptionStaff.length;
    const staff1 = receptionStaff[staffIndex];
    const staff2 = receptionStaff[(staffIndex + 1) % receptionStaff.length];
    
    // Handle midnight shift - it starts at 00:00 and ends at 06:00 same day
    // (visually it spans midnight, but we store it on the date it starts)
    let taskDate = date;
    let endTime = shift.endTime;
    
    if (shift.name === 'Midnight') {
      // Midnight shift: 00:00 to 06:00 (same date)
      endTime = '06:00';
    }

    tasks.push({
      title: `${staff1} & ${staff2}`,
      department: 'reception',
      itemName: 'Front Desk',
      startTime: shift.startTime,
      endTime: endTime,
      date: formatDate(taskDate),
      status: 'scheduled',
      assignedStaff: `${staff1}, ${staff2}`,
    });
  });

  return tasks;
}

// Generate Restaurant tasks for a single day
function generateRestaurantTasks(date) {
  const tasks = [];
  const tables = [
    'Table No: 01 & 02',
    'Table No: 03 & 04',
    'Table No: 05 & 06',
    'Table No: 07 & 08'
  ];

  tables.forEach((tableName) => {
    // Breakfast shift: 6am - 11am (2 staff)
    const breakfastStaff = getRandomStaff(restaurantStaff, 2);
    tasks.push({
      title: formatStaffNames(breakfastStaff),
      department: 'restaurant',
      itemName: tableName,
      startTime: '06:00',
      endTime: '11:00',
      date: formatDate(date),
      status: 'scheduled',
      assignedStaff: breakfastStaff.join(', '),
    });

    // Lunch shift: 11am - 3pm (2 staff, different from breakfast)
    const lunchStaff = getRandomStaff(
      restaurantStaff.filter(s => !breakfastStaff.includes(s)),
      2
    );
    tasks.push({
      title: formatStaffNames(lunchStaff.length > 0 ? lunchStaff : getRandomStaff(restaurantStaff, 2)),
      department: 'restaurant',
      itemName: tableName,
      startTime: '11:00',
      endTime: '15:00',
      date: formatDate(date),
      status: 'scheduled',
      assignedStaff: (lunchStaff.length > 0 ? lunchStaff : getRandomStaff(restaurantStaff, 2)).join(', '),
    });

    // Dinner shift: 5pm - 10pm (2 staff)
    const dinnerStaff = getRandomStaff(
      restaurantStaff.filter(s => !breakfastStaff.includes(s) && !lunchStaff.includes(s)),
      2
    );
    tasks.push({
      title: formatStaffNames(dinnerStaff.length > 0 ? dinnerStaff : getRandomStaff(restaurantStaff, 2)),
      department: 'restaurant',
      itemName: tableName,
      startTime: '17:00',
      endTime: '22:00',
      date: formatDate(date),
      status: 'scheduled',
      assignedStaff: (dinnerStaff.length > 0 ? dinnerStaff : getRandomStaff(restaurantStaff, 2)).join(', '),
    });
  });

  return tasks;
}

// Generate Bar tasks for a single day
function generateBarTasks(date) {
  const tasks = [];
  
  // Bar operates similar to restaurant but different hours
  // Afternoon: 2pm - 6pm
  // Evening: 6pm - 11pm
  // Late night: 11pm - 2am (next day)

  const shifts = [
    { startTime: '14:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '23:00' },
    { startTime: '23:00', endTime: '02:00' },
  ];

  shifts.forEach((shift, index) => {
    const staff = getRandomStaff(barStaff, 2);
    
    let taskDate = date;
    let endTime = shift.endTime;
    
    // Late night shift spans to next day
    if (shift.startTime === '23:00') {
      taskDate = addDays(date, 1);
      endTime = '02:00';
    }

    tasks.push({
      title: formatStaffNames(staff),
      department: 'bar',
      itemName: 'Drink Corner',
      startTime: shift.startTime,
      endTime: endTime,
      date: formatDate(taskDate),
      status: 'scheduled',
      assignedStaff: staff.join(', '),
    });
  });

  return tasks;
}

// Generate Room Service tasks for a single day
function generateRoomServiceTasks(date) {
  const tasks = [];
  const roomGroups = [
    'Room No: 01, 02, 03',
    'Room No: 04, 05, 06',
    'Room No: 07, 08, 09',
    'Room No: 10, 11, 12'
  ];

  roomGroups.forEach((roomGroup) => {
    // Morning service: 7am - 12noon (2 staff)
    const morningStaff = getRandomStaff(roomServiceStaff, 2);
    tasks.push({
      title: formatStaffNames(morningStaff),
      department: 'room-services',
      itemName: roomGroup,
      startTime: '07:00',
      endTime: '12:00',
      date: formatDate(date),
      status: 'scheduled',
      assignedStaff: morningStaff.join(', '),
    });

    // Afternoon service: 12noon - 6pm (2 staff, different from morning)
    const afternoonStaff = getRandomStaff(
      roomServiceStaff.filter(s => !morningStaff.includes(s)),
      2
    );
    tasks.push({
      title: formatStaffNames(afternoonStaff.length > 0 ? afternoonStaff : getRandomStaff(roomServiceStaff, 2)),
      department: 'room-services',
      itemName: roomGroup,
      startTime: '12:00',
      endTime: '18:00',
      date: formatDate(date),
      status: 'scheduled',
      assignedStaff: (afternoonStaff.length > 0 ? afternoonStaff : getRandomStaff(roomServiceStaff, 2)).join(', '),
    });

    // Evening service: 6pm - 11pm (2 staff)
    const eveningStaff = getRandomStaff(
      roomServiceStaff.filter(s => !morningStaff.includes(s) && !afternoonStaff.includes(s)),
      2
    );
    tasks.push({
      title: formatStaffNames(eveningStaff.length > 0 ? eveningStaff : getRandomStaff(roomServiceStaff, 2)),
      department: 'room-services',
      itemName: roomGroup,
      startTime: '18:00',
      endTime: '23:00',
      date: formatDate(date),
      status: 'scheduled',
      assignedStaff: (eveningStaff.length > 0 ? eveningStaff : getRandomStaff(roomServiceStaff, 2)).join(', '),
    });
  });

  return tasks;
}

export async function seedTasks() {
  try {
    console.log('🌱 Starting task seeder for shift schedules...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check existing tasks
    const existingTasks = await Task.count();
    console.log(`📊 Existing tasks: ${existingTasks}`);
    
    // Generate tasks for the next 30 days
    const today = new Date();
    const daysToGenerate = 30;
    const allTasks = [];
    
    console.log(`📅 Generating tasks for ${daysToGenerate} days starting from ${today.toDateString()}...`);
    
    for (let i = 0; i < daysToGenerate; i++) {
      const currentDate = addDays(today, i);
      
      // Generate tasks for each department
      allTasks.push(...generateSpaTasks(currentDate));
      allTasks.push(...generateReceptionTasks(currentDate));
      allTasks.push(...generateRestaurantTasks(currentDate));
      allTasks.push(...generateBarTasks(currentDate));
      allTasks.push(...generateRoomServiceTasks(currentDate));
      
      if ((i + 1) % 5 === 0) {
        console.log(`📊 Generated tasks for ${i + 1}/${daysToGenerate} days...`);
      }
    }
    
    console.log(`✅ Generated ${allTasks.length} tasks`);
    console.log('💾 Saving tasks to database...');
    
    // Bulk create tasks
    const createdTasks = await Task.bulkCreate(allTasks, {
      ignoreDuplicates: true,
    });
    
    console.log(`✅ Created ${createdTasks.length} task records`);
    
    // Generate summary statistics
    const departmentCounts = {};
    const statusCounts = {};
    
    createdTasks.forEach(task => {
      departmentCounts[task.department] = (departmentCounts[task.department] || 0) + 1;
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    console.log('\n🎉 Task seeding completed! 📊');
    console.log(`📅 Date Range: ${today.toDateString()} to ${addDays(today, daysToGenerate - 1).toDateString()}`);
    console.log(`📋 Total Tasks: ${createdTasks.length}`);
    
    console.log('\n📈 Department Distribution:');
    Object.entries(departmentCounts).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} tasks`);
    });
    
    console.log('\n📊 Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} tasks`);
    });
    
    return {
      success: true,
      message: 'Task seeding completed successfully',
      data: {
        tasksCreated: createdTasks.length,
        departmentDistribution: departmentCounts,
        statusDistribution: statusCounts,
        dateRange: `${today.toDateString()} to ${addDays(today, daysToGenerate - 1).toDateString()}`,
        daysSpanned: daysToGenerate
      }
    };
    
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
}

// Helper function to clear existing tasks (for testing)
export async function clearTasks() {
  try {
    console.log('🧹 Clearing existing tasks...');
    await Task.destroy({ where: {}, force: true });
    console.log('✅ Cleared all tasks');
    return {
      success: true,
      message: 'All tasks cleared successfully'
    };
  } catch (error) {
    console.error('❌ Error clearing tasks:', error);
    throw error;
  }
}

