export const normalizeArrayResponse = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export const normalizeSingleResponse = (payload, key) => {
  if (!payload || typeof payload !== "object") return payload;
  return payload[key] || payload.data || payload;
};

export const ALLOWED_CITIES = ["Chennai"];

export const DEFAULT_FORMATS = ["2D", "3D", "IMAX", "4DX", "Dolby"];

export const normalizeList = (value, fallback = []) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
};

export const getMovieGenres = (movie) => {
  const categoryName =
    typeof movie?.category === "object" ? movie.category?.name : movie?.category;
  return normalizeList(movie?.genre, categoryName ? [categoryName] : []);
};

export const getMovieLanguages = (movie) => {
  return normalizeList(movie?.language, movie?.language ? [movie.language] : []);
};

export const getMovieFormats = (movie) => {
  return normalizeList(movie?.formats, ["2D"]);
};

export const getMovieStatus = (movie, hasActiveShow = false) => {
  if (movie?.status) return movie.status;
  const releaseTime = movie?.releaseDate ? new Date(movie.releaseDate).getTime() : 0;
  if (releaseTime > Date.now()) return "Coming Soon";
  return hasActiveShow ? "Now Showing" : "Now Showing";
};

export const getBackdropUrl = (movie) => {
  return movie?.backdropUrl || movie?.backdropImage || movie?.posterUrl || "";
};

export const formatRating = (rating) => {
  const parsed = Number(rating);
  if (!Number.isFinite(parsed)) return "N/A";
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1);
};

export const formatDuration = (duration) => {
  const parsed = Number(duration);
  if (!Number.isFinite(parsed) || parsed <= 0) return "0m";

  const totalMinutes = Math.round(parsed);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export const durationPartsToMinutes = (hours, minutes) => {
  const parsedHours = Number(hours || 0);
  const parsedMinutes = Number(minutes || 0);

  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) {
    return 0;
  }

  return Math.round(parsedHours * 60 + parsedMinutes);
};
