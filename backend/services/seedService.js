import { Room, RoomType } from '../models/index.js';
import {
  roomTypesData,
  roomsData,
  getAmenitiesByType,
  getRoomTypeDescription,
  getStatusColor,
} from "../data/roomData.js";
import { seedAdminUser } from "./adminSeedService.js";

export const seedData = async () => {
  try {
    // Seed room types and rooms
    const roomTypes = await RoomType.bulkCreate(roomTypesData, {
      ignoreDuplicates: true,
    });

    const roomsWithColors = roomsData.map((room) => ({
      ...room,
      RoomTypeId: room.roomTypeId,
      statusColor: getStatusColor(room.status),
      amenities: JSON.stringify(getAmenitiesByType(room.roomTypeId)),
      notes: `${getRoomTypeDescription(room.roomTypeId)} on floor ${room.floorNumber}. ${
        room.floorNumber === 3
          ? "Premium location with enhanced services."
          : room.floorNumber === 2
            ? "Mid-level with great amenities."
            : "Ground level with easy access."
      }`,
    }));

    await Room.bulkCreate(roomsWithColors, { ignoreDuplicates: true });
    
    // Seed admin user
    await seedAdminUser();
    
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};
