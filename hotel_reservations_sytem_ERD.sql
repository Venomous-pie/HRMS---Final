CREATE TABLE "Guests" (
  "guest_id" int PRIMARY KEY,
  "first_name" varchar,
  "middle_name" varchar,
  "last_name" varchar,
  "email" varchar,
  "phone" varchar,
  "address" varchar,
  "id_document" varchar
);

CREATE TABLE "Room_Types" (
  "room_type_id" int PRIMARY KEY,
  "type_name" varchar,
  "description" text,
  "max_capacity" int,
  "base_price" decimal
);

CREATE TABLE "Rooms" (
  "room_id" int PRIMARY KEY,
  "room_number" varchar,
  "room_type_id" int,
  "status" varchar,
  "price_per_night" decimal,
  "floor_number" int
);

CREATE TABLE "Reservations" (
  "reservation_id" int PRIMARY KEY,
  "guest_id" int,
  "room_id" int,
  "num_guests" int,
  "check_in_date" date,
  "check_out_date" date,
  "special_requests" text,
  "status" varchar,
  "total_price" decimal,
  "created_at" datetime
);

CREATE TABLE "Payments" (
  "payment_id" int PRIMARY KEY,
  "reservation_id" int,
  "amount" decimal,
  "payment_method" varchar,
  "payment_date" datetime,
  "status" varchar
);

CREATE TABLE "Services" (
  "service_id" int PRIMARY KEY,
  "service_name" varchar,
  "price" decimal,
  "description" text
);

CREATE TABLE "Reservation_Services" (
  "reservation_service_id" int PRIMARY KEY,
  "reservation_id" int,
  "service_id" int,
  "quantity" int,
  "total_price" decimal
);

CREATE TABLE "Staff" (
  "staff_id" int PRIMARY KEY,
  "first_name" varchar,
  "last_name" varchar,
  "role" varchar,
  "email" varchar,
  "phone" varchar
);

CREATE TABLE "Housekeeping_Logs" (
  "log_id" int PRIMARY KEY,
  "room_id" int,
  "staff_id" int,
  "task_type" varchar,
  "task_date" datetime,
  "status" varchar,
  "notes" text
);

ALTER TABLE "Rooms" ADD FOREIGN KEY ("room_type_id") REFERENCES "Room_Types" ("room_type_id");

ALTER TABLE "Reservations" ADD FOREIGN KEY ("guest_id") REFERENCES "Guests" ("guest_id");

ALTER TABLE "Reservations" ADD FOREIGN KEY ("room_id") REFERENCES "Rooms" ("room_id");

ALTER TABLE "Payments" ADD FOREIGN KEY ("reservation_id") REFERENCES "Reservations" ("reservation_id");

ALTER TABLE "Reservation_Services" ADD FOREIGN KEY ("reservation_id") REFERENCES "Reservations" ("reservation_id");

ALTER TABLE "Reservation_Services" ADD FOREIGN KEY ("service_id") REFERENCES "Services" ("service_id");

ALTER TABLE "Housekeeping_Logs" ADD FOREIGN KEY ("room_id") REFERENCES "Rooms" ("room_id");

ALTER TABLE "Housekeeping_Logs" ADD FOREIGN KEY ("staff_id") REFERENCES "Staff" ("staff_id");
