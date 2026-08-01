import { z } from 'zod';

// Mirrors ezone-server/routes/branchRoutes.js: code + name required on
// create; code is immutable afterward (see BranchFormModal), so edit only
// validates name — everything else is optional supporting detail.
export const buildCreateBranchSchema = (t) => z.object({
  code: z.string().trim().min(1, t('valBranchCodeRequired')),
  name: z.string().trim().min(1, t('valBranchNameRequired')),
  phone: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
});

export const buildEditBranchSchema = (t) => z.object({
  name: z.string().trim().min(1, t('valBranchNameRequired')),
  phone: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
});
