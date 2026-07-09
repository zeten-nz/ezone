import { Building2 } from 'lucide-react';

/**
 * Magnitude comparison across named entities — sequential single hue,
 * bars capped at a comfortable thickness, rounded data-end, growing from a
 * shared baseline (the card's left edge).
 */
const TopOrganizations = ({ data, emptyLabel }) => {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Building2 className="w-8 h-8 text-neutral-300 mb-2" />
        <p className="text-sm text-neutral-500">{emptyLabel}</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className="space-y-3.5">
      {data.map((org, i) => (
        <li key={org.name} className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-400 w-4 flex-shrink-0 tabular-nums">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-neutral-800 truncate">{org.name}</p>
              <p className="text-xs text-neutral-500 tabular-nums flex-shrink-0">{org.count}</p>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.max(6, (org.count / max) * 100)}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TopOrganizations;
