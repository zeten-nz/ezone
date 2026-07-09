import { Car, FileX } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

const FUEL_DOT = {
  LPG: 'bg-blue-600',
  CNG: 'bg-emerald-500',
};

const FuelBadge = ({ type }) => (
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-xs font-medium text-neutral-700">
    <span className={`w-1.5 h-1.5 rounded-full ${FUEL_DOT[type] || 'bg-neutral-400'}`} />
    {type}
  </span>
);

/**
 * Responsive by layout swap, not horizontal scroll: a real table at md+,
 * stacked cards below it — the same data, no clipped columns on mobile.
 */
const RecentSubmissions = ({ forms, language, emptyTitle, emptyDescription, labels }) => {
  if (!forms.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <FileX className="w-6 h-6 text-neutral-400" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 mb-1">{emptyTitle}</h3>
        <p className="text-sm text-neutral-500 max-w-xs">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      {/* Table — md and up */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-2 font-medium text-neutral-500">{labels.vehicle}</th>
              <th className="text-left py-3 px-2 font-medium text-neutral-500">{labels.owner}</th>
              <th className="text-left py-3 px-2 font-medium text-neutral-500">{labels.employee}</th>
              <th className="text-left py-3 px-2 font-medium text-neutral-500">{labels.fuelType}</th>
              <th className="text-right py-3 px-2 font-medium text-neutral-500">{labels.date}</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{form.vehicle_brand} {form.vehicle_model}</p>
                      <p className="font-mono text-xs text-neutral-500">{form.vehicle_plate_number}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-neutral-700">{form.owner_full_name}</td>
                <td className="py-3 px-2 text-neutral-700">{form.employee_name}</td>
                <td className="py-3 px-2"><FuelBadge type={form.reducer_fuel_type} /></td>
                <td className="py-3 px-2 text-right text-neutral-500 whitespace-nowrap">
                  {formatRelativeTime(form.created_at, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — below md, no horizontal scroll */}
      <div className="md:hidden space-y-3">
        {forms.map((form) => (
          <div key={form.id} className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900">{form.vehicle_brand} {form.vehicle_model}</p>
                <p className="font-mono text-xs text-neutral-500 mt-0.5">{form.vehicle_plate_number}</p>
              </div>
              <FuelBadge type={form.reducer_fuel_type} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-neutral-400">{labels.owner}</dt>
                <dd className="text-neutral-700 font-medium truncate">{form.owner_full_name}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">{labels.employee}</dt>
                <dd className="text-neutral-700 font-medium truncate">{form.employee_name}</dd>
              </div>
            </dl>
            <p className="text-xs text-neutral-400 mt-2">{formatRelativeTime(form.created_at, language)}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default RecentSubmissions;
