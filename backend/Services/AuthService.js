const jwt = require('jsonwebtoken');
const UserRepository = require('../Repositories/UserRepository');
const { UserRegisterDTO, UserLoginDTO, mapUserToResponseDTO } = require('../Dto/User.Dto');

class AuthService {
  static async signup(userData) {
    const { error } = UserRegisterDTO.validate(userData);
    if (error) throw new Error(error.details[0].message);

    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) throw new Error('Email already registered');

    const user = await UserRepository.create(userData);
    const token = this.generateToken(user.id);
    
    return {
      user: mapUserToResponseDTO(user),
      token
    };
  }

  static async login(credentials) {
    const { error } = UserLoginDTO.validate(credentials);
    if (error) throw new Error(error.details[0].message);

    const user = await UserRepository.findByEmail(credentials.email);
    if (!user) throw new Error('Invalid credentials');

    const isValid = await UserRepository.validatePassword(credentials.password, user.password_hash);
    if (!isValid) throw new Error('Invalid credentials');

    const token = this.generateToken(user.id);
    
    return {
      user: mapUserToResponseDTO(user),
      token
    };
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = AuthService;