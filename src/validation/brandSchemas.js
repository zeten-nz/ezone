import { z } from 'zod';

// Mirrors ezone-server/routes/brandRoutes.js: only name is required —
// full_name/country/logo_url are optional supporting detail. Create and
// edit share the same shape.
export const buildBrandSchema = (t) => z.object({
  name: z.string().trim().min(1, t('valBrandNameRequired')),
  full_name: z.string().optional(),
  country: z.string().optional(),
  logo_url: z.string().optional(),
});
