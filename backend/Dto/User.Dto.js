const Joi = require('joi');

const UserRegisterDTO = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  profileUrl: Joi.string().uri().optional()
});

const UserLoginDTO = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});


const UserUpdateDTO = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  profileUrl: Joi.string().uri().optional()
});


const mapUserToResponseDTO = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  profileUrl: user.profile_url,
  createdAt: user.created_at,
  updatedAt: user.updated_at
});

module.exports = {
  UserRegisterDTO,
  UserLoginDTO,
  UserUpdateDTO,
  mapUserToResponseDTO
};