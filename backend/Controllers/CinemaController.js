const Cinema = require("../Models/Cinema");
const Screen = require("../Models/Screen");
const Show = require("../Models/Show");

// ===============================
// GET CINEMAS
// ===============================
exports.getCinemas = async (req, res) => {
  try {
    const query = req.query.city ? { city: req.query.city } : {};
    const cinemas = await Cinema.find(query);
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// ADD CINEMA
// ===============================
exports.addCinema = async (req, res) => {
  try {
    const { name, city, address } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({
        message: "name, city, and address are required",
      });
    }

    const cinema = new Cinema(req.body);
    await cinema.save();

    res.status(201).json(cinema);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// UPDATE CINEMA
// ===============================
exports.updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }

    res.json(cinema);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// DELETE CINEMA (SAFE CASCADE)
// ===============================
exports.deleteCinema = async (req, res) => {
  try {
    const cinemaId = req.params.id;

    // 1. Check cinema exists
    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }

    // 2. Find screens
    const screens = await Screen.find({ cinema: cinemaId }).select("_id");
    const screenIds = screens.map((s) => s._id);

    // 3. Delete shows FIRST (important for consistency)
    if (screenIds.length > 0) {
      await Show.deleteMany({ screen: { $in: screenIds } });
    }

    // 4. Delete screens
    await Screen.deleteMany({ cinema: cinemaId });

    // 5. Delete cinema
    await Cinema.findByIdAndDelete(cinemaId);

    return res.json({
      message: "Cinema, screens, and shows deleted successfully",
      deleted: {
        cinemaId,
        screensDeleted: screenIds.length,
      },
    });
  } catch (error) {
    console.error("deleteCinema error:", error);
    return res.status(500).json({ message: error.message });
  }
};