import { Sequelize } from "sequelize";
import GuestsModel from "./Guest.js";
import ReservationsModel from "./Reservation.js";
import RoomModel from "./Room.js";
import RoomTypeModel from "./RoomType.js";
import UserModel from "./User.js";
import PaymentModel from "./Payment.js";
import InvoiceModel from "./Invoice.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./system.db",
});

const Guest = GuestsModel(sequelize);
const Reservation = ReservationsModel(sequelize);
const Room = RoomModel(sequelize);
const RoomType = RoomTypeModel(sequelize);
const User = UserModel(sequelize);
const Payment = PaymentModel(sequelize);
const Invoice = InvoiceModel(sequelize);

// Associations
Guest.hasMany(Reservation);

Reservation.belongsTo(Guest);
Reservation.belongsTo(Room);

Room.hasMany(Reservation);
Room.belongsTo(RoomType);

RoomType.hasMany(Room);

User.belongsTo(User, { as: 'Creator', foreignKey: 'createdBy' });
User.hasMany(User, { as: 'CreatedUsers', foreignKey: 'createdBy' });

export { sequelize, Guest, Reservation, Room, RoomType, User, Payment, Invoice };
