const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const documentShareRoutes = require("./routes/documentShareRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Connect DB
connectDB();

// Test Route
app.get("/", (req, res) => {
    res.send("MediVault API Running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/documents", documentShareRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});