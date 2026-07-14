/**
 * AUTHENTICATION SERVICE
 * All auth-related API calls: login, profile, password change.
 */

import client from '../api/client';

export const authService = {
  // Registration includes a required photo file, so it must be sent as
  // multipart/form-data rather than JSON. The explicit Content-Type override
  // here only defeats client.js's default 'application/json' header long
  // enough for axios to recognize the FormData payload — axios then resets
  // Content-Type itself so the browser fills in the correct multipart
  // boundary (see node_modules/axios/lib/helpers/resolveConfig.js).
  register: ({ first_name, last_name, region, district, branch_id, phone, username, password, photo }) => {
    const formData = new FormData();
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('region', region);
    formData.append('district', district);
    formData.append('branch_id', branch_id);
    formData.append('phone', phone);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('photo', photo);

    return client.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  login: (username, password) =>
    client.post('/auth/login', { username, password }),

  getProfile: () =>
    client.get('/auth/profile'),

  changePassword: (currentPassword, newPassword) =>
    client.post('/auth/change-password', { currentPassword, newPassword }),

  // The photo route requires the same Authorization header as every other
  // request, so it can't be used directly as an <img src> — fetched as a
  // blob and rendered via an object URL instead (see AuthenticatedPhoto).
  getProfilePhotoBlob: () =>
    client.get('/auth/profile/photo', { responseType: 'blob' }),

  updateProfilePhoto: (photo) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return client.post('/auth/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  removeProfilePhoto: () =>
    client.delete('/auth/profile/photo'),
};
