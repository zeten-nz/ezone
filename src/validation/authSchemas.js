import { z } from 'zod';
import { PHONE_REGEX } from '../config/phone';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // mirrors ezone-server/config/uploads.js
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Zod modules have no React context, so messages can't be static strings —
// every schema is built fresh per render via a factory the caller memoizes
// with useMemo(() => buildXSchema(t), [t, language]) (see Login.jsx,
// Register.jsx, EmployeeProfileModern.jsx) so switching language re-validates
// with the right text.

// Mirrors the express-validator rules in ezone-server/routes/authRoutes.js
// exactly (username min 3, password min 6) — client-side validation here is
// purely for instant feedback, the backend remains the source of truth.
export const buildLoginSchema = (t) => z.object({
  username: z.string().min(1, t('valUsernameRequired')),
  password: z.string().min(1, t('valPasswordRequired')),
});

// Mirrors ezone-server/routes/authRoutes.js's /register rules exactly.
export const buildRegisterSchema = (t) =>
  z
    .object({
      first_name: z.string().trim().min(1, t('valFirstNameRequired')),
      last_name: z.string().trim().min(1, t('valLastNameRequired')),
      region: z.string().trim().min(1, t('valRegionRequired')),
      district: z.string().trim().min(1, t('valDistrictRequired')),
      branch_code: z.string().trim().min(1, t('valBranchCodeRequired')),
      phone: z.string().regex(PHONE_REGEX, t('valPhoneInvalid')),
      username: z.string().trim().min(3, t('valUsernameMinLength')),
      password: z.string().min(6, t('valPasswordMinLength')),
      confirmPassword: z.string().min(1, t('valConfirmPasswordRequired')),
      photo: z
        .instanceof(File, { message: t('valPhotoRequired') })
        .refine((file) => ALLOWED_PHOTO_TYPES.includes(file.type), { message: t('valPhotoInvalidType') })
        .refine((file) => file.size <= MAX_PHOTO_SIZE_BYTES, { message: t('valPhotoTooLarge') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('valPasswordsMismatch'),
      path: ['confirmPassword'],
    });

// Mirrors ezone-server/routes/authRoutes.js's /change-password rule (newPassword min 6).
export const buildChangePasswordSchema = (t) =>
  z
    .object({
      currentPassword: z.string().min(1, t('valCurrentPasswordRequired')),
      newPassword: z.string().min(6, t('valPasswordMinLength')),
      confirmPassword: z.string().min(1, t('valConfirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('valPasswordsMismatch'),
      path: ['confirmPassword'],
    });
