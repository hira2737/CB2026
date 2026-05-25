const Screen = require("../Models/Screen");

exports.getScreens = async (req, res) => {
  try {
    const { cinemaId } = req.query;
    let query = {};
    if (cinemaId) query.cinema = cinemaId;
    const screens = await Screen.find(query).populate("cinema");
    res.json(screens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addScreen = async (req, res) => {
  try {
    const screen = new Screen(req.body);
    // Generate default seats if not provided
    if (!screen.seats || screen.seats.length === 0) {
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const seatsPerRow = 10;
      const generatedSeats = [];
      for (let i = 0; i < rows.length; i++) {
        for (let j = 1; j <= seatsPerRow; j++) {
          generatedSeats.push(`${rows[i]}${j}`);
        }
      }
      screen.seats = generatedSeats;
      screen.totalSeats = generatedSeats.length;
    }
    await screen.save();
    res.status(201).json(screen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteScreen = async (req, res) => {
  try {
    await Screen.findByIdAndDelete(req.params.id);
    res.json({ message: "Screen deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
