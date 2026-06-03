import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_in_production");
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  }

  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({ message: "Authentication required. Log in with session or JWT." });
};
