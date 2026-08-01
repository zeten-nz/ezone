import { z } from 'zod';

// Mirrors ezone-server/routes/productRoutes.js exactly. Create and edit are
// now the same shape — products are catalog models (e.g. "STAG R02"), not
// serialized physical units, so there's no longer an immutable per-unit
// identity field that only applies at creation.
export const buildProductSchema = (t) => z.object({
  category: z.string().min(1, t('valCategoryRequired')),
  brand_id: z.coerce.number({ invalid_type_error: t('valBrandRequired') }).int().positive(t('valBrandRequired')),
  model: z.string().optional(),
  fuel_type: z.string().optional(),
});
