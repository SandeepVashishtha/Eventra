const jwt = require("jsonwebtoken");

module.exports = function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No valid token provided" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);
    req.user = null;

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(401).json({ message: "No valid token provided" });
  }
};
