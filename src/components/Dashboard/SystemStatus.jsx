import { CheckCircle2, RefreshCw } from 'lucide-react';

/**
 * Honest health signal: the dashboard only renders this once the API call
 * has already succeeded, so "connected" is true by construction at render
 * time — not a polled/fabricated uptime metric.
 */
const SystemStatus = ({ apiLabel, dbLabel, lastSyncedLabel, syncedAt, refreshLabel, onRefresh, refreshing }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5">
      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span className="text-sm text-neutral-700">{apiLabel}</span>
    </div>
    <div className="flex items-center gap-2.5">
      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span className="text-sm text-neutral-700">{dbLabel}</span>
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
      <div>
        <p className="text-xs text-neutral-400">{lastSyncedLabel}</p>
        <p className="text-sm text-neutral-700 font-medium">{syncedAt}</p>
      </div>
      <button
        onClick={onRefresh}
        className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
        aria-label={refreshLabel}
      >
        <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${refreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  </div>
);

export default SystemStatus;
