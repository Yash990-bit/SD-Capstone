const User = require("../models/User");

class UserRepository {
  static findByEmail(email) {
    return User.findOne({ email });
  }

  static create(payload) {
    return User.create(payload);
  }

  static findById(id) {
    return User.findById(id).select("-password");
  }

  static findDoctors() {
    // lowercase or capitalize based on what's configured, usually lowercase but lets do regex or both
    return User.find({ role: { $regex: /^doctor$/i } }).select("-password");
  }
}


module.exports = UserRepository;
