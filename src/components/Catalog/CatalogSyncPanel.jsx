import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { catalogSyncAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Card, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import StatusBadge from '../UI/StatusBadge';

/**
 * The ONE shared "Sync EasyGas Catalog" entry point — lives only on
 * AdminCatalogSyncModern (/catalog-sync). Earlier this was embedded
 * separately on the Products/Brands/Cars pages; that duplicated the same
 * button/status three times for what is always a single combined job (see
 * catalogSyncAPI.run -> ezone-server/services/easyGasCatalogSyncService.js's
 * runFullSync), so it was consolidated here instead. `onSyncComplete` is
 * still accepted (a future caller embedding this elsewhere may want it) but
 * nothing currently passes it.
 *
 * Polls GET /status every POLL_INTERVAL_MS while a sync is RUNNING — needed
 * because a sync can be started by the periodic background sweep, not just
 * this button, so a viewer with the page already open has to find out some
 * way other than their own click resolving.
 */
const POLL_INTERVAL_MS = 3000;

const parseFailureMessage = (message, t) => {
  if (!message) return t('syncReasonUnknown');
  const entityLabels = { brands: t('brands'), products: t('products'), cars: t('cars') };
  return message
    .split(';')
    .map((segment) => {
      const [entityPart, reason] = segment.split(':');
      const entityLabel = entityLabels[entityPart?.replace('_failed', '')] || entityPart;
      let reasonLabel;
      if (reason === 'network') reasonLabel = t('syncReasonNetwork');
      else if (reason?.startsWith('http_')) reasonLabel = `${t('syncReasonHttpError')} ${reason.slice(5)}`;
      else reasonLabel = t('syncReasonUnknown');
      return `${entityLabel}: ${reasonLabel}`;
    })
    .join(' · ');
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const formatDuration = (durationMs) => {
  if (durationMs == null) return null;
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
};

const ENTITY_ROWS = ['products', 'brands', 'cars'];

const CatalogSyncPanel = ({ onSyncComplete }) => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState(null);
  // EasyGas /verify connectivity check — backend-to-backend signed GET; the
  // result is a simple ok/failed line, nothing else depends on it.
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // null | 'ok' | 'failed'
  const pollRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await catalogSyncAPI.getStatus();
      setSummary(response.data);
      return response.data;
    } catch {
      // Non-fatal — the panel just shows no "last sync" info yet.
      return null;
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    return () => clearInterval(pollRef.current);
  }, [fetchStatus]);

  useEffect(() => {
    if (summary?.status !== 'RUNNING') {
      clearInterval(pollRef.current);
      return undefined;
    }
    pollRef.current = setInterval(async () => {
      const latest = await fetchStatus();
      if (latest && latest.status !== 'RUNNING') {
        clearInterval(pollRef.current);
        if (latest.status === 'SUCCESS' && onSyncComplete) onSyncComplete();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [summary?.status, fetchStatus, onSyncComplete]);

  const handleSync = async () => {
    setTriggering(true);
    setError(null);
    try {
      const response = await catalogSyncAPI.run();
      setSummary({ ...response.data, lastSyncedAt: new Date().toISOString() });
      if (response.data.status === 'SUCCESS' && onSyncComplete) onSyncComplete();
    } catch (err) {
      // err is always an AppError (see src/api/client.js) — never a raw
      // Axios error. statusCode/errorCode, never err.response.
      if (err.statusCode === 409) {
        // Someone else (another admin, or the periodic sweep) started a sync
        // first — not an error from the user's point of view. Re-fetch the
        // real status (which is RUNNING) so the polling effect above takes
        // over from here.
        await fetchStatus();
      } else {
        setError(err.message);
      }
    } finally {
      setTriggering(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const response = await catalogSyncAPI.verify();
      setVerifyResult(response.data.ok ? 'ok' : 'failed');
    } catch {
      setVerifyResult('failed');
    } finally {
      setVerifying(false);
    }
  };

  const isRunning = summary?.status === 'RUNNING';
  const lastSyncedAt = formatDateTime(summary?.lastSyncedAt);
  const duration = formatDuration(summary?.durationMs);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-neutral-900">{t('lastSyncLabel')}:</span>
              <span className="text-sm text-neutral-600">{lastSyncedAt || t('syncNeverRun')}</span>
              {summary?.status && summary.status !== 'RUNNING' && (
                <StatusBadge status={summary.status === 'SUCCESS' ? 'CATALOG_SYNC_SUCCESS' : 'CATALOG_SYNC_FAILED'} />
              )}
              {isRunning && <StatusBadge status="CATALOG_SYNC_RUNNING" />}
              {duration && !isRunning && (
                <span className="text-xs text-neutral-400">({t('syncDurationLabel')}: {duration})</span>
              )}
            </div>
            {summary?.status === 'FAILED' && (
              <p className="text-xs text-red-600">{parseFailureMessage(summary.message, t)}</p>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            {verifyResult === 'ok' && (
              <p className="text-xs text-green-600">{t('easyGasConnectionOk')}</p>
            )}
            {verifyResult === 'failed' && (
              <p className="text-xs text-red-600">{t('easyGasConnectionFailed')}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleVerify} icon={ShieldCheck} loading={verifying}>
              {t('verifyEasyGasConnection')}
            </Button>
            <Button onClick={handleSync} icon={RefreshCw} loading={triggering} disabled={isRunning}>
              {isRunning ? t('syncRunning') : t('syncCatalogButton')}
            </Button>
          </div>
        </div>

        {summary?.status === 'SUCCESS' && summary?.details && (
          <div className="overflow-x-auto">
            <table className="text-xs w-full min-w-[420px]">
              <thead>
                <tr className="text-neutral-500">
                  <th className="text-left font-medium py-1 pr-3"></th>
                  <th className="text-right font-medium py-1 px-2">{t('syncInserted')}</th>
                  <th className="text-right font-medium py-1 px-2">{t('syncUpdated')}</th>
                  <th className="text-right font-medium py-1 px-2">{t('syncSkipped')}</th>
                  <th className="text-right font-medium py-1 px-2">{t('syncFailed')}</th>
                </tr>
              </thead>
              <tbody>
                {ENTITY_ROWS.map((entity) => {
                  const row = summary.details[entity];
                  if (!row) return null;
                  return (
                    <tr key={entity} className="border-t border-neutral-100">
                      <td className="py-1 pr-3 font-medium text-neutral-700">{t(entity)}</td>
                      <td className="text-right py-1 px-2 text-neutral-700">{row.inserted}</td>
                      <td className="text-right py-1 px-2 text-neutral-700">{row.updated}</td>
                      <td className="text-right py-1 px-2 text-neutral-700">{row.skipped}</td>
                      <td className={`text-right py-1 px-2 ${row.failed > 0 ? 'text-red-600 font-medium' : 'text-neutral-700'}`}>{row.failed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CatalogSyncPanel;
