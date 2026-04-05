const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const UserController = require("../controllers/userController");

router.get("/profile", protect, UserController.getProfile);
router.get("/doctors", protect, UserController.getDoctors);

module.exports = router;