const Show = require("../Models/Show");
const Screen = require("../Models/Screen");

// ===============================
// GET ALL SHOWS
// ===============================
exports.getShows = async (req, res) => {
  try {
    const { movieId, cinemaId } = req.query;

    let query = {
      isActive: true,
      startTime: { $gte: new Date() },
    };

    if (movieId) {
      query.movie = movieId;
    }

    if (cinemaId) {
      const screens = await Screen.find({
        cinema: cinemaId,
      }).select("_id");

      query.screen = {
        $in: screens.map((s) => s._id),
      };
    }

    const shows = await Show.find(query)
      .populate("movie")
      .populate({
        path: "screen",
        populate: {
          path: "cinema",
        },
      })
      .sort({ startTime: 1 });

    return res.json(shows);
  } catch (error) {
    console.error("getShows error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE SHOW
// ===============================
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findOne({
      _id: req.params.id,
      isActive: true,
      startTime: { $gte: new Date() },
    })
      .populate("movie")
      .populate({
        path: "screen",
        populate: {
          path: "cinema",
        },
      });

    if (!show) {
      return res.status(404).json({
        message: "Show not found or no longer available",
      });
    }

    return res.json(show);
  } catch (error) {
    console.error("getShowById error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// ADD SHOW
// ===============================
exports.addShow = async (req, res) => {
  try {
    const { movie, screen, startTime, endTime } = req.body;

    if (!movie || !screen || !startTime || !endTime) {
      return res.status(400).json({
        message:
          "movie, screen, startTime and endTime are required",
      });
    }

    const start = new Date(startTime);

    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        message: "Cannot create shows in the past",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const overlapping = await Show.findOne({
      screen,
      isActive: true,
      startTime: {
        $lt: end,
      },
      endTime: {
        $gt: start,
      },
    });

    if (overlapping) {
      return res.status(409).json({
        message:
          "This screen already has another show during this time",
      });
    }

    const show = await Show.create({
      movie,
      screen,
      startTime: start,
      endTime: end,
    });

    return res.status(201).json(show);
  } catch (error) {
    console.error("addShow error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// UPDATE SHOW
// ===============================
exports.updateShow = async (req, res) => {
  try {
    const showId = req.params.id;

    const currentShow = await Show.findById(showId);

    if (!currentShow) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    let start = currentShow.startTime;

    let end = currentShow.endTime;

    if (req.body.startTime) {
      start = new Date(req.body.startTime);
    }

    if (req.body.endTime) {
      end = new Date(req.body.endTime);
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        message: "Cannot schedule shows in the past",
      });
    }

    const screen = req.body.screen || currentShow.screen;

    const overlapping = await Show.findOne({
      _id: { $ne: showId },
      screen,
      isActive: true,
      startTime: {
        $lt: end,
      },
      endTime: {
        $gt: start,
      },
    });

    if (overlapping) {
      return res.status(409).json({
        message:
          "Show timing overlaps with another show",
      });
    }

    const updated = await Show.findByIdAndUpdate(
      showId,
      {
        ...req.body,
        startTime: start,
        endTime: end,
      },
      {
        new: true,
      }
    );

    return res.json(updated);
  } catch (error) {
    console.error("updateShow error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// DELETE SHOW
// ===============================
exports.deleteShow = async (req, res) => {
  try {
    await Show.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Show deleted",
    });
  } catch (error) {
    console.error("deleteShow error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
