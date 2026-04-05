const UserRepository = require("../repositories/UserRepository");

class UserService {
  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  static async getDoctors() {
    return await UserRepository.findDoctors();
  }
}


module.exports = UserService;
