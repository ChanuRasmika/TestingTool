const AuthService = require('../services/AuthService');
const UserRepository = require('../Repositories/UserRepository');
const { mapUserToResponseDTO } = require('../Dto/User.Dto');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await UserRepository.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = mapUserToResponseDTO(user);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;