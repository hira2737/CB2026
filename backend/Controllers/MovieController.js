const Movie = require("../Models/Movie");

const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (error) {}

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeMoviePayload = (payload) => {
  const movieData = { ...payload };

  if (movieData.language !== undefined) {
    movieData.language = parseList(movieData.language);
  }

  if (movieData.formats !== undefined) {
    movieData.formats = parseList(movieData.formats);
  }

  return movieData;
};

// GET ALL MOVIES
exports.getMovies = async (req, res) => {
  try {
    const { category, categories, search } = req.query;

    let query = {};

    const categoryFilter = category || categories;

    if (categoryFilter) query.category = categoryFilter;

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    const movies = await Movie.find(query).populate("category");

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE MOVIE
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate("category");

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD MOVIE (CLOUDINARY + URL SUPPORT)
exports.addMovie = async (req, res) => {
  try {
    const movieData = normalizeMoviePayload(req.body);

    // Cloudinary upload OR URL
    if (req.file) {
      movieData.posterUrl = req.file.path;
    }

    // IMPORTANT fallback (fix blank crashes)
    if (!movieData.posterUrl) {
      movieData.posterUrl = "";
    }

    if (!movieData.title) {
      return res.status(400).json({
        success: false,
        message: "Movie title is required",
      });
    }

    if (!movieData.backdropUrl && movieData.posterUrl) {
      movieData.backdropUrl = movieData.posterUrl;
    }

    const movie = new Movie(movieData);
    await movie.save();

    const populatedMovie = await Movie.findById(movie._id).populate(
      "category"
    );

    res.status(201).json({
      success: true,
      message: "Movie added successfully",
      movie: populatedMovie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE MOVIE (FIXED)
exports.updateMovie = async (req, res) => {
  try {
    const movieData = normalizeMoviePayload(req.body);

    if (req.file) {
      movieData.posterUrl = req.file.path;
    }

    if (!movieData.backdropUrl && movieData.posterUrl) {
      movieData.backdropUrl = movieData.posterUrl;
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      movieData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category");

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE MOVIE
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
