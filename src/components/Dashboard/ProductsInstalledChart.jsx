import { getProductCategoryLabel } from '../../config/productCategories';

/**
 * Magnitude comparison across product categories/brands — a horizontal bar
 * list reads more honestly here than a pie (dataviz guidance: pie is for one
 * ratio against a limit, not an open-ended count comparison). Single hue
 * (the same blue accent used throughout this dashboard), direct count
 * labels next to every bar so no hover layer is needed to read the value.
 */
const ProductsInstalledChart = ({ data, t }) => {
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={`${d.category}-${d.brand}`} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-neutral-900 truncate">
              {d.brand} · {getProductCategoryLabel(t, d.category)}
            </span>
            <span className="text-neutral-500 tabular-nums flex-shrink-0">{d.count}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${(d.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsInstalledChart;
