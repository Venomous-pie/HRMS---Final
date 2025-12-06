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

// Track staff assignments per day to avoid overwork
class StaffScheduler {
  constructor() {
    this.dailyAssignments = new Map();
  }

  getKey(date, staffName) {
    return `${formatDate(date)}_${staffName}`;
  }

  canAssignStaff(date, staffName, maxShiftsPerDay = 2) {
    const key = this.getKey(date, staffName);
    const shifts = this.dailyAssignments.get(key) || 0;
    return shifts < maxShiftsPerDay;
  }

  assignStaff(date, staffName) {
    const key = this.getKey(date, staffName);
    const current = this.dailyAssignments.get(key) || 0;
    this.dailyAssignments.set(key, current + 1);
  }

  reset() {
    this.dailyAssignments.clear();
  }
}

const scheduler = new StaffScheduler();

// Helper function to get random staff members with constraints
function getRandomStaff(staffList, count, date, excludeStaff = []) {
  const available = staffList.filter(staff => 
    !excludeStaff.includes(staff) && 
    scheduler.canAssignStaff(date, staff)
  );
  
  if (available.length < count) {
    return available;
  }
  
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  selected.forEach(staff => scheduler.assignStaff(date, staff));
  
  return selected;
}

// Helper function to format staff names for display
function formatStaffNames(staffArray) {
  if (staffArray.length === 0) return 'Available';
  if (staffArray.length === 1) return staffArray[0];
  if (staffArray.length === 2) return `${staffArray[0]} & ${staffArray[1]}`;
  const remaining = staffArray.length - 2;
  return `${staffArray[0]}, ${staffArray[1]} & ${remaining} more`;
}

// Helper function to add days to date
function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to convert 24-hour time to 12-hour format
function to12HourFormat(time24) {
  const [hours, minutes] = time24.split(':');
  let hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  if (hour === 0) {
    hour = 12; // Midnight
  } else if (hour > 12) {
    hour = hour - 12;
  }
  
  return `${hour}:${minutes} ${ampm}`;
}

// Helper to check if date is weekend
function isWeekend(date) {
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// Generate Spa tasks - NO OVERNIGHT SPANS
function generateSpaTasks(date) {
  const tasks = [];
  const spaRooms = [
    'Rest Room No: 01',
    'Rest Room No: 02',
    'Rest Room No: 03',
    'Rest Room No: 04'
  ];

  const isWeekendDay = isWeekend(date);
  
  spaRooms.forEach((roomName) => {
    // Spa operates 8am - 8pm (extended to 9pm on weekends)
    const openTime = '8:00 AM';
    const closeTime = isWeekendDay ? '9:00 PM' : '8:00 PM';
    
    // Morning shift: 8am - 1pm (5 hours)
    const morningStaff = getRandomStaff(spaStaff, 2, date);
    tasks.push({
      title: formatStaffNames(morningStaff),
      department: 'spa',
      itemName: roomName,
      startTime: openTime,
      endTime: '1:00 PM',
      date: formatDate(date),
      status: morningStaff.length === 2 ? 'scheduled' : 'available',
      assignedStaff: morningStaff.length > 0 ? morningStaff.join(', ') : null,
    });

    // Afternoon/Evening shift: 1pm - close (7-8 hours)
    const eveningStaff = getRandomStaff(spaStaff, 2, date, morningStaff);
    tasks.push({
      title: formatStaffNames(eveningStaff),
      department: 'spa',
      itemName: roomName,
      startTime: '1:00 PM',
      endTime: closeTime,
      date: formatDate(date),
      status: eveningStaff.length === 2 ? 'scheduled' : 'available',
      assignedStaff: eveningStaff.length > 0 ? eveningStaff.join(', ') : null,
    });

    // Closed period: After closing until next morning (SAME DAY ENTRY)
    // This represents "closed for the rest of the day"
    tasks.push({
      title: 'Closed',
      department: 'spa',
      itemName: roomName,
      startTime: closeTime,
      endTime: '11:59 PM',
      date: formatDate(date),
      status: 'closed',
      assignedStaff: null,
    });
  });

  return tasks;
}

// Generate Reception tasks - SPANS PROPERLY TO NEXT DAY
function generateReceptionTasks(date) {
  const tasks = [];

  // Reception operates 24/7 with proper shift management
  // All shifts stay within same day except night shift
  const shifts = [
    { name: 'Morning', startTime: '7:00 AM', endTime: '3:00 PM', nextDay: false },
    { name: 'Afternoon', startTime: '3:00 PM', endTime: '11:00 PM', nextDay: false },
    { name: 'Night', startTime: '11:00 PM', endTime: '7:00 AM', nextDay: true },
  ];

  shifts.forEach((shift, shiftIndex) => {
    const dateStr = formatDate(date);
    const staffSeed = dateStr.split('-').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    
    const index1 = (staffSeed + shiftIndex * 2) % receptionStaff.length;
    const index2 = (staffSeed + shiftIndex * 2 + 1) % receptionStaff.length;
    
    const staff1 = receptionStaff[index1];
    const staff2 = receptionStaff[index2];

    // Night shift goes to next day
    const taskDate = shift.nextDay ? addDays(date, 1) : date;

    tasks.push({
      title: `${staff1} & ${staff2}`,
      department: 'reception',
      itemName: 'Front Desk',
      startTime: shift.startTime,
      endTime: shift.endTime,
      date: formatDate(taskDate),
      status: 'scheduled',
      assignedStaff: `${staff1}, ${staff2}`,
    });
  });

  return tasks;
}

// Generate Restaurant tasks - NO OVERNIGHT SPANS
function generateRestaurantTasks(date) {
  const tasks = [];
  const tables = [
    'Table No: 01 & 02',
    'Table No: 03 & 04',
    'Table No: 05 & 06',
    'Table No: 07 & 08'
  ];

  const isWeekendDay = isWeekend(date);
  const staffPerShift = isWeekendDay ? 3 : 2;

  tables.forEach((tableName) => {
    // Breakfast: 6am - 11am
    const breakfastStaff = getRandomStaff(restaurantStaff, staffPerShift, date);
    tasks.push({
      title: formatStaffNames(breakfastStaff),
      department: 'restaurant',
      itemName: tableName,
      startTime: '06:00',
      endTime: '11:00',
      date: formatDate(date),
      status: breakfastStaff.length >= 2 ? 'scheduled' : 'understaffed',
      assignedStaff: breakfastStaff.length > 0 ? breakfastStaff.join(', ') : null,
    });

    // Lunch: 11am - 4pm
    const lunchStaff = getRandomStaff(restaurantStaff, staffPerShift, date, breakfastStaff);
    tasks.push({
      title: formatStaffNames(lunchStaff),
      department: 'restaurant',
      itemName: tableName,
      startTime: '11:00',
      endTime: '16:00',
      date: formatDate(date),
      status: lunchStaff.length >= 2 ? 'scheduled' : 'understaffed',
      assignedStaff: lunchStaff.length > 0 ? lunchStaff.join(', ') : null,
    });

    // Dinner: 4pm - 10pm (note: changed from 5pm to avoid gap)
    const dinnerStaff = getRandomStaff(restaurantStaff, staffPerShift + 1, date, [...breakfastStaff, ...lunchStaff]);
    tasks.push({
      title: formatStaffNames(dinnerStaff),
      department: 'restaurant',
      itemName: tableName,
      startTime: '16:00',
      endTime: '22:00',
      date: formatDate(date),
      status: dinnerStaff.length >= 2 ? 'scheduled' : 'understaffed',
      assignedStaff: dinnerStaff.length > 0 ? dinnerStaff.join(', ') : null,
    });
  });

  return tasks;
}

// Generate Bar tasks - PROPERLY HANDLE NEXT DAY
function generateBarTasks(date) {
  const tasks = [];
  const isWeekendDay = isWeekend(date);

  // Bar opens 2pm, closes at midnight (2am on weekends)
  const shifts = [
    { startTime: '2:00 PM', endTime: '7:00 PM', staffCount: 2, nextDay: false },
    { startTime: '7:00 PM', endTime: '11:59 PM', staffCount: 3, nextDay: false },
  ];

  // Add late night shift only on weekends (spans to next day)
  if (isWeekendDay) {
    shifts.push({ 
      startTime: '12:00 AM', 
      endTime: '2:00 AM', 
      staffCount: 2, 
      nextDay: true 
    });
  }

  shifts.forEach((shift) => {
    const staff = getRandomStaff(barStaff, shift.staffCount, date);
    const taskDate = shift.nextDay ? addDays(date, 1) : date;

    tasks.push({
      title: formatStaffNames(staff),
      department: 'bar',
      itemName: 'Drink Corner',
      startTime: shift.startTime,
      endTime: shift.endTime,
      date: formatDate(taskDate),
      status: staff.length >= 2 ? 'scheduled' : 'understaffed',
      assignedStaff: staff.length > 0 ? staff.join(', ') : null,
    });
  });

  return tasks;
}

// Generate Room Service tasks - PROPERLY HANDLE NEXT DAY
function generateRoomServiceTasks(date) {
  const tasks = [];
  const roomGroups = [
    'Room No: 01, 02, 03',
    'Room No: 04, 05, 06',
    'Room No: 07, 08, 09',
    'Room No: 10, 11, 12'
  ];

  roomGroups.forEach((roomGroup) => {
    // Morning: 6am - 2pm
    const morningStaff = getRandomStaff(roomServiceStaff, 2, date);
    tasks.push({
      title: formatStaffNames(morningStaff),
      department: 'room-services',
      itemName: roomGroup,
      startTime: '6:00 AM',
      endTime: '2:00 PM',
      date: formatDate(date),
      status: morningStaff.length >= 2 ? 'scheduled' : 'understaffed',
      assignedStaff: morningStaff.length > 0 ? morningStaff.join(', ') : null,
    });

    // Afternoon/Evening: 2pm - 10pm
    const eveningStaff = getRandomStaff(roomServiceStaff, 2, date, morningStaff);
    tasks.push({
      title: formatStaffNames(eveningStaff),
      department: 'room-services',
      itemName: roomGroup,
      startTime: '2:00 PM',
      endTime: '10:00 PM',
      date: formatDate(date),
      status: eveningStaff.length >= 2 ? 'scheduled' : 'understaffed',
      assignedStaff: eveningStaff.length > 0 ? eveningStaff.join(', ') : null,
    });

    // Night: 10pm - 6am (NEXT DAY)
    const nightStaff = getRandomStaff(roomServiceStaff, 1, date, [...morningStaff, ...eveningStaff]);
    const nextDay = addDays(date, 1);
    tasks.push({
      title: formatStaffNames(nightStaff),
      department: 'room-services',
      itemName: roomGroup,
      startTime: '10:00 PM',
      endTime: '6:00 AM',
      date: formatDate(nextDay),
      status: nightStaff.length >= 1 ? 'scheduled' : 'available',
      assignedStaff: nightStaff.length > 0 ? nightStaff.join(', ') : null,
    });
  });

  return tasks;
}

export async function seedTasks() {
  try {
    console.log('🌱 Starting task seeder for shift schedules...');

    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const existingTasks = await Task.count();
    console.log(`📊 Existing tasks: ${existingTasks}`);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const daysToGenerate = 90;
    const allTasks = [];

    console.log(`📅 Generating tasks for ${daysToGenerate} days`);
    console.log(`📅 Starting from: ${formatDate(today)}`);

    for (let i = 0; i < daysToGenerate; i++) {
      const currentDate = addDays(today, i);
      scheduler.reset();

      allTasks.push(...generateSpaTasks(currentDate));
      allTasks.push(...generateReceptionTasks(currentDate));
      allTasks.push(...generateRestaurantTasks(currentDate));
      allTasks.push(...generateBarTasks(currentDate));
      allTasks.push(...generateRoomServiceTasks(currentDate));

      if ((i + 1) % 10 === 0 || (i + 1) === daysToGenerate) {
        console.log(`📊 Generated tasks for ${i + 1}/${daysToGenerate} days...`);
      }
    }

    console.log(`✅ Generated ${allTasks.length} tasks`);
    console.log('💾 Saving tasks to database...');

    const createdTasks = await Task.bulkCreate(allTasks, {
      ignoreDuplicates: true,
      validate: true,
    });

    console.log(`✅ Created ${createdTasks.length} task records`);

    const departmentCounts = {};
    const statusCounts = {};

    createdTasks.forEach(task => {
      departmentCounts[task.department] = (departmentCounts[task.department] || 0) + 1;
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    console.log('\n🎉 Task seeding completed! 📊');
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
        daysSpanned: daysToGenerate
      }
    };

  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
}

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