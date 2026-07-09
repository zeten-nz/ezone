import { BellOff } from 'lucide-react';

/**
 * There is no notification system in the backend yet — this is a genuine
 * empty state, not a placeholder standing in for fabricated alerts.
 * Shared between the dashboard's notifications card and the header's
 * notifications dropdown (`compact` trims the padding for the latter).
 */
const NotificationsPanel = ({ title, description, compact = false }) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6 px-4' : 'py-10'}`}>
    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
      <BellOff className="w-5 h-5 text-neutral-400" />
    </div>
    <p className="text-sm font-medium text-neutral-900">{title}</p>
    <p className="text-xs text-neutral-500 mt-1 max-w-[220px]">{description}</p>
  </div>
);

export default NotificationsPanel;
