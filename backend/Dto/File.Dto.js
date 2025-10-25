const Joi = require('joi');

const FileUploadDTO = Joi.object({
  userId: Joi.number().integer().optional(),
  type: Joi.string().valid('profile', 'export').required(),
  filename: Joi.string().required(),
  path: Joi.string().required(),
  mediaType: Joi.string().optional(),
  size: Joi.number().integer().optional()
});

const mapFileToResponseDTO = (file) => ({
  id: file.id,
  userId: file.user_id,
  type: file.type,
  filename: file.filename,
  url: file.path,  
  createdAt: file.created_at
});

module.exports = {
  FileUploadDTO,
  mapFileToResponseDTO
};
