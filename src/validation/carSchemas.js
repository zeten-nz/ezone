import { z } from 'zod';

// Mirrors ezone-server/routes/carRoutes.js: both brand and model are
// required free text. Create and edit share the same shape.
export const buildCarSchema = (t) => z.object({
  brand: z.string().trim().min(1, t('valCarBrandRequired')),
  model: z.string().trim().min(1, t('valCarModelRequired')),
});
