import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Room", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
        "available",
        "occupied",
        "maintenance",
        "out-of-order",
      ),
      allowNull: false,
      defaultValue: "available",
    },
    pricePerNight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    floorNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statusColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "bg-green-100 text-green-700",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    amenities: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON string of room amenities",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });
};
