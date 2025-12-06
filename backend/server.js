import express from "express";
import cors from "cors";
import {
  sequelize,
  Guest,
  Reservation,
  Room,
  RoomType,
  User,
  Payment,
  Invoice,
  Task,
} from "./models/index.js";
import { seedData } from "./services/seedService.js";
import { getStatusColor } from "./data/roomData.js";
import { Op, Sequelize } from "sequelize";
import { authenticateToken, generateToken, optionalAuth } from "./middleware/auth.js";
import { requirePermission, requireAnyPermission, requireRole, requireAdmin, requireAdminOrManager } from "./middleware/permissions.js";
import { 
  errorHandler, 
  notFoundHandler, 
  requestIdMiddleware, 
  asyncHandler, 
  createError, 
  validateRequired,
  validateEmail,
  validateDateRange
} from "./middleware/errorHandler.js";
import dashboardRouter from "./routes/dashboard.js";
import { seedReservations, clearReservations } from "./seeders/reservationSeeder.js";
import { seedTasks, clearTasks } from "./seeders/taskSeeder.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Request tracking middleware
app.use(requestIdMiddleware);

// Middleware setup
app.use(cors());
app.use(express.json());

// Dashboard routes
app.use('/api', dashboardRouter);

// Helper function for consistent API responses
const createSuccessResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const normalizeToStartOfDay = (dateInput) => {
  if (typeof dateInput === "string" && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
};
const toDateOnlyLocal = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const calculateNights = (startDate, endDate) => {
  const MS_DAY = 24 * 60 * 60 * 1000;
  return Math.round((endDate.getTime() - startDate.getTime()) / MS_DAY);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const buildOverlapWhere = ({ roomId, startDate, endDate, excludeId }) => ({
  RoomId: roomId,
  status: { [Op.ne]: "cancelled" },
  ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
  [Op.and]: [
    { checkIn: { [Op.lt]: endDate } },
    { checkOut: { [Op.gt]: startDate } },
  ],
});

app.get("/", (req, res) => {
  res.send("DB is correct lol.");
});

// Seeder endpoints for development
app.post("/api/admin/seed-reservations", async (req, res) => {
  try {
    console.log('📡 Seeder endpoint called');
    console.log('🔄 Starting reservation seeding process...');
    
    const result = await seedReservations();
    
    console.log('✅ Seeder completed successfully:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: `Failed to seed reservations: ${error.message}`,
      details: error.stack
    });
  }
});

app.post("/api/admin/clear-reservations", async (req, res) => {
  try {
    const result = await clearReservations();
    res.json(result);
  } catch (error) {
    console.error('Clear error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to clear reservations: ${error.message}`
    });
  }
});

// Task seeder endpoints
app.post("/api/admin/seed-tasks", authenticateToken, async (req, res) => {
  try {
    console.log('📡 Task seeder endpoint called');
    console.log('🔄 Starting task seeding process...');
    
    // Check if tasks already exist
    const existingCount = await Task.count();
    console.log(`📊 Existing tasks in database: ${existingCount}`);
    
    const result = await seedTasks();
    
    // Verify tasks were created
    const newCount = await Task.count();
    const tasksCreated = newCount - existingCount;
    console.log(`📊 Tasks after seeding: ${newCount} (${tasksCreated} new tasks)`);
    
    // Get date range of created tasks
    const dateRange = await Task.findAll({
      attributes: [
        [Sequelize.fn('MIN', Sequelize.col('date')), 'minDate'],
        [Sequelize.fn('MAX', Sequelize.col('date')), 'maxDate']
      ],
      raw: true
    });
    
    console.log('✅ Task seeder completed successfully:', result);
    console.log(`📅 Task date range: ${dateRange[0]?.minDate} to ${dateRange[0]?.maxDate}`);
    
    res.json({
      ...result,
      debug: {
        existingTasks: existingCount,
        newTasks: tasksCreated,
        totalTasks: newCount,
        dateRange: {
          min: dateRange[0]?.minDate,
          max: dateRange[0]?.maxDate
        }
      }
    });
  } catch (error) {
    console.error('❌ Task seeder error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: `Failed to seed tasks: ${error.message}`,
      details: error.stack
    });
  }
});

app.post("/api/admin/clear-tasks", async (req, res) => {
  try {
    const result = await clearTasks();
    res.json(result);
  } catch (error) {
    console.error('Clear tasks error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to clear tasks: ${error.message}`
    });
  }
});

// Debug endpoint to check task counts
app.get("/api/admin/tasks/debug", authenticateToken, async (req, res) => {
  try {
    const totalTasks = await Task.count();
    const tasksByDate = await Task.findAll({
      attributes: [
        'date',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true
    });
    
    const today = new Date().toISOString().split('T')[0];
    
    // Try different date formats to check
    const todayTasks1 = await Task.count({ where: { date: today } });
    // Alternative query using DATE function (for SQLite compatibility)
    const todayTasks2 = await Task.count({ 
      where: sequelize.literal(`DATE(date) = DATE('${today}')`)
    });
    
    // Get sample tasks to see date format
    const sampleTasks = await Task.findAll({
      limit: 5,
      attributes: ['id', 'date', 'department', 'itemName'],
      order: [['date', 'ASC']]
    });
    
    const sampleDates = sampleTasks.map(t => {
      const taskData = t.toJSON ? t.toJSON() : t;
      return {
        id: taskData.id,
        date: taskData.date,
        dateType: typeof taskData.date,
        dateString: taskData.date instanceof Date ? taskData.date.toISOString().split('T')[0] : String(taskData.date),
        department: taskData.department
      };
    });
    
    res.json({
      totalTasks,
      todayTasks: todayTasks1,
      todayTasksAlt: todayTasks2,
      todayDate: today,
      tasksByDate: tasksByDate.slice(0, 10).map(t => ({
        date: t.date,
        dateString: t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date),
        count: t.count
      })),
      sampleTasks: sampleDates,
      message: totalTasks === 0 
        ? '⚠️ No tasks found in database. Please seed tasks using the "Seed Task Schedules" button in Admin Dashboard.'
        : `✅ Found ${totalTasks} tasks. Today (${today}) has ${todayTasks1} tasks.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks endpoint - fetches tasks for a specific date range
app.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    
    const where = {};
    
    // Filter by date if provided (get tasks for today and next 7 days)
    if (date) {
      // Ensure date is in YYYY-MM-DD format
      const dateStr = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
      const startDate = dateStr;
      const endDate = new Date(dateStr);
      endDate.setDate(endDate.getDate() + 7); // Get next 7 days
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // For DATEONLY fields in SQLite, use string comparison
      // SQLite stores DATEONLY as TEXT, so we compare as strings
      where.date = {
        [Op.gte]: startDate,
        [Op.lte]: endDateStr
      };
      
      console.log(`📅 Fetching tasks from ${startDate} to ${endDateStr}`);
      console.log(`🔍 Query filter: date >= '${startDate}' AND date <= '${endDateStr}'`);
    } else {
      console.log('📅 Fetching all tasks (no date filter)');
    }
    
    // Add time filters if provided
    if (startTime) {
      where.startTime = { [Op.gte]: startTime };
    }
    if (endTime) {
      where.endTime = { [Op.lte]: endTime };
    }
    
    const tasks = await Task.findAll({
      where,
      order: [
        ['department', 'ASC'],
        ['itemName', 'ASC'],
        ['date', 'ASC'],
        ['startTime', 'ASC']
      ],
      raw: false // Keep as Sequelize instances to properly serialize DATEONLY
    });
    
    console.log(`✅ Found ${tasks.length} tasks`);
    
    // Log sample dates from returned tasks for debugging (always log, not just when empty)
    if (tasks.length > 0) {
      const sampleTaskDates = tasks.slice(0, 5).map(t => {
        const taskData = t.toJSON ? t.toJSON() : t;
        const dateValue = taskData.date instanceof Date 
          ? taskData.date.toISOString().split('T')[0] 
          : String(taskData.date).split('T')[0];
        return dateValue;
      });
      console.log(`📋 Sample dates in returned tasks:`, sampleTaskDates);
    }
    
    // If no tasks found and date filter was used, log for debugging
    if (tasks.length === 0 && date) {
      const totalTasks = await Task.count();
      const sampleDates = await Task.findAll({
        attributes: ['date'],
        group: ['date'],
        limit: 10,
        order: [['date', 'ASC']],
        raw: true
      });
      console.log(`⚠️ No tasks found for date ${date}. Total tasks in DB: ${totalTasks}`);
      console.log(`📋 Sample dates in DB:`, sampleDates.map(t => {
        // DATEONLY fields might be Date objects or strings
        const dateValue = t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date);
        return dateValue;
      }));
    }
    
    // Serialize tasks and ensure date is in YYYY-MM-DD format
    const serializedTasks = tasks.map(task => {
      const taskData = task.toJSON ? task.toJSON() : task;
      // Ensure date is always a string in YYYY-MM-DD format
      if (taskData.date instanceof Date) {
        taskData.date = taskData.date.toISOString().split('T')[0];
      } else if (taskData.date) {
        // If it's already a string, ensure it's in correct format
        // Handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss.sssZ' formats
        const dateStr = String(taskData.date);
        taskData.date = dateStr.split('T')[0].split(' ')[0]; // Get just the date part
      }
      return taskData;
    });
    
    // Log what dates are being returned after serialization
    if (serializedTasks.length > 0 && date) {
      const uniqueDates = [...new Set(serializedTasks.map(t => t.date))].sort();
      console.log(`📊 Unique dates in response:`, uniqueDates.slice(0, 10));
      const todayCount = serializedTasks.filter(t => t.date === date).length;
      console.log(`📊 Tasks matching requested date (${date}): ${todayCount} out of ${serializedTasks.length}`);
      if (todayCount === 0) {
        console.log(`⚠️ WARNING: No tasks match today's date (${date}). Check if tasks were seeded with correct start date.`);
      }
    }
    
    res.json(serializedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch tasks: ${error.message}`
    });
  }
});

// Authentication endpoints
app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate required fields
  validateRequired(['username', 'password'], req.body);

  // Find user by username or email
  const user = await User.findByCredentials(username, password);
  if (!user) {
    throw createError.invalidCredentials();
  }

  // Update last login
  await user.update({ lastLogin: new Date() });

  // Generate JWT token
  const token = generateToken(user);

  const response = createSuccessResponse({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      lastLogin: user.lastLogin
    }
  }, "Login successful");

  res.json(response);
}));

app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Logout failed: ${error.message}`
    });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          department: req.user.department,
          lastLogin: req.user.lastLogin
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch user data: ${error.message}`
    });
  }
});

app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required"
      });
    }

    // Verify current password
    const user = await User.findByPk(req.user.id);
    const isValidPassword = await user.validatePassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    // Update password (will be hashed by the model hook)
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to change password: ${error.message}`
    });
  }
});

// User Management endpoints
app.get("/api/admin/users", authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch users: ${error.message}`
    });
  }
});

app.post("/api/admin/users", authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      department
    } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: "Required fields: username, email, password, firstName, lastName, role"
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Username or email already exists"
      });
    }

    const user = await User.create({
      username,
      email,
      password, // Will be hashed by model hook
      firstName,
      lastName,
      role,
      phone,
      department,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        department: user.department,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to create user: ${error.message}`
    });
  }
});

app.get("/api/admin/users/:id", authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch user: ${error.message}`
    });
  }
});

app.put("/api/admin/users/:id", authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      firstName,
      lastName,
      role,
      phone,
      department,
      isActive
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if username or email conflicts with another user
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Username or email already exists"
        });
      }
    }

    await user.update({
      username: username || user.username,
      email: email || user.email,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      role: role || user.role,
      phone: phone !== undefined ? phone : user.phone,
      department: department !== undefined ? department : user.department,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        department: user.department,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to update user: ${error.message}`
    });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Prevent users from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own account"
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (permanent === "true") {
      await user.destroy();
      res.json({
        success: true,
        message: "User permanently deleted"
      });
    } else {
      await user.update({ isActive: false });
      res.json({
        success: true,
        message: "User deactivated"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to delete user: ${error.message}`
    });
  }
});

app.post("/api/admin/users/:id/reset-password", authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long"
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    await user.update({ password: newPassword }); // Will be hashed by model hook

    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to reset password: ${error.message}`
    });
  }
});

app.post("/api/seed", async (req, res) => {
  try {
    await seedData();

    const roomCount = await Room.count();
    const roomTypeCount = await RoomType.count();

    res.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        roomTypes: roomTypeCount,
        rooms: roomCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Seeding failed: ${error.message}`,
    });
  }
});

app.post("/api/reserve-room", authenticateToken, requirePermission('RESERVATIONS_CREATE'), asyncHandler(async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    phone,
    address,
    idDocument,
    nationality,
    numGuest,
    checkIn,
    checkOut,
    specialRequest,
    status,
    totalPrice,
    roomNumber,
    roomId,
  } = req.body;

  // Validate required fields using helper
  validateRequired([
    'firstName', 'lastName', 'email', 'phone', 'address', 
    'idDocument', 'numGuest', 'checkIn', 'checkOut', 'status'
  ], req.body);

  const selectedRoomNumber = (roomNumber ?? roomId ?? "").toString();
  if (!selectedRoomNumber) {
    throw createError.requiredField('roomNumber or roomId');
  }

  // Validate email format
  validateEmail(email);

  // Validate and parse dates
  const checkInDate = normalizeToStartOfDay(checkIn);
  const checkOutDate = normalizeToStartOfDay(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw createError.invalidDate('Check-in date cannot be in the past');
  }

  if (checkOutDate <= checkInDate) {
    throw createError.invalidDateRange('Check-out date must be after check-in date');
  }

  const guestCount = Number(numGuest);
  if (guestCount < 1 || guestCount > 10) {
    throw createError.validation(
      'Number of guests must be between 1 and 10', 
      { field: 'numGuest', min: 1, max: 10, provided: guestCount }
    );
  }

  const room = await Room.findOne({
    where: { roomNumber: selectedRoomNumber },
    include: [
      {
        model: RoomType,
        attributes: ["maxCapacity", "basePrice"],
      },
    ],
  });

  if (!room) {
    throw createError.notFound('Room', selectedRoomNumber);
  }

  if (guestCount > room.RoomType.maxCapacity) {
    throw createError.capacityExceeded(selectedRoomNumber, room.RoomType.maxCapacity, guestCount);
  }

  const conflictingReservation = await Reservation.findOne({
    where: buildOverlapWhere({
      roomId: room.id,
      startDate: checkInDate,
      endDate: checkOutDate,
    }),
  });

  if (conflictingReservation) {
    throw createError.reservationConflict(selectedRoomNumber, {
      checkIn: conflictingReservation.checkIn,
      checkOut: conflictingReservation.checkOut,
    });
  }

  const t = await sequelize.transaction();

  try {
    const [guest, guestCreated] = await Guest.findOrCreate({
      where: { idDocument, email },
      defaults: {
        phone,
        email,
        firstName,
        middleName: middleName || null,
        lastName,
        address,
        nationality: nationality || null,
        totalStays: 0,
        totalSpent: 0,
      },
      transaction: t,
    });

    // If guest already exists, update their information if provided
    if (!guestCreated) {
      const updateData = {};
      if (nationality) updateData.nationality = nationality;
      if (phone) updateData.phone = phone;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (middleName !== undefined) updateData.middleName = middleName || null;
      if (address) updateData.address = address;
      
      if (Object.keys(updateData).length > 0) {
        await guest.update(updateData, { transaction: t });
      }

      // Check if guest has previous checked-out reservations
      // Find the most recent checked-out reservation
      const previousReservations = await Reservation.findAll({
        where: {
          GuestId: guest.id,
          status: 'checkedOut'
        },
        order: [['checkOut', 'DESC']],
        limit: 1,
        transaction: t
      });

      // Check if guest checked out last year or earlier (returning guest)
      let isReturningGuest = false;
      if (previousReservations.length > 0) {
        const lastCheckOut = new Date(previousReservations[0].checkOut);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        // Guest is returning if they checked out at least once before (any time in the past)
        isReturningGuest = lastCheckOut < new Date();
      }

      // Get all checked-out reservations for this guest to calculate stats
      const allCheckedOutReservations = await Reservation.findAll({
        where: {
          GuestId: guest.id,
          status: 'checkedOut'
        },
        transaction: t
      });

      // Calculate total stays (count of checked-out reservations)
      const totalStays = allCheckedOutReservations.length;

      // Calculate total spent from all checked-out reservations
      const totalSpent = allCheckedOutReservations.reduce((sum, res) => {
        return sum + (parseFloat(res.totalPrice) || 0);
      }, 0);

      // Get the most recent check-out date
      let lastVisited = null;
      if (allCheckedOutReservations.length > 0) {
        const sortedByCheckOut = [...allCheckedOutReservations].sort((a, b) => {
          return new Date(b.checkOut) - new Date(a.checkOut);
        });
        lastVisited = sortedByCheckOut[0].checkOut;
      }

      // Update guest statistics
      await guest.update({
        totalStays: totalStays,
        totalSpent: totalSpent,
        lastVisited: lastVisited
      }, { transaction: t });
    } else {
      // New guest - initialize stats
      await guest.update({
        totalStays: 0,
        totalSpent: 0,
        lastVisited: null
      }, { transaction: t });
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const nightlyRate = room.pricePerNight || room.RoomType.basePrice || 0;
    const finalTotalPrice =
      typeof totalPrice === "number" && totalPrice > 0
        ? totalPrice
        : nightlyRate * nights;

    const reservation = await Reservation.create(
      {
        numGuest: guestCount,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        specialRequest,
        status,
        totalPrice: finalTotalPrice,
        roomNumber: selectedRoomNumber,
        RoomId: room.id,
        GuestId: guest.id,
      },
      { transaction: t },
    );

    await t.commit();

    const response = createSuccessResponse({
      reservation: {
        id: reservation.id,
        roomNumber: selectedRoomNumber,
        guestName: `${firstName} ${lastName}`,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: status,
        totalPrice: finalTotalPrice,
        numGuest: guestCount
      }
    }, 'Reservation created successfully');

    res.status(201).json(response);
  } catch (error) {
    await t.rollback();
    throw error; // Let asyncHandler deal with it
  }
}));

app.get("/api/reservations", authenticateToken, requireAnyPermission(['RESERVATIONS_VIEW_ALL', 'RESERVATIONS_VIEW_OWN']), async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Guest,
          attributes: [
            "firstName",
            "middleName",
            "lastName",
            "email",
            "phone",
            "address",
            "idDocument",
            "nationality",
            "totalStays",
            "lastVisited",
            "totalSpent",
            "notes",
            "orderCount",
          ],
        },
        {
          model: Room,
          attributes: ["roomNumber"],
        },
      ],
      order: [
        ["checkIn", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    const transformedReservations = reservations.map((reservation) => ({
      id: reservation.id.toString(),
      room: reservation.Room?.roomNumber?.toString() || "N/A",
      guest:
        `${reservation.Guest?.firstName || ""} ${reservation.Guest?.middleName ? reservation.Guest.middleName + " " : ""}${reservation.Guest?.lastName || ""}`.trim(),
      checkIn: toDateOnlyLocal(reservation.checkIn),
      checkOut: toDateOnlyLocal(reservation.checkOut),
      status: reservation.status,
      type: "standard", // Default type since not in backend model yet
      amount: reservation.totalPrice || 0,
      balance: 0, // Calculate or set default
      source: reservation.bookingSource || "Direct Booking", // Use bookingSource from model
      orders: 0, // Default orders
      bookingDate: reservation.createdAt,
      notes: reservation.specialRequest || "",
      guestObj: reservation.Guest ? {
        id: reservation.Guest.id,
        firstName: reservation.Guest.firstName,
        middleName: reservation.Guest.middleName,
        lastName: reservation.Guest.lastName,
        email: reservation.Guest.email,
        phone: reservation.Guest.phone,
        address: reservation.Guest.address,
        idDocument: reservation.Guest.idDocument,
        nationality: reservation.Guest.nationality,
        totalStays: reservation.Guest.totalStays,
        lastVisited: reservation.Guest.lastVisited,
        totalSpent: reservation.Guest.totalSpent,
        notes: reservation.Guest.notes,
        orderCount: reservation.Guest.orderCount,
        // Add any additional fields from Guest model
        createdAt: reservation.Guest.createdAt,
        updatedAt: reservation.Guest.updatedAt,
        type: reservation.Guest.type,
        tags: reservation.Guest.tags,
        countryCode: reservation.Guest.countryCode,
        verified: reservation.Guest.verified,
        idVerified: reservation.Guest.idVerified,
      } : null,
    }));

    return res.json(transformedReservations);
  } catch (error) {
    return res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

app.get("/api/reservations/:id", authenticateToken, requireAnyPermission(['RESERVATIONS_VIEW_ALL', 'RESERVATIONS_VIEW_OWN']), async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: Guest,
          attributes: [
            "firstName",
            "middleName",
            "lastName",
            "email",
            "phone",
            "address",
            "idDocument",
            "nationality",
            "totalStays",
            "lastVisited",
            "totalSpent",
            "notes",
            "orderCount",
          ],
        },
        {
          model: Room,
          attributes: ["roomNumber"],
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.json({
      id: reservation.id.toString(),
      checkIn: toDateOnlyLocal(reservation.checkIn),
      checkOut: toDateOnlyLocal(reservation.checkOut),
      status: reservation.status,
      numGuest: reservation.numGuest,
      specialRequest: reservation.specialRequest,
      totalPrice: reservation.totalPrice,
      roomNumber:
        reservation.Room?.roomNumber?.toString() ||
        reservation.roomNumber ||
        "",
      RoomId: reservation.RoomId,
      GuestId: reservation.GuestId,
      Guest: reservation.Guest
        ? {
            firstName: reservation.Guest.firstName,
            middleName: reservation.Guest.middleName,
            lastName: reservation.Guest.lastName,
            email: reservation.Guest.email,
            phone: reservation.Guest.phone,
            address: reservation.Guest.address,
            idDocument: reservation.Guest.idDocument,
          }
        : null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error fetching reservation: ${error.message}` });
  }
});

app.put("/api/reservations/:id", authenticateToken, requirePermission('RESERVATIONS_EDIT'), async (req, res) => {
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 300;

  const { id } = req.params;
  const { status, checkIn, checkOut, numGuest, specialRequest, totalPrice } =
    req.body;
  const { firstName, middleName, lastName, email, phone, address, idDocument } =
    req.body; // optional guest updates

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let t;
    try {
      t = await sequelize.transaction();

      const reservation = await Reservation.findByPk(id, { transaction: t });
      if (!reservation) {
        await t.rollback();
        return res.status(404).json({ error: "Reservation not found" });
      }

      const newCheckIn = checkIn
        ? normalizeToStartOfDay(checkIn)
        : reservation.checkIn;
      const newCheckOut = checkOut
        ? normalizeToStartOfDay(checkOut)
        : reservation.checkOut;
      if (newCheckOut <= newCheckIn) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Check-out date must be after check-in date." });
      }

      const newNumGuest =
        typeof numGuest === "number" ? numGuest : reservation.numGuest;
      if (newNumGuest < 1 || newNumGuest > 10) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Number of guests must be between 1 and 10." });
      }

      const requestedRoomNumber = (
        req.body.roomNumber ??
        req.body.roomId ??
        ""
      ).toString();
      let room;
      let roomChanged = false;
      let targetRoomNumber;

      if (requestedRoomNumber) {
        room = await Room.findOne({
          where: { roomNumber: requestedRoomNumber },
          include: [
            { model: RoomType, attributes: ["maxCapacity", "basePrice"] },
          ],
          transaction: t,
        });
        if (!room) {
          await t.rollback();
          return res
            .status(404)
            .json({
              error: `Room with number: ${requestedRoomNumber} doesn't exist.`,
            });
        }
        roomChanged = room.id !== reservation.RoomId;
        targetRoomNumber = room.roomNumber;
      } else {
        room = await Room.findByPk(reservation.RoomId, {
          include: [
            { model: RoomType, attributes: ["maxCapacity", "basePrice"] },
          ],
          transaction: t,
        });
        if (!room) {
          await t.rollback();
          return res
            .status(404)
            .json({ error: "Room not found for reservation" });
        }
        targetRoomNumber = room.roomNumber;
      }

      if (newNumGuest > (room.RoomType?.maxCapacity || 0)) {
        await t.rollback();
        return res
          .status(400)
          .json({
            error: `Room ${targetRoomNumber} can accommodate maximum ${room.RoomType?.maxCapacity || 0} guests. You selected ${newNumGuest} guests.`,
          });
      }

      const conflict = await Reservation.findOne({
        where: buildOverlapWhere({
          roomId: room.id,
          startDate: newCheckIn,
          endDate: newCheckOut,
          excludeId: reservation.id,
        }),
        transaction: t,
      });
      if (conflict) {
        await t.rollback();
        return res.status(409).json({
          error: `Room ${targetRoomNumber} is already booked for the selected dates.`,
          conflictingReservation: {
            checkIn: conflict.checkIn,
            checkOut: conflict.checkOut,
          },
        });
      }

      const nights = calculateNights(newCheckIn, newCheckOut);
      const nightlyRate = room.pricePerNight || room.RoomType?.basePrice || 0;
      const datesChanged = Boolean(checkIn) || Boolean(checkOut);
      const shouldAutoPrice =
        (datesChanged || roomChanged) &&
        !(typeof totalPrice === "number" && totalPrice >= 0);
      const finalTotalPrice = shouldAutoPrice
        ? nightlyRate * nights
        : typeof totalPrice === "number" && totalPrice >= 0
          ? totalPrice
          : reservation.totalPrice;

      await reservation.update(
        {
          status: status ?? reservation.status,
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          numGuest: newNumGuest,
          specialRequest: specialRequest ?? reservation.specialRequest,
          totalPrice: finalTotalPrice,
          RoomId: room.id,
        },
        { transaction: t },
      );

      if (
        firstName ||
        middleName !== undefined ||
        lastName ||
        email ||
        phone ||
        address ||
        idDocument
      ) {
        const resWithGuest = await Reservation.findByPk(id, {
          include: [Guest],
          transaction: t,
        });
        if (!resWithGuest?.Guest) {
          await t.rollback();
          return res
            .status(404)
            .json({ error: "Guest not found for reservation" });
        }
        await resWithGuest.Guest.update(
          {
            firstName: firstName ?? resWithGuest.Guest.firstName,
            middleName:
              middleName !== undefined
                ? middleName || null
                : resWithGuest.Guest.middleName,
            lastName: lastName ?? resWithGuest.Guest.lastName,
            email: email ?? resWithGuest.Guest.email,
            phone: phone ?? resWithGuest.Guest.phone,
            address: address ?? resWithGuest.Guest.address,
            idDocument: idDocument ?? resWithGuest.Guest.idDocument,
          },
          { transaction: t },
        );
      }

      await t.commit();
      const updated = await Reservation.findByPk(id, {
        include: [Guest, Room],
        transaction: undefined,
      });
      return res.json({
        message: "Reservation updated successfully",
        reservation: {
          id: updated.id.toString(),
          checkIn: toDateOnlyLocal(updated.checkIn),
          checkOut: toDateOnlyLocal(updated.checkOut),
          status: updated.status,
          numGuest: updated.numGuest,
          specialRequest: updated.specialRequest,
          totalPrice: updated.totalPrice,
          roomNumber:
            updated.Room?.roomNumber?.toString() || updated.roomNumber || "",
          RoomId: updated.RoomId,
          GuestId: updated.GuestId,
          Guest: updated.Guest
            ? {
                firstName: updated.Guest.firstName,
                middleName: updated.Guest.middleName,
                lastName: updated.Guest.lastName,
                email: updated.Guest.email,
                phone: updated.Guest.phone,
                address: updated.Guest.address,
                idDocument: updated.Guest.idDocument,
              }
            : null,
        },
      });
    } catch (error) {
      if (t) await t.rollback();
      const message = (error && (error.message || error.toString())) || "";
      const isBusy =
        /SQLITE_BUSY|database is locked/i.test(message) ||
        error?.name === "SequelizeTimeoutError";
      if (isBusy && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * (attempt + 1);
        await sleep(delay);
        continue;
      }
      return res
        .status(500)
        .json({ error: `Error updating reservation: ${error.message}` });
    }
  }
});

app.delete("/api/reservations/:id", authenticateToken, requireAnyPermission(['RESERVATIONS_DELETE', 'RESERVATIONS_CANCEL']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id, { transaction: t });
    if (!reservation) {
      await t.rollback();
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (req.query.soft === "true") {
      await reservation.update({ status: "cancelled" }, { transaction: t });
      await t.commit();
      return res.json({ message: "Reservation cancelled successfully" });
    }

    await reservation.destroy({ transaction: t });
    await t.commit();
    return res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    await t.rollback();
    return res
      .status(500)
      .json({ error: `Error deleting reservation: ${error.message}` });
  }
});

// Checkout endpoint - process guest checkout
app.post("/api/reservations/:id/checkout", authenticateToken, requireAnyPermission(['RESERVATIONS_EDIT']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { paymentAmount, paymentMethod, extraCharges, notes } = req.body;

    const reservation = await Reservation.findByPk(id, {
      include: [Guest, Room],
      transaction: t
    });

    if (!reservation) {
      await t.rollback();
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status === 'checkedOut') {
      await t.rollback();
      return res.status(400).json({ error: "Reservation already checked out" });
    }

    // Calculate total with extra charges
    let totalAmount = reservation.totalPrice;
    if (extraCharges && extraCharges.length > 0) {
      const extraTotal = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
      totalAmount += extraTotal;
    }

    // Add taxes (12%)
    const taxAmount = totalAmount * 0.12;
    const finalTotal = totalAmount + taxAmount;

    // Create invoice if doesn't exist
    let invoice = await Invoice.findOne({
      where: { reservationId: id },
      transaction: t
    });

    if (!invoice) {
      // Generate invoice number and due date
      const invoiceNumber = `INV-${id}-${Date.now()}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
      invoice = await Invoice.create({
        reservationId: id,
        guestId: reservation.GuestId,
        subtotal: totalAmount,
        taxAmount: taxAmount,
        totalAmount: finalTotal,
        status: 'sent',
        invoiceNumber,
        dueDate
      }, { transaction: t });
    }

    // Process payment if amount provided
    if (paymentAmount && paymentAmount > 0) {
      // Generate payment number
      const paymentNumber = `PAY-${id}-${Date.now()}`;
      await Payment.create({
        invoiceId: invoice.id,
        reservationId: id,
        guestId: reservation.GuestId,
        amount: paymentAmount,
        paymentMethod: paymentMethod || 'cash',
        status: 'completed',
        notes: notes,
        paymentNumber
      }, { transaction: t });

      // Update invoice paid amount
      await invoice.update({
        paidAmount: (invoice.paidAmount || 0) + paymentAmount
      }, { transaction: t });
    }

    // Update reservation status
    await reservation.update({
      status: 'checkedOut',
      notes: notes ? `${reservation.notes || ''}\nCheckout: ${notes}`.trim() : reservation.notes
    }, { transaction: t });

    // Update guest statistics when checking out
    if (reservation.Guest) {
      // Get all checked-out reservations for this guest (including the current one)
      const allCheckedOutReservations = await Reservation.findAll({
        where: {
          GuestId: reservation.GuestId,
          status: 'checkedOut'
        },
        transaction: t
      });

      // Calculate total stays (count of checked-out reservations)
      const totalStays = allCheckedOutReservations.length;

      // Calculate total spent from all checked-out reservations
      const totalSpent = allCheckedOutReservations.reduce((sum, res) => {
        return sum + (parseFloat(res.totalPrice) || 0);
      }, 0);

      // Get the most recent check-out date
      let lastVisited = null;
      if (allCheckedOutReservations.length > 0) {
        const sortedByCheckOut = [...allCheckedOutReservations].sort((a, b) => {
          return new Date(b.checkOut) - new Date(a.checkOut);
        });
        lastVisited = sortedByCheckOut[0].checkOut;
      }

      // Update guest statistics
      await reservation.Guest.update({
        totalStays: totalStays,
        totalSpent: totalSpent,
        lastVisited: lastVisited
      }, { transaction: t });
    }

    // Update room status to dirty (needs housekeeping)
    if (reservation.Room) {
      await reservation.Room.update({
        status: 'maintenance' // Will be changed to available after housekeeping
      }, { transaction: t });
    }

    await t.commit();

    res.json({
      message: "Checkout completed successfully",
      reservation: {
        id: reservation.id,
        status: 'checkedOut',
        totalAmount: finalTotal,
        paidAmount: invoice.paidAmount || 0,
        balanceAmount: finalTotal - (invoice.paidAmount || 0)
      }
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: `Checkout failed: ${error.message}` });
  }
});

// Cancellation endpoint with policy calculation
app.post("/api/reservations/:id/cancel", authenticateToken, requireAnyPermission(['RESERVATIONS_CANCEL']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { reason, cancellationFee, refundAmount } = req.body;

    const reservation = await Reservation.findByPk(id, {
      include: [Guest, Room],
      transaction: t
    });

    if (!reservation) {
      await t.rollback();
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ error: "Reservation already cancelled" });
    }

    if (reservation.status === 'checkedIn') {
      await t.rollback();
      return res.status(400).json({ error: "Cannot cancel after check-in" });
    }

    // Update reservation status
    await reservation.update({
      status: 'cancelled',
      notes: `${reservation.notes || ''}\nCancelled: ${reason}`.trim()
    }, { transaction: t });

    // Process refund if applicable
    if (refundAmount && refundAmount > 0) {
      // Find existing payments
      const payments = await Payment.findAll({
        where: { reservationId: id },
        transaction: t
      });

      if (payments.length > 0) {
        // Create refund record
        const payment = payments[0]; // Use first payment for refund
        await payment.processRefund(refundAmount, `Cancellation refund: ${reason}`, req.user?.id);
      }
    }

    // Update room availability
    if (reservation.Room) {
      await reservation.Room.update({
        status: 'available'
      }, { transaction: t });
    }

    // Remove guest association from cancelled reservation but keep guest record
    if (reservation.Guest) {
      console.log(`Removing guest association from reservation ${id} - keeping guest record for history`);
      
      // Clear the guest association from this reservation
      await reservation.update({
        GuestId: null
      }, { transaction: t });
    }

    await t.commit();

    res.json({
      message: "Reservation cancelled successfully",
      reservation: {
        id: reservation.id,
        status: 'cancelled',
        cancellationFee: cancellationFee || 0,
        refundAmount: refundAmount || 0
      }
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: `Cancellation failed: ${error.message}` });
  }
});

// Get billing summary for checkout
app.get("/api/billing/generate/:reservationId", authenticateToken, async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findByPk(reservationId, {
      include: [Guest, Room]
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Calculate nights
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Get existing payments
    const payments = await Payment.findAll({
      where: { reservationId },
      order: [['createdAt', 'DESC']]
    });

    const paidAmount = payments.reduce((sum, payment) => {
      return payment.status === 'completed' ? sum + parseFloat(payment.amount) : sum;
    }, 0);

    // Basic calculation (can be enhanced with extra charges)
    const roomRate = reservation.totalPrice / nights;
    const subtotal = reservation.totalPrice;
    const taxAmount = subtotal * 0.12;
    const totalAmount = subtotal + taxAmount;
    const balanceAmount = totalAmount - paidAmount;

    const billingSummary = {
      reservationId: reservation.id,
      guestName: `${reservation.Guest.firstName} ${reservation.Guest.lastName}`,
      roomNumber: reservation.Room.number,
      checkInDate: reservation.checkIn,
      checkOutDate: reservation.checkOut,
      nights,
      roomRate,
      roomSubtotal: subtotal,
      serviceCharges: [], // TODO: Implement service charges
      servicesSubtotal: 0,
      taxRate: 0.12,
      taxAmount,
      serviceFee: 0,
      subtotal,
      totalAmount,
      paidAmount,
      balanceAmount,
      payments: payments.map(p => ({
        id: p.id,
        amount: parseFloat(p.amount),
        method: p.paymentMethod,
        reference: p.referenceNumber,
        processedAt: p.createdAt,
        status: p.status
      }))
    };

    res.json(billingSummary);

  } catch (error) {
    res.status(500).json({ error: `Failed to generate bill: ${error.message}` });
  }
});

// Get all payments
app.get("/api/payments", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    
    // Filter by date range if provided
    if (startDate && endDate) {
      where.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }
    
    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Guest,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Reservation,
          attributes: ['id', 'checkIn', 'checkOut'],
          include: [{
            model: Room,
            attributes: ['roomNumber']
          }]
        }
      ],
      order: [['paymentDate', 'DESC'], ['createdAt', 'DESC']]
    });

    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      reservationId: payment.reservationId,
      guestId: payment.guestId,
      invoiceId: payment.invoiceId,
      amount: parseFloat(payment.amount),
      currency: payment.currency || 'USD',
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paymentDate: payment.paymentDate || payment.createdAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      Guest: payment.Guest ? {
        firstName: payment.Guest.firstName,
        lastName: payment.Guest.lastName
      } : undefined,
      Reservation: payment.Reservation ? {
        room: payment.Reservation.Room?.roomNumber || 'N/A',
        checkIn: payment.Reservation.checkIn,
        checkOut: payment.Reservation.checkOut
      } : undefined
    }));

    return res.json(transformedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: `Failed to fetch payments: ${error.message}` });
  }
});

// Get all invoices
app.get("/api/invoices", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    
    // Filter by date range if provided
    if (startDate && endDate) {
      where.issueDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }
    
    const invoices = await Invoice.findAll({
      where,
      include: [
        {
          model: Guest,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Reservation,
          attributes: ['id'],
          include: [{
            model: Room,
            attributes: ['roomNumber']
          }]
        }
      ],
      order: [['issueDate', 'DESC'], ['createdAt', 'DESC']]
    });

    const transformedInvoices = invoices.map((invoice) => {
      const balanceAmount = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount || 0);
      
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        reservationId: invoice.reservationId,
        guestId: invoice.guestId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: parseFloat(invoice.subtotal),
        taxAmount: parseFloat(invoice.taxAmount),
        taxRate: parseFloat(invoice.taxRate),
        discountAmount: parseFloat(invoice.discountAmount),
        totalAmount: parseFloat(invoice.totalAmount),
        paidAmount: parseFloat(invoice.paidAmount || 0),
        balanceAmount: balanceAmount,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        currency: invoice.currency || 'USD',
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        Guest: invoice.Guest ? {
          firstName: invoice.Guest.firstName,
          lastName: invoice.Guest.lastName
        } : undefined,
        Reservation: invoice.Reservation ? {
          room: invoice.Reservation.Room?.roomNumber || 'N/A'
        } : undefined
      };
    });

    return res.json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ error: `Failed to fetch invoices: ${error.message}` });
  }
});

// Generate invoices for reservations that don't have invoices
app.post("/api/invoices/generate", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Find reservations that don't have invoices and are not cancelled
    const reservationsWithoutInvoices = await Reservation.findAll({
      where: {
        status: { [Op.in]: ['confirmed', 'checkedIn', 'checkedOut'] }
      },
      include: [
        {
          model: Guest,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Room,
          attributes: ['id', 'roomNumber']
        }
      ],
      transaction: t
    });

    const existingInvoices = await Invoice.findAll({
      attributes: ['reservationId'],
      transaction: t
    });

    const reservationIdsWithInvoices = new Set(existingInvoices.map(inv => inv.reservationId));
    
    const reservationsToInvoice = reservationsWithoutInvoices.filter(
      res => !reservationIdsWithInvoices.has(res.id)
    );

    const createdInvoices = [];

    for (const reservation of reservationsToInvoice) {
      // Calculate amounts
      const subtotal = parseFloat(reservation.totalPrice) || 0;
      const taxRate = 0.12;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = `INV-${reservation.id}-${Date.now()}`;
      
      // Set issue date to check-in date or today
      const issueDateObj = reservation.checkIn ? new Date(reservation.checkIn) : new Date();
      const issueDate = issueDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const dueDateObj = new Date(issueDateObj);
      dueDateObj.setDate(dueDateObj.getDate() + 30); // 30 days from issue date
      const dueDate = dueDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      // Check if there are any payments for this reservation
      const payments = await Payment.findAll({
        where: { reservationId: reservation.id },
        transaction: t
      });

      const paidAmount = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Determine status based on payment
      let status = 'sent';
      let paymentStatus = 'unpaid';
      if (paidAmount >= totalAmount) {
        status = 'paid';
        paymentStatus = 'paid';
      } else if (paidAmount > 0) {
        paymentStatus = 'partial';
      }

      // Check if overdue
      if (new Date() > dueDate && paymentStatus !== 'paid') {
        status = 'overdue';
      }

      const invoice = await Invoice.create({
        reservationId: reservation.id,
        guestId: reservation.GuestId,
        invoiceNumber,
        issueDate,
        dueDate,
        subtotal,
        taxAmount,
        taxRate,
        discountAmount: 0,
        totalAmount,
        paidAmount,
        status,
        paymentStatus,
        currency: 'PHP'
      }, { transaction: t });

      createdInvoices.push({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        reservationId: reservation.id
      });
    }

    await t.commit();

    res.json({
      message: `Generated ${createdInvoices.length} invoice(s)`,
      invoices: createdInvoices
    });

  } catch (error) {
    await t.rollback();
    console.error('Error generating invoices:', error);
    return res.status(500).json({ error: `Failed to generate invoices: ${error.message}` });
  }
});

// ==================== CASHBOOK ENDPOINTS ====================

// Get daily cash register summary
app.get("/api/cashbook/daily-register", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get previous day's closing balance (opening balance for today)
    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevStartOfDay = new Date(previousDay);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDay);
    prevEndOfDay.setHours(23, 59, 59, 999);

    // Get previous day's payments to calculate opening balance
    // Use createdAt if paymentDate is null
    const prevDayPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [prevStartOfDay, prevEndOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [prevStartOfDay, prevEndOfDay]
            }
          }
        ],
        status: 'completed',
        paymentMethod: 'cash'
      }
    });

    const prevDayCashIn = prevDayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    // Get previous day's cash transactions (if any) - for now use 0 as default opening
    const openingBalance = prevDayCashIn || 0;

    // Get today's cash payments (cash in)
    // Use createdAt if paymentDate is null
    const cashInPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [startOfDay, endOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        ],
        status: 'completed',
        paymentMethod: 'cash'
      }
    });

    const cashIn = cashInPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Cash out would be from refunds or other cash transactions
    // For now, we'll calculate from refunded payments
    // Use createdAt if paymentDate is null
    const cashOutPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [startOfDay, endOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        ],
        status: 'refunded',
        paymentMethod: 'cash'
      }
    });

    const cashOut = cashOutPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const closingBalance = openingBalance + cashIn - cashOut;
    const transactionCount = cashInPayments.length + cashOutPayments.length;

    res.json({
      date: targetDate.toISOString().split('T')[0],
      openingBalance,
      cashIn,
      cashOut,
      closingBalance,
      transactionCount
    });

  } catch (error) {
    console.error('Error fetching daily cash register:', error);
    return res.status(500).json({ error: `Failed to fetch daily cash register: ${error.message}` });
  }
});

// Get cash transactions for a date
app.get("/api/cashbook/transactions", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get cash payments (cash in)
    // Use createdAt if paymentDate is null
    const cashInPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [startOfDay, endOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        ],
        status: 'completed',
        paymentMethod: 'cash'
      },
      include: [
        {
          model: Guest,
          attributes: ['firstName', 'lastName']
        },
        {
          model: Reservation,
          attributes: ['id']
        }
      ],
      order: [['paymentDate', 'DESC'], ['createdAt', 'DESC']]
    });

    // Get cash refunds (cash out)
    // Use createdAt if paymentDate is null
    const cashOutPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [startOfDay, endOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        ],
        status: 'refunded',
        paymentMethod: 'cash'
      },
      include: [
        {
          model: Guest,
          attributes: ['firstName', 'lastName']
        },
        {
          model: Reservation,
          attributes: ['id']
        }
      ],
      order: [['paymentDate', 'DESC'], ['createdAt', 'DESC']]
    });

    const transactions = [];

    // Map cash in payments
    cashInPayments.forEach(payment => {
      const transactionDate = payment.paymentDate || payment.createdAt;
      transactions.push({
        id: payment.id,
        type: 'in',
        amount: parseFloat(payment.amount),
        description: `Payment from ${payment.Guest ? `${payment.Guest.firstName} ${payment.Guest.lastName}` : 'Guest'}`,
        category: 'Payment',
        transactionDate: transactionDate,
        notes: payment.notes || undefined,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      });
    });

    // Map cash out payments (refunds)
    cashOutPayments.forEach(payment => {
      const transactionDate = payment.paymentDate || payment.createdAt;
      transactions.push({
        id: payment.id,
        type: 'out',
        amount: parseFloat(payment.amount),
        description: `Refund to ${payment.Guest ? `${payment.Guest.firstName} ${payment.Guest.lastName}` : 'Guest'}`,
        category: 'Refund',
        transactionDate: transactionDate,
        notes: payment.notes || undefined,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      });
    });

    res.json(transactions);

  } catch (error) {
    console.error('Error fetching cash transactions:', error);
    return res.status(500).json({ error: `Failed to fetch cash transactions: ${error.message}` });
  }
});

// Get petty cash information
app.get("/api/cashbook/petty-cash", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    // Petty cash is not yet implemented in the database
    // Return null with 200 status to indicate feature not available (not an error)
    return res.status(200).json(null);
  } catch (error) {
    console.error('Error fetching petty cash:', error);
    return res.status(500).json({ error: `Failed to fetch petty cash: ${error.message}` });
  }
});

// Get shift handover records
app.get("/api/cashbook/shift-handovers", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    // Shift handover is not yet implemented in the database
    // Return empty array for now
    return res.json([]);
  } catch (error) {
    console.error('Error fetching shift handovers:', error);
    return res.status(500).json({ error: `Failed to fetch shift handovers: ${error.message}` });
  }
});

// Get cash reconciliation
app.get("/api/cashbook/reconciliation", authenticateToken, requireAnyPermission(['PAYMENTS_VIEW_ALL', 'PAYMENTS_RECORD']), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all cash payments for the day
    // Use createdAt if paymentDate is null
    const cashPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [startOfDay, endOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        ],
        paymentMethod: 'cash',
        status: 'completed'
      }
    });

    const cashIn = cashPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    // Get cash refunds
    // Use createdAt if paymentDate is null
    const cashRefunds = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [startOfDay, endOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        ],
        paymentMethod: 'cash',
        status: 'refunded'
      }
    });

    const cashOut = cashRefunds.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Calculate expected cash (this would normally come from register count)
    // For now, we'll use the calculated closing balance
    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevStartOfDay = new Date(previousDay);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDay);
    prevEndOfDay.setHours(23, 59, 59, 999);

    // Use createdAt if paymentDate is null
    const prevDayPayments = await Payment.findAll({
      where: {
        [Op.or]: [
          {
            paymentDate: {
              [Op.between]: [prevStartOfDay, prevEndOfDay]
            }
          },
          {
            paymentDate: null,
            createdAt: {
              [Op.between]: [prevStartOfDay, prevEndOfDay]
            }
          }
        ],
        status: 'completed',
        paymentMethod: 'cash'
      }
    });

    const openingBalance = prevDayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    const expectedCash = openingBalance + cashIn - cashOut;

    // Actual cash would come from physical count - for now return expected
    const actualCash = expectedCash;
    const variance = actualCash - expectedCash;

    res.json({
      date: targetDate.toISOString().split('T')[0],
      expectedCash,
      actualCash,
      variance,
      discrepancies: variance !== 0 ? [`Cash variance of ₱${Math.abs(variance).toLocaleString()}`] : []
    });

  } catch (error) {
    console.error('Error fetching reconciliation:', error);
    return res.status(500).json({ error: `Failed to fetch reconciliation: ${error.message}` });
  }
});

// Record cash in transaction
app.post("/api/cashbook/cash-in", authenticateToken, requirePermission('PAYMENTS_RECORD'), async (req, res) => {
  try {
    const { amount, description, category, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    // For now, cash in transactions are recorded as payments
    // In a full implementation, you'd have a separate CashTransaction model
    return res.status(501).json({ error: 'Cash in recording not yet fully implemented. Use payment recording instead.' });

  } catch (error) {
    console.error('Error recording cash in:', error);
    return res.status(500).json({ error: `Failed to record cash in: ${error.message}` });
  }
});

// Record cash out transaction
app.post("/api/cashbook/cash-out", authenticateToken, requirePermission('PAYMENTS_RECORD'), async (req, res) => {
  try {
    const { amount, description, category, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    // For now, cash out transactions would be recorded as refunds or expenses
    // In a full implementation, you'd have a separate CashTransaction model
    return res.status(501).json({ error: 'Cash out recording not yet fully implemented. Use refund recording instead.' });

  } catch (error) {
    console.error('Error recording cash out:', error);
    return res.status(500).json({ error: `Failed to record cash out: ${error.message}` });
  }
});

app.get("/api/rooms", authenticateToken, requirePermission('ROOMS_VIEW'), async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [
        {
          model: RoomType,
          attributes: ["typeName", "description", "maxCapacity", "basePrice"],
        },
      ],
      where: { isActive: true },
      order: [["roomNumber", "ASC"]],
    });

    const transformedRooms = rooms.map((room) => ({
      id: room.roomNumber, // might change this later lol
      number: room.roomNumber,
      type: room.RoomType?.typeName || "Standard",
      status: room.status,
      statusColor: room.statusColor,
      pricePerNight: room.pricePerNight,
      floorNumber: room.floorNumber,
      maxCapacity: room.RoomType?.maxCapacity || 2,
      amenities: room.amenities ? JSON.parse(room.amenities) : [],
      notes: room.notes,
    }));

    return res.json(transformedRooms);
  } catch (error) {
    return res.status(500).json({ error: `Database error: ${error.message}` });
  }
});

app.post("/api/admin/rooms", authenticateToken, requirePermission('ROOMS_CREATE'), async (req, res) => {
  try {
    const {
      roomNumber,
      roomTypeId,
      pricePerNight,
      floorNumber,
      amenities,
      notes,
    } = req.body;

    if (!roomNumber || !roomTypeId || !pricePerNight || !floorNumber) {
      return res
        .status(400)
        .json({
          error:
            "Required fields: roomNumber, roomTypeId, pricePerNight, floorNumber",
        });
    }

    const existingRoom = await Room.findOne({ where: { roomNumber } });
    if (existingRoom) {
      return res.status(409).json({ error: "Room number already exists" });
    }

    const room = await Room.create({
      roomNumber,
      RoomTypeId: roomTypeId,
      pricePerNight,
      floorNumber,
      amenities: amenities ? JSON.stringify(amenities) : null,
      notes,
    });

    res.status(201).json({
      message: "Room created successfully",
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        status: room.status,
        pricePerNight: room.pricePerNight,
        floorNumber: room.floorNumber,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error creating room: ${error.message}` });
  }
});

app.put("/api/admin/rooms/:id", authenticateToken, requirePermission('ROOMS_EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pricePerNight, amenities, notes, isActive } = req.body;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    await room.update({
      status: status || room.status,
      pricePerNight: pricePerNight || room.pricePerNight,
      amenities: amenities ? JSON.stringify(amenities) : room.amenities,
      notes: notes !== undefined ? notes : room.notes,
      isActive: isActive !== undefined ? isActive : room.isActive,
      statusColor: getStatusColor(status || room.status),
    });

    res.json({ message: "Room updated successfully", room });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error updating room: ${error.message}` });
  }
});

app.delete("/api/admin/rooms/:id", authenticateToken, requirePermission('ROOMS_DELETE'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (permanent === "true") {
      await room.destroy();
      res.json({ message: "Room permanently deleted" });
    } else {
      await room.update({ isActive: false });
      res.json({ message: "Room deactivated" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error deleting room: ${error.message}` });
  }
});

app.get("/api/room-types", authenticateToken, requirePermission('ROOMS_VIEW'), async (req, res) => {
  try {
    const room_types = await RoomType.findAll();
    return res.send(room_types);
  } catch (error) {
    res.status(500).json({ error: "Error fetching room-types." });
  }
});

app.get("/api/guests", authenticateToken, requireAnyPermission(['GUESTS_VIEW_ALL', 'GUESTS_VIEW_LIMITED']), async (req, res) => {
  try {
    const guest = await Guest.findAll();
    return res.send(guest);
  } catch (error) {
    return res.status(500).json({ error: "No Guests were found." });
  }
});

app.post("/api/guests", authenticateToken, requirePermission('GUESTS_CREATE'), async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      address,
      idDocument,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !idDocument
    ) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const guest = await Guest.create({
      firstName,
      middleName: middleName || null,
      lastName,
      email,
      phone,
      address,
      idDocument,
    });

    res.status(201).json({ guest });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error creating guest: ${error.message}` });
  }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const FORCE_SYNC = process.env.FORCE_SYNC === "true";
const SEED_ON_START = process.env.SEED_ON_START === "true" || FORCE_SYNC;

sequelize
  .sync({ force: FORCE_SYNC })
  .then(async () => {
    try {
      await sequelize.query("PRAGMA journal_mode = WAL;");
      await sequelize.query("PRAGMA busy_timeout = 10000;");
    } catch (e) {}

    const roomCount = await Room.count();
    const roomTypeCount = await RoomType.count();

    if (SEED_ON_START || roomCount === 0 || roomTypeCount === 0) {
      await seedData();
    } else {
    }

    app.listen(PORT, () => {});
  })
  .catch((err) => {
    process.exit(1);
  });
