const AuthService = require("../services/AuthService");

class AuthController {
  static async signup(req, res) {
    try {
      const user = await AuthService.signup(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const data = await AuthService.login(req.body);
      res.json(data);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;