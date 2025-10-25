const Joi = require('joi');


const AuditLogCreateDTO = Joi.object({
  userId: Joi.number().integer().optional(),
  event: Joi.string().max(100).required(),
  eventData: Joi.object().optional(),
  ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional()
});


const mapAuditToResponseDTO = (audit) => ({
  id: audit.id,
  userId: audit.user_id,
  event: audit.event,
  eventData: audit.event_data,
  ip: audit.ip,
  createdAt: audit.created_at
});

module.exports = {
  AuditLogCreateDTO,
  mapAuditToResponseDTO
};
