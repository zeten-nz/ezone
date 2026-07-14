import { z } from 'zod';
import { PHONE_REGEX } from '../config/phone';

// Optional field, but if the admin does type something it must be a valid
// Uzbekistan number — same rule PhoneInput's output already conforms to
// once a full 9-digit number has been entered.
const optionalPhone = (t) =>
  z.string().optional().refine((val) => !val || PHONE_REGEX.test(val), { message: t('valPhoneInvalid') });

// Mirrors ezone-server/routes/userRoutes.js exactly:
// POST / requires full_name, username (min 3), password (min 6); phone/branch_id optional.
export const buildCreateUserSchema = (t) => z.object({
  full_name: z.string().trim().min(1, t('valFullNameRequired')),
  username: z.string().trim().min(3, t('valUsernameMinLength')),
  password: z.string().min(6, t('valPasswordMinLength')),
  phone: optionalPhone(t),
  branch_id: z.union([z.string(), z.number()]).optional(),
});

// PUT /:userId only validates full_name — username/password aren't part of
// the update payload the backend reads (see userController.updateUser).
export const buildEditUserSchema = (t) => z.object({
  full_name: z.string().trim().min(1, t('valFullNameRequired')),
  phone: optionalPhone(t),
  branch_id: z.union([z.string(), z.number()]).optional(),
});
