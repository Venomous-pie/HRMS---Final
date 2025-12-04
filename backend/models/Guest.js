import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Guest", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    idDocument: { type: DataTypes.STRING, allowNull: false },
    nationality: { type: DataTypes.STRING, allowNull: true },
    totalStays: { type: DataTypes.INTEGER, allowNull: true },
    lastVisited: { type: DataTypes.DATE, allowNull: true },
    totalSpent: { type: DataTypes.INTEGER, allowNull: true },
    notes: { type: DataTypes.STRING, allowNull: true },
    orderCount: { type: DataTypes.INTEGER, allowNull: true },
  });
};
