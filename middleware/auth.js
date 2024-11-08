const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.sendStatus(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const authenticateSeller = (req, res, next) => {
  const token = req.cookies?.seller_token;
  if (!token) return res.sendStatus(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SELLER_SECRET_KEY, (err, seller) => {
    if (err) return res.sendStatus(403).json({ message: "Invalid token" });
    req.seller = seller;
    next();
  });
};

const password_auth = (req, res, next) => {
  const { token } = req.params;
  if (!token) return res.sendStatus(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, password_auth, authenticateSeller };
