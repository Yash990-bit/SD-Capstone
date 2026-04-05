const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "secret"
    );

    // Provide the full user if role isn't in token (backward compatibility)
    if (!decoded.role) {
      const fullUser = await UserRepository.findById(decoded.id);
      req.user = fullUser;
    } else {
      req.user = decoded;
    }

    next();

  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = protect;