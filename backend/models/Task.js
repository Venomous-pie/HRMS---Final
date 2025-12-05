import { DataTypes } from "sequelize";

export default function TaskModel(sequelize) {
  return sequelize.define("Task", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['spa', 'reception', 'restaurant', 'bar', 'room-services']]
      }
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., "Rest Room No: 01", "Front Desk", "Table No: 01 & 02"
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false, // Format: "HH:mm"
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false, // Format: "HH:mm"
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['closed', 'booked', 'scheduled', 'in-progress', 'completed']]
      }
    },
    assignedStaff: {
      type: DataTypes.STRING,
      allowNull: true, // Comma-separated staff names: "John Doe, Jane Smith"
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Tasks',
    timestamps: true, // Sequelize will automatically add createdAt and updatedAt
  });
}

