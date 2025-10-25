const ProfileService = require('../Services/ProfileService');
const { UserUpdateDTO } = require('../Dto/User.Dto');

class ProfileController {
  static async updateProfile(req, res) {
    try {
      const { error, value } = UserUpdateDTO.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const file = req.file ? {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null;

      const updatedUser = await ProfileService.updateProfile(req.user.id, value, file);
      
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await ProfileService.getProfile(req.user.id);
      res.json({ user });
    } catch (err) {
      console.error('Get profile error:', err);
      if (err.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ProfileController;