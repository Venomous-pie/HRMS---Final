export const roomTypesData = [
  {
    typeName: "Standard Single",
    description: "Cozy single room with queen bed, perfect for solo travelers",
    maxCapacity: 1,
    basePrice: 75.0,
  },
  {
    typeName: "Deluxe Single",
    description: "Premium single room with king bed and city view",
    maxCapacity: 1,
    basePrice: 95.0,
  },
  {
    typeName: "Standard Double",
    description: "Comfortable double room with queen bed for couples",
    maxCapacity: 2,
    basePrice: 110.0,
  },
  {
    typeName: "Twin Room",
    description: "Room with two single beds, ideal for friends or colleagues",
    maxCapacity: 2,
    basePrice: 115.0,
  },
  {
    typeName: "Deluxe Double",
    description: "Spacious double room with king bed and balcony",
    maxCapacity: 2,
    basePrice: 140.0,
  },
  {
    typeName: "Triple Room",
    description: "Room with three single beds for small groups",
    maxCapacity: 3,
    basePrice: 160.0,
  },
  {
    typeName: "Family Suite",
    description: "Large family room with separate sleeping areas",
    maxCapacity: 4,
    basePrice: 200.0,
  },
  {
    typeName: "Executive Suite",
    description: "Luxury suite with living area and premium amenities",
    maxCapacity: 2,
    basePrice: 280.0,
  },
  {
    typeName: "Presidential Suite",
    description: "Ultimate luxury with multiple rooms and exclusive services",
    maxCapacity: 4,
    basePrice: 450.0,
  },
];

export const roomsData = [
  {
    roomNumber: "001",
    roomTypeId: 1,
    floorNumber: 0,
    pricePerNight: 75.0,
    status: "available",
  },
  {
    roomNumber: "002",
    roomTypeId: 1,
    floorNumber: 0,
    pricePerNight: 75.0,
    status: "available",
  },
  {
    roomNumber: "003",
    roomTypeId: 3,
    floorNumber: 0,
    pricePerNight: 110.0,
    status: "available",
  },
  {
    roomNumber: "004",
    roomTypeId: 3,
    floorNumber: 0,
    pricePerNight: 110.0,
    status: "available",
  },
  {
    roomNumber: "005",
    roomTypeId: 4,
    floorNumber: 0,
    pricePerNight: 115.0,
    status: "available",
  },

  {
    roomNumber: "101",
    roomTypeId: 2,
    floorNumber: 1,
    pricePerNight: 95.0,
    status: "available",
  },
  {
    roomNumber: "102",
    roomTypeId: 3,
    floorNumber: 1,
    pricePerNight: 110.0,
    status: "available",
  },
  {
    roomNumber: "103",
    roomTypeId: 4,
    floorNumber: 1,
    pricePerNight: 115.0,
    status: "available",
  },
  {
    roomNumber: "104",
    roomTypeId: 5,
    floorNumber: 1,
    pricePerNight: 140.0,
    status: "available",
  },
  {
    roomNumber: "105",
    roomTypeId: 4,
    floorNumber: 1,
    pricePerNight: 115.0,
    status: "available",
  },
  {
    roomNumber: "106",
    roomTypeId: 5,
    floorNumber: 1,
    pricePerNight: 140.0,
    status: "available",
  },
  {
    roomNumber: "107",
    roomTypeId: 6,
    floorNumber: 1,
    pricePerNight: 160.0,
    status: "available",
  },
  {
    roomNumber: "108",
    roomTypeId: 3,
    floorNumber: 1,
    pricePerNight: 110.0,
    status: "available",
  },
  {
    roomNumber: "109",
    roomTypeId: 6,
    floorNumber: 1,
    pricePerNight: 160.0,
    status: "available",
  },
  {
    roomNumber: "110",
    roomTypeId: 5,
    floorNumber: 1,
    pricePerNight: 140.0,
    status: "available",
  },

  {
    roomNumber: "201",
    roomTypeId: 7,
    floorNumber: 2,
    pricePerNight: 200.0,
    status: "available",
  },
  {
    roomNumber: "202",
    roomTypeId: 5,
    floorNumber: 2,
    pricePerNight: 145.0,
    status: "available",
  },
  {
    roomNumber: "203",
    roomTypeId: 7,
    floorNumber: 2,
    pricePerNight: 200.0,
    status: "available",
  },
  {
    roomNumber: "204",
    roomTypeId: 6,
    floorNumber: 2,
    pricePerNight: 165.0,
    status: "available",
  },
  {
    roomNumber: "205",
    roomTypeId: 8,
    floorNumber: 2,
    pricePerNight: 280.0,
    status: "available",
  },
  {
    roomNumber: "206",
    roomTypeId: 7,
    floorNumber: 2,
    pricePerNight: 200.0,
    status: "available",
  },
  {
    roomNumber: "207",
    roomTypeId: 8,
    floorNumber: 2,
    pricePerNight: 280.0,
    status: "available",
  },

  {
    roomNumber: "301",
    roomTypeId: 8,
    floorNumber: 3,
    pricePerNight: 290.0,
    status: "available",
  },
  {
    roomNumber: "302",
    roomTypeId: 8,
    floorNumber: 3,
    pricePerNight: 290.0,
    status: "available",
  },
  {
    roomNumber: "303",
    roomTypeId: 9,
    floorNumber: 3,
    pricePerNight: 450.0,
    status: "available",
  },
  {
    roomNumber: "304",
    roomTypeId: 8,
    floorNumber: 3,
    pricePerNight: 290.0,
    status: "available",
  },
  {
    roomNumber: "305",
    roomTypeId: 9,
    floorNumber: 3,
    pricePerNight: 450.0,
    status: "available",
  },
];

export const getAmenitiesByType = (roomTypeId) => {
  const baseAmenities = ["WiFi", "Air Conditioning", "TV", "Private Bathroom"];
  switch (roomTypeId) {
    case 1:
      return [...baseAmenities, "Work Desk", "Coffee Maker"];
    case 2:
      return [
        ...baseAmenities,
        "City View",
        "Mini Bar",
        "Work Desk",
        "Premium Bedding",
      ];
    case 3:
      return [...baseAmenities, "Queen Bed", "Seating Area"];
    case 4:
      return [...baseAmenities, "Two Single Beds", "Work Desk"];
    case 5:
      return [
        ...baseAmenities,
        "King Bed",
        "Balcony",
        "Mini Bar",
        "Premium Bedding",
      ];
    case 6:
      return [...baseAmenities, "Three Single Beds", "Extra Space"];
    case 7:
      return [
        ...baseAmenities,
        "Separate Sleeping Areas",
        "Kitchenette",
        "Living Area",
        "Sofa Bed",
      ];
    case 8:
      return [
        ...baseAmenities,
        "Living Room",
        "Premium Amenities",
        "City View",
        "Mini Bar",
        "Work Area",
        "Premium Bedding",
      ];
    case 9:
      return [
        ...baseAmenities,
        "Multiple Rooms",
        "Luxury Amenities",
        "Panoramic View",
        "Butler Service",
        "Jacuzzi",
        "Dining Area",
      ];
    default:
      return baseAmenities;
  }
};

export const getRoomTypeDescription = (roomTypeId) => {
  const types = {
    1: "Standard Single",
    2: "Deluxe Single",
    3: "Standard Double",
    4: "Twin Room",
    5: "Deluxe Double",
    6: "Triple Room",
    7: "Family Suite",
    8: "Executive Suite",
    9: "Presidential Suite",
  };
  return types[roomTypeId] || "Standard Room";
};

export const getStatusColor = (status) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700";
    case "occupied":
      return "bg-red-100 text-red-700";
    case "maintenance":
      return "bg-yellow-100 text-yellow-700";
    case "out-of-order":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
