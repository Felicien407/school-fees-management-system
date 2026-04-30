const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.session.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
};

const requireLibrarian = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.session.role !== "librarian" && req.session.role !== "admin") {
    return res.status(403).json({ message: "Librarian or admin required" });
  }
  return next();
};

module.exports = { requireAuth, requireAdmin, requireLibrarian };
