const UserService = require("../services/UserService");

class UserController {
  static async getProfile(req, res) {
    try {
      const profile = await UserService.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  static async getDoctors(req, res) {
    try {
      const doctors = await UserService.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}


module.exports = UserController;
