const UserRepository = require('../Repositories/UserRepository');
const FileRepository = require('../Repositories/FileRepository');
const { mapUserToResponseDTO } = require('../Dto/User.Dto');
const { mapFileToResponseDTO } = require('../Dto/File.Dto');
const fs = require('fs').promises;
const path = require('path');

class ProfileService {
  static async updateProfile(userId, profileData, file = null) {
    let profileUrl = profileData.profileUrl;

    if (file) {
      
      const oldFile = await FileRepository.findByUserAndType(userId, 'profile');
      if (oldFile) {
        try {
          await fs.unlink(path.join(__dirname, '..', oldFile.path));
          await FileRepository.deleteById(oldFile.id);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }

      // Save new file record
      const fileRecord = await FileRepository.create({
        user_id: userId,
        type: 'profile',
        filename: file.filename,
        path: file.path,
        media_type: file.mimetype,
        size: file.size
      });

      profileUrl = file.path;
    }

    // Update user profile
    const updatedUser = await UserRepository.updateProfile(userId, {
      ...profileData,
      profile_url: profileUrl
    });

    return mapUserToResponseDTO(updatedUser);
  }

  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error('User not found');
    
    return mapUserToResponseDTO(user);
  }
}

module.exports = ProfileService;