/**
 * USERS SERVICE
 * All user management API calls (admin-only operations).
 */

import client from '../api/client';

export const usersService = {
  getAll: () =>
    client.get('/users'),

  getById: (userId) =>
    client.get(`/users/${userId}`),

  create: (data) =>
    client.post('/users', data),

  update: (userId, data) =>
    client.put(`/users/${userId}`, data),

  disable: (userId) =>
    client.patch(`/users/${userId}/disable`),

  resetPassword: (userId, newPassword) =>
    client.post(`/users/${userId}/reset-password`, { newPassword }),
};
