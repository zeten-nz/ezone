const FUEL_COLORS = {
  LPG: '#2563eb',
  CNG: '#10b981',
};

/**
 * Part-to-whole with only two named categories — a divided bar reads more
 * honestly here than a pie/donut (see dataviz guidance: pie is right for a
 * single ratio against a limit, not identity comparison). Direct labels
 * (name + count + %) are mandatory relief since the emerald segment falls
 * under 3:1 contrast against white on its own.
 */
const FuelTypeSplit = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-neutral-100">
        {data.map((d, i) => (
          <div
            key={d.type}
            className="h-full"
            style={{
              width: `${(d.count / total) * 100}%`,
              backgroundColor: FUEL_COLORS[d.type] || '#9ca3af',
              marginLeft: i > 0 ? '2px' : 0,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.map((d) => (
          <div key={d.type} className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: FUEL_COLORS[d.type] || '#9ca3af' }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">{d.type}</p>
              <p className="text-xs text-neutral-500 tabular-nums">
                {d.count} &middot; {Math.round((d.count / total) * 100)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuelTypeSplit;
