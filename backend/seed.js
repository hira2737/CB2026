const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./Models/User");
const Movie = require("./Models/Movie");
const Cinema = require("./Models/Cinema");
const Screen = require("./Models/Screen");
const Show = require("./Models/Show");
const Booking = require("./Models/Booking");
const SeatLock = require("./Models/SeatLock");
const Category = require("./Models/Category");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Cinema.deleteMany({}),
      Screen.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      SeatLock.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log("Cleared existing data.");

    // 1. Create Admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "System Admin",
      email: "admin@gmail.com",
      password: adminPassword,
      role: "admin",
    });
    await admin.save();
    console.log("Admin user created: admin@gmail.com / admin123");

    // 2. Create Categories
    const categories = await Category.insertMany([
      { name: "Sci-Fi", description: "Science Fiction movies" },
      { name: "Action", description: "Action and adventure movies" },
      { name: "Drama", description: "Drama and emotional movies" },
    ]);
    console.log("Categories seeded.");

    // 3. Create Demo Movies
    const movies = await Movie.insertMany([
      {
        title: "Inception",
        category: categories[0]._id, // Sci-Fi
        duration: 148,
        rating: 8.8,
        posterUrl:
          "https://image.tmdb.org/t/p/original/edv5CZvfkjSB9vO9GgyEt9mUQQw.jpg",
        description:
          "A thief who steals corporate secrets through the use of dream-sharing technology.",
        releaseDate: new Date("2010-07-16"),
        language: "English",
      },
      {
        title: "The Dark Knight",
        category: categories[1]._id, // Action
        duration: 152,
        rating: 9.0,
        posterUrl:
          "https://image.tmdb.org/t/p/original/qJ2tW6WMUDp9QmSbmMqpz26MGmb.jpg",
        description:
          "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.",
        releaseDate: new Date("2008-07-18"),
        language: "English",
      },
      {
        title: "Interstellar",
        category: categories[0]._id, // Sci-Fi
        duration: 169,
        rating: 8.7,
        posterUrl:
          "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6vCU67vSbpZpS.jpg",
        description:
          "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        releaseDate: new Date("2014-11-07"),
        language: "English",
      },
    ]);
    console.log("Movies seeded.");

    // 4. Create Cinemas & Screens
    const cinema1 = new Cinema({
      name: "CINEPLEX GRAND",
      city: "Mumbai",
      address: "Star Tower, Floor 4, Panthapath",
    });
    await cinema1.save();

    const cinema2 = new Cinema({
      name: "STARLIGHT CINEMAS",
      city: "Delhi",
      address: "Harbour Point, GEC Circle",
    });
    await cinema2.save();

    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = 10;
    const generatedSeats = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        generatedSeats.push(`${rows[i]}${j}`);
      }
    }

    const screen1 = new Screen({
      cinema: cinema1._id,
      name: "Gold Class 1",
      totalSeats: 80,
      seats: generatedSeats,
    });
    await screen1.save();

    const screen2 = new Screen({
      cinema: cinema2._id,
      name: "IMAX Hall",
      totalSeats: 80,
      seats: generatedSeats,
    });
    await screen2.save();
    console.log("Cinemas and Screens seeded.");

    // 5. Create Shows
    const now = new Date();
    const show1 = new Show({
      movie: movies[0]._id,
      screen: screen1._id,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      price: 15,
    });
    await show1.save();

    const show2 = new Show({
      movie: movies[1]._id,
      screen: screen2._id,
      startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      endTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      price: 18,
    });
    await show2.save();
    console.log("Shows seeded.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
