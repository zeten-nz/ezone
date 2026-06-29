/**
 * AUTHENTICATION SERVICE
 * All auth-related API calls: login, profile, password change.
 */

import client from '../api/client';

export const authService = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }),

  getProfile: () =>
    client.get('/auth/profile'),

  changePassword: (currentPassword, newPassword) =>
    client.post('/auth/change-password', { currentPassword, newPassword }),
};
