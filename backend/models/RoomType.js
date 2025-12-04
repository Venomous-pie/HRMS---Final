import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("RoomType", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    typeName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    maxCapacity: { type: DataTypes.INTEGER, allowNull: false },
    basePrice: { type: DataTypes.FLOAT, allowNull: false },
  });
};
