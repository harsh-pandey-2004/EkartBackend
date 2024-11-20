const jwt = require("jsonwebtoken");

const authenticateAdmin = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    jwt.verify(token, process.env.JWT_ADMIN_SECRET_KEY, (err, admin) => {
      if (err) return res.sendStatus(403).json({ message: "Invalid token" });
      req.admin = admin;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token " + error });
  }
};

module.exports = { authenticateAdmin };
