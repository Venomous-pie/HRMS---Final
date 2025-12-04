import { sequelize, Guest, Reservation, Room } from '../models/index.js';

// 🎯 SMART GUEST GENERATION ALGORITHMS FOR 200+ RESERVATIONS!
// Generate unique guests using combinatorial name generation (4^4 = 256+ combinations)

// Base name components for combinatorial generation
const firstNames = [
  'Maria', 'Juan', 'Ana', 'Carlos', 'Sofia', 'Miguel', 'Isabella', 'Rafael', 
  'Camila', 'Diego', 'Valentina', 'Sebastian', 'Lucia', 'Mateo', 'Gabriela', 'Alejandro',
  'Fernanda', 'Nicolas', 'Valeria', 'Emilio', 'Adriana', 'Leonardo', 'Martina', 'Santiago',
  'Renata', 'Ricardo', 'Carmen', 'Eduardo', 'Patricia', 'Francisco', 'Elena', 'Manuel',
  'Rosa', 'Antonio', 'Luz', 'Jose', 'Esperanza', 'Roberto', 'Gloria', 'Fernando'
];

const lastNames = [
  'Santos', 'Cruz', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Morales',
  'Ramos', 'Castillo', 'Herrera', 'Jimenez', 'Vargas', 'Romero', 'Aguilar', 'Medina',
  'Castro', 'Ortega', 'Ruiz', 'Guerrero', 'Peña', 'Soto', 'Contreras', 'Silva',
  'Mendez', 'Villanueva', 'Bautista', 'Navarro', 'Moreno', 'Gutierrez', 'Alvarez', 'Serrano',
  'Blanco', 'Molina', 'Ortiz', 'Delgado', 'Diaz', 'Rivera', 'Gomez', 'Martinez'
];

// Jumbled place names that almost make sense 🏙️
const scrambledPlaces = [
  'Makati Ville', 'Quezon Heights', 'Cebu Vista', 'Davao Springs', 'Iloilo Bay', 'Baguio Hills',
  'Cagayan Ridge', 'Bacolod Plaza', 'Zamboanga Port', 'General Santos Park', 'Tacloban Shore',
  'Puerto Palawan', 'Butuan Valley', 'Legazpi Point', 'Naga Centro', 'Dumaguete Coast',
  'Tagbilaran Isle', 'Vigan Square', 'Laoag Fields', 'Tuguegarao Mesa', 'San Fernando Grove',
  'Malolos Garden', 'Antipolo Ridge', 'Calamba Lakes', 'Batangas Harbor', 'Taguig Metro',
  'Pasig River', 'Mandaluyong Central', 'San Juan Plaza', 'Marikina Valley', 'Paranaque Bay',
  'Las Pinas Village', 'Muntinlupa Hills', 'Valenzuela Park', 'Malabon Creek', 'Navotas Port',
  'Caloocan Heights', 'Imus Gardens', 'Dasmarinas Vista', 'Bacoor Bay', 'General Trias Square',
  'Trece Martires Plaza', 'Tagaytay Ridge', 'San Pablo Lakes', 'Sta Rosa Valley', 'Binan Creek',
  'Cabuyao Industrial', 'San Pedro Metro', 'Silang Hills', 'Carmona Gardens', 'Kawit Bay'
];

// Smart guest generation function
function generateGuests(count = 250) {
  const guests = [];
  const nationalities = [
    'Filipino', 'American', 'Japanese', 'Korean', 'Chinese', 'Australian', 'British', 'Canadian', 'German', 'French',
    'Singaporean', 'Malaysian', 'Indonesian', 'Vietnamese', 'Thai', 'Indian', 'Spanish', 'Italian', 'Dutch', 'Swedish'
  ];
  const notesList = [
    'VIP guest', 'Prefers quiet rooms', 'Allergic to peanuts', 'Frequent late checkouts', 'Requires airport pickup',
    'Special dietary needs', 'Loyalty member', 'Complained about wifi', 'Left positive review', 'Requested extra pillows',
    'Group traveler', 'Corporate account', 'Family with kids', 'Solo traveler', 'Early riser', 'Night owl', 'Repeat guest',
    'Has pet', 'Smoker', 'Non-smoker'
  ];
  for (let i = 0; i < count; i++) {
    // Combinatorial name selection (creates unique combinations)
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    // Generate random ID with realistic format
    const idNumber = `ID-${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
    // Generate random phone number
    const phoneNumber = `+639${Math.floor(Math.random() * 900000000) + 100000000}`;
    // Select scrambled place
    const address = scrambledPlaces[i % scrambledPlaces.length];
    // Generate email
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
    // Nationality
    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    // Total stays (1-10)
    const totalStays = Math.floor(Math.random() * 10) + 1;
    // Last visited (random date in past 2 years)
    const now = new Date();
    const pastDays = Math.floor(Math.random() * 730); // up to 2 years
    const lastVisited = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000);
    // Total spent (₱2,000 - ₱250,000)
    const totalSpent = (Math.floor(Math.random() * 249) + 2) * 1000;
    // Random notes/tags for some guests
    let notes = '';
    if (Math.random() < 0.35) {
      notes = notesList[Math.floor(Math.random() * notesList.length)];
    }
    // Random order count (1-7)
    const orderCount = Math.floor(Math.random() * 7) + 1;
    guests.push({
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      address,
      idDocument: idNumber,
      nationality,
      totalStays,
      lastVisited,
      totalSpent,
      notes,
      orderCount
    });
  }
  return guests;
}

// Generate 500 unique guests using the algorithm (more guests = more reservations!)
const sampleGuests = generateGuests(500);

// Reservation statuses with profitable distribution (business is booming! 💰)
const reservationStatuses = [
  { status: 'confirmed', weight: 45 }, // 45% confirmed - high demand
  { status: 'checkedIn', weight: 35 }, // 35% checked in - busy hotel
  { status: 'checkedOut', weight: 18 }, // 18% checked out - satisfied customers
  { status: 'pending', weight: 1.5 },  // 1.5% pending - quick confirmations
  { status: 'cancelled', weight: 0.5 } // 0.5% cancelled - excellent retention
];

// Booking sources with profitable distribution (premium clientele! 🏆)
const bookingSources = [
  { source: 'Corporate', weight: 35 },        // 35% corporate - high-paying business travelers
  { source: 'Direct Booking', weight: 30 },  // 30% direct - loyal customers
  { source: 'Online Travel Agency', weight: 25 }, // 25% OTA - good reach
  { source: 'Walk-in', weight: 10 }          // 10% walk-in - premium location
];

// Helper function to get weighted random selection
function getWeightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.status || item.source;
    }
  }
  return items[0].status || items[0].source;
}

// Helper function to add days to date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function seedReservations() {
  try {
    console.log('🌱 Starting MASSIVE reservation seeder for 200+ reservations...');
    
    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check existing data
    const existingReservations = await Reservation.count();
    const existingGuests = await Guest.count();
    console.log(`📊 Existing data: ${existingReservations} reservations, ${existingGuests} guests`);
    
    // Get all available rooms
    const rooms = await Room.findAll();
    console.log(`📊 Found ${rooms.length} rooms in database`);
    
    if (rooms.length === 0) {
      throw new Error('No rooms found in database. Please seed rooms first.');
    }
    
    // 🗓️ EXTENDED DATE RANGE: September 1 to Future Advance Bookings
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 8, 1); // September 1 (month 8 = September)
    const currentEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Add advance booking period (next 90 days for future reservations)
    const futureEndDate = new Date(today);
    futureEndDate.setDate(today.getDate() + 90); // 90 days into the future
    
    // Calculate days for different periods
    const historicalDays = Math.ceil((currentEndDate - startDate) / (1000 * 60 * 60 * 24));
    const futureDays = 90; // Future booking window
    const totalDays = historicalDays + futureDays;
    
    console.log(`📅 EXTENDED Date Range:`);
    console.log(`  Historical: ${startDate.toDateString()} to ${currentEndDate.toDateString()} (${historicalDays} days)`);
    console.log(`  Future: ${today.toDateString()} to ${futureEndDate.toDateString()} (${futureDays} days)`);
    console.log(`  Total span: ${totalDays} days`);
    
    // 🎯 CALCULATE MASSIVE RESERVATION COUNT INCLUDING ADVANCE BOOKINGS
    // Historical + Current + Future advance reservations
    const avgOccupancyPerDay = 0.85; // 85% average occupancy (thriving hotel!)
    const avgStayLength = 2.1; // Average 2.1 nights (shorter stays = more turnover)
    const totalPossibleReservations = Math.floor((rooms.length * totalDays * avgOccupancyPerDay) / avgStayLength);
    const targetReservations = Math.min(totalPossibleReservations, sampleGuests.length, 450); // Much higher cap!
    
    console.log(`🎯 MASSIVE SEEDING CALCULATION:`);
    console.log(`  - Rooms: ${rooms.length}`);
    console.log(`  - Total days: ${totalDays}`);
    console.log(`  - Target reservations: ${targetReservations}`);
    console.log(`  - Expected occupancy: ${Math.round(avgOccupancyPerDay * 100)}%`);
    
    const reservationsToCreate = [];
    const guestsToCreate = [];
    
    // Track room bookings to prevent date overlap
    const roomBookings = new Map(); // roomId -> array of {checkIn, checkOut} periods
    
    // Helper function to check if two date ranges overlap (improved with proper date handling)
    const datesOverlap = (start1, end1, start2, end2) => {
      // Normalize dates to avoid time zone issues
      const s1 = new Date(start1.getFullYear(), start1.getMonth(), start1.getDate());
      const e1 = new Date(end1.getFullYear(), end1.getMonth(), end1.getDate());
      const s2 = new Date(start2.getFullYear(), start2.getMonth(), start2.getDate());
      const e2 = new Date(end2.getFullYear(), end2.getMonth(), end2.getDate());
      
      // Check for overlap: start1 < end2 AND start2 < end1
      return s1 < e2 && s2 < e1;
    };
    
    // Helper function to find available room for given dates
    const findAvailableRoom = (checkIn, checkOut, preferPremium = false) => {
      // Sort rooms to prioritize premium rooms if requested
      const sortedRooms = [...rooms].sort((a, b) => {
        if (preferPremium) {
          return b.pricePerNight - a.pricePerNight; // Higher price first
        }
        return Math.random() - 0.5; // Random order otherwise
      });
      
      for (const room of sortedRooms) {
        const existingBookings = roomBookings.get(room.id) || [];
        
        // Check if this room is available for these dates
        const hasOverlap = existingBookings.some(booking => 
          datesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)
        );
        
        if (!hasOverlap) {
          return room;
        }
      }
      return null; // No available room found
    };
    
    console.log(`🌊 Creating ${targetReservations} reservations with WAVY PATTERNS + ADVANCE BOOKINGS! 📊🚀✨`);
    
    // Create reservations with improved overlap prevention
    let successfulReservations = 0;
    let attempts = 0;
    const maxAttempts = targetReservations * 3; // Allow more attempts to find available slots
    
    while (successfulReservations < targetReservations && attempts < maxAttempts) {
      attempts++;
      const guestData = sampleGuests[successfulReservations % sampleGuests.length];
      
      let stayDuration = Math.floor(Math.random() * 4) + 1; // 1-4 nights
      let status = getWeightedRandom(reservationStatuses);
      
      // 🗓️ SMART DATE DISTRIBUTION: Historical + Current + ADVANCE BOOKINGS
      let finalCheckIn, finalCheckOut;
      const reservationType = Math.random();
      
      // Smart booking source selection based on advance booking patterns
      let bookingSource;
      if (reservationType >= 0.6) {
        // ADVANCE BOOKINGS have different source patterns 🚀
        const advanceBookingSources = [
          { source: 'Online Travel Agency', weight: 45 },  // 45% OTA for advance bookings
          { source: 'Direct Booking', weight: 35 },        // 35% direct website bookings
          { source: 'Corporate', weight: 18 },             // 18% corporate advance bookings
          { source: 'Walk-in', weight: 2 }                 // 2% rare advance walk-ins
        ];
        bookingSource = getWeightedRandom(advanceBookingSources);
      } else {
        // Historical bookings use normal distribution
        bookingSource = getWeightedRandom(bookingSources);
      }
      
      if (reservationType < 0.4) {
        // 40% - Historical reservations (September 1 to today)
        const randomDayOffset = Math.floor(Math.random() * historicalDays);
        finalCheckIn = new Date(startDate);
        finalCheckIn.setDate(startDate.getDate() + randomDayOffset);
      } else if (reservationType < 0.7) {
        // 30% - CURRENT PERIOD (last 7 days to next 7 days) for high current occupancy! 🔥
        const currentPeriodStart = new Date(today);
        currentPeriodStart.setDate(today.getDate() - 7);
        const currentPeriodDays = 14; // 7 days before + 7 days after today
        const randomDayOffset = Math.floor(Math.random() * currentPeriodDays);
        finalCheckIn = new Date(currentPeriodStart);
        finalCheckIn.setDate(currentPeriodStart.getDate() + randomDayOffset);
      } else {
        // 30% - ADVANCE BOOKINGS (today to 90 days in future) 🚀
        const futureDayOffset = Math.floor(Math.random() * futureDays);
        finalCheckIn = new Date(today);
        finalCheckIn.setDate(today.getDate() + futureDayOffset);
      }
      
      // Create WAVY occupancy patterns! 🌊
      const dayOfWeek = finalCheckIn.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      const isFriday = dayOfWeek === 5;
      const isSaturday = dayOfWeek === 6;
      
      // Weekend boost multipliers
      let weekendMultiplier = 0.4; // Low weekday base
      if (isFriday) weekendMultiplier = 2.0; // Friday peak
      if (isSaturday) weekendMultiplier = 2.3; // Saturday highest
      if (dayOfWeek === 0) weekendMultiplier = 1.6; // Sunday good
      if (dayOfWeek === 4) weekendMultiplier = 1.1; // Thursday pre-weekend
      
      // Multiple wave patterns for complexity
      const daysFromStart = Math.floor((finalCheckIn - startDate) / (1000 * 60 * 60 * 24));
      const primaryWave = Math.sin((daysFromStart / 30) * Math.PI * 2) * 0.3 + 1; // Monthly cycle
      const secondaryWave = Math.sin((daysFromStart / 7) * Math.PI * 2) * 0.2 + 1; // Weekly cycle
      const randomNoise = (Math.random() - 0.5) * 0.4 + 1;
      
      // Combine all wave patterns
      const occupancyFactor = weekendMultiplier * primaryWave * secondaryWave * randomNoise;
      
      // Skip fewer bookings to maintain high occupancy (only skip 10% in low periods)
      if (occupancyFactor < 0.7 && Math.random() < 0.1) {
        continue; // Skip this reservation to create small valleys
      }
      
      // Adjust stay duration based on weekend vs weekday
      stayDuration = isWeekend ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
      finalCheckOut = addDays(finalCheckIn, stayDuration);
      
      // Set status based on date relative to today with ADVANCE BOOKING logic
      if (finalCheckOut < today) {
        status = 'checkedOut'; // Past reservations are checked out
      } else if (finalCheckIn <= today && finalCheckOut > today) {
        status = 'checkedIn'; // Current guests
      } else {
        // ADVANCE BOOKING STATUS LOGIC 🚀
        const daysUntilArrival = Math.ceil((finalCheckIn - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilArrival <= 7) {
          // Within 1 week - mostly confirmed
          status = Math.random() < 0.95 ? 'confirmed' : 'pending';
        } else if (daysUntilArrival <= 30) {
          // 1-4 weeks ahead - high confirmation rate
          status = Math.random() < 0.85 ? 'confirmed' : 'pending';
        } else {
          // More than 1 month ahead - more pending bookings
          status = Math.random() < 0.65 ? 'confirmed' : 'pending';
        }
      }
      
      // Enhanced room selection with better error handling
      const preferPremium = bookingSource === 'Corporate' || (isWeekend && Math.random() < 0.4);
      const room = findAvailableRoom(finalCheckIn, finalCheckOut, preferPremium);
      
      if (!room) {
        // Try with different dates if no room available
        if (attempts % 10 === 0) {
          console.log(`⚠️ No available room found for attempt ${attempts} (${finalCheckIn.toDateString()} - ${finalCheckOut.toDateString()})`);
        }
        continue; // Try again with different dates
      }
      
      // Record this booking to prevent future overlaps
      if (!roomBookings.has(room.id)) {
        roomBookings.set(room.id, []);
      }
      roomBookings.get(room.id).push({
        checkIn: finalCheckIn,
        checkOut: finalCheckOut
      });
      
      // Calculate total price
      const nights = Math.ceil((finalCheckOut - finalCheckIn) / (1000 * 60 * 60 * 24));
      const totalPrice = room.pricePerNight * nights;
      
      // Create unique guest data
      const uniqueGuestData = {
        ...guestData,
        email: `${guestData.firstName.toLowerCase()}.${guestData.lastName.toLowerCase()}${successfulReservations}@email.com`,
        phone: `+639${Math.floor(Math.random() * 900000000) + 100000000}`
      };
      
      guestsToCreate.push(uniqueGuestData);
      
      reservationsToCreate.push({
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        totalPrice: totalPrice,
        status: status,
        specialRequests: Math.random() > 0.8 ? 'Late checkout requested' : null,
        bookingSource: bookingSource,
        numberOfGuests: Math.floor(Math.random() * 4) + 1, // 1-4 guests
        roomId: room.id,
        guestIndex: successfulReservations
      });
      
      successfulReservations++;
      
      if (successfulReservations % 50 === 0) {
        console.log(`📊 Progress: ${successfulReservations}/${targetReservations} reservations planned (${attempts} attempts)...`);
      }
    }
    
    console.log(`✅ Planned ${reservationsToCreate.length} reservations after ${attempts} attempts`);
    console.log(`🎯 Success rate: ${Math.round((successfulReservations / attempts) * 100)}%`);
    console.log('👥 Creating guest records...');
    
    // Create guests
    const createdGuests = [];
    for (let i = 0; i < guestsToCreate.length; i++) {
      try {
        const guest = await Guest.create(guestsToCreate[i]);
        createdGuests.push(guest);
        
        if (i % 50 === 0) {
          console.log(`👥 Created ${i + 1}/${guestsToCreate.length} guests...`);
        }
      } catch (guestError) {
        console.error(`❌ Failed to create guest ${i + 1}:`, guestError.message);
      }
    }
    
    console.log(`✅ Created ${createdGuests.length} guest records`);
    console.log('🏨 Creating reservation records...');
    
    // Create reservations
    const createdReservations = [];
    for (let i = 0; i < createdGuests.length; i++) {
      try {
        const reservationData = {
          checkIn: reservationsToCreate[i].checkIn,
          checkOut: reservationsToCreate[i].checkOut,
          totalPrice: reservationsToCreate[i].totalPrice,
          status: reservationsToCreate[i].status,
          specialRequest: reservationsToCreate[i].specialRequests,
          bookingSource: reservationsToCreate[i].bookingSource,
          numGuest: reservationsToCreate[i].numberOfGuests,
          GuestId: createdGuests[i].id,
          RoomId: reservationsToCreate[i].roomId
        };
        
        const reservation = await Reservation.create(reservationData);
        createdReservations.push(reservation);
        
        if (i % 50 === 0) {
          console.log(`🏨 Created ${i + 1}/${createdGuests.length} reservations...`);
        }
      } catch (reservationError) {
        console.error(`❌ Failed to create reservation ${i + 1}:`, reservationError.message);
      }
    }
    
    console.log(`✅ Created ${createdReservations.length} reservation records`);
    
    // Generate summary statistics
    const statusCounts = {};
    const sourceCounts = {};
    
    createdReservations.forEach(reservation => {
      statusCounts[reservation.status] = (statusCounts[reservation.status] || 0) + 1;
      sourceCounts[reservation.bookingSource] = (sourceCounts[reservation.bookingSource] || 0) + 1;
    });
    
    // Calculate advance booking statistics
    const advanceBookings = createdReservations.filter(r => new Date(r.checkIn) > today).length;
    const historicalBookings = createdReservations.filter(r => new Date(r.checkIn) <= today).length;
    
    console.log('\n🎉 MASSIVE SEEDING WITH ADVANCE BOOKINGS COMPLETED! 📊🚀');
    console.log(`📅 Historical Range: Sep 1 - ${today.toDateString()}`);
    console.log(`🚀 Advance Bookings: ${today.toDateString()} - ${futureEndDate.toDateString()}`);
    console.log(`🏨 Total Reservations: ${createdReservations.length}`);
    console.log(`  📊 Historical: ${historicalBookings} reservations`);
    console.log(`  🚀 Advance: ${advanceBookings} reservations`);
    console.log(`👥 Total Guests: ${createdGuests.length}`);
    console.log(`🏠 Rooms Used: ${roomBookings.size}/${rooms.length}`);
    
    console.log('\n📈 Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} reservations`);
    });
    
    console.log('\n📊 Booking Source Distribution:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} reservations`);
    });
    
    // Calculate ACTUAL occupancy rate for today (not just status count)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentlyOccupiedReservations = createdReservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      return ['confirmed', 'checkedIn'].includes(r.status) && 
             checkIn <= todayStart && 
             checkOut > todayStart;
    });
    
    const occupancyRate = Math.round((currentlyOccupiedReservations.length / rooms.length) * 100);
    
    console.log(`\n🏨 Current Occupancy Rate: ${occupancyRate}%`);
    console.log('🌊 WAVY DASHBOARD DATA READY! Your charts will look AMAZING! 📊✨');
    
    return {
      success: true,
      message: 'MASSIVE reservation seeding completed successfully',
      data: {
        guestsCreated: createdGuests.length,
        reservationsCreated: createdReservations.length,
        occupancyRate: occupancyRate,
        statusDistribution: statusCounts,
        sourceDistribution: sourceCounts,
        dateRange: `${startDate.toDateString()} to ${futureEndDate.toDateString()}`,
        daysSpanned: totalDays
      }
    };
    
  } catch (error) {
    console.error('❌ Error seeding reservations:', error);
    throw error;
  }
}

// Helper function to clear existing reservations (for testing)
export async function clearReservations() {
  try {
    console.log('🧹 Clearing existing invoice items, payments, invoices, reservations, and guests...');
    const { Payment, Invoice } = await import('../models/index.js');
  // Skipping InvoiceItems deletion (table does not exist)
  // Then delete Payments and Invoices
  await Payment.destroy({ where: {}, force: true });
  await Invoice.destroy({ where: {}, force: true });
  // Then Reservations and Guests
  await Reservation.destroy({ where: {}, force: true });
    await Guest.destroy({ where: {} });
    console.log('✅ Cleared all invoice items, payments, invoices, reservations, and guests');
    return {
      success: true,
      message: 'All invoice items, payments, invoices, reservations, and guests cleared successfully'
    };
  } catch (error) {
    console.error('❌ Error clearing reservations:', error);
    throw error;
  }
}
