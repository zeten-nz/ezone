import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Eye, Check, X, ClipboardList, ListX } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { registrationRequestsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { ConfirmModal } from '../components/UI/Modal';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import AuthenticatedPhoto from '../components/UI/AuthenticatedPhoto';
import RegistrationRequestDetailModal from '../components/RegistrationRequests/RegistrationRequestDetailModal';
import RejectReasonModal from '../components/RegistrationRequests/RejectReasonModal';

const PAGE_SIZE = 10;

const AdminRegistrationRequestsModern = () => {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [approveConfirm, setApproveConfirm] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchRequests = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await registrationRequestsAPI.getAll();
      setRequests(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRetry = () => fetchRequests(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesSearch =
        !q ||
        r.first_name?.toLowerCase().includes(q) ||
        r.last_name?.toLowerCase().includes(q) ||
        r.username?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.branch_name?.toLowerCase().includes(q) ||
        r.branch_code?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'all';

  const detailRequest = requests.find((r) => r.id === detailId) || null;

  const handleApprove = async () => {
    if (!approveConfirm) return;
    setActionSubmitting(true);
    try {
      await registrationRequestsAPI.approve(approveConfirm);
      setToast({ type: 'success', message: t('requestApproved') });
      setApproveConfirm(null);
      await fetchRequests(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleReject = async (notes) => {
    if (!rejectTarget) return;
    setActionSubmitting(true);
    try {
      await registrationRequestsAPI.reject(rejectTarget, notes);
      setToast({ type: 'success', message: t('requestRejected') });
      setRejectTarget(null);
      await fetchRequests(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActionSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'photo',
      header: t('photo'),
      render: (r) => (
        <AuthenticatedPhoto
          fetcher={() => registrationRequestsAPI.getPhotoBlob(r.id)}
          cacheKey={r.id}
          className="w-10 h-10 rounded-full"
        />
      ),
    },
    {
      key: 'name',
      header: t('fullName'),
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 truncate">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-neutral-500">@{r.username}</p>
        </div>
      ),
    },
    { key: 'phone', header: t('phone'), render: (r) => r.phone || '—' },
    {
      key: 'location',
      header: t('region'),
      render: (r) => (
        <div className="min-w-0">
          <p className="text-neutral-900 truncate">{r.region}</p>
          <p className="text-xs text-neutral-500 truncate">{r.district}</p>
        </div>
      ),
    },
    { key: 'branch', header: t('branchCode'), render: (r) => r.branch_name || r.branch_code || '—' },
    {
      key: 'created',
      header: t('createdDate'),
      render: (r) => new Date(r.created_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      key: 'status',
      header: t('status'),
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const renderActions = (r) => (
    <>
      <Button size="sm" variant="outline" icon={Eye} onClick={() => setDetailId(r.id)}>
        {t('viewDetails')}
      </Button>
      {r.status === 'PENDING' && (
        <>
          <Button size="sm" variant="success" icon={Check} onClick={() => setApproveConfirm(r.id)}>
            {t('approve')}
          </Button>
          <Button size="sm" variant="danger" icon={X} onClick={() => setRejectTarget(r.id)}>
            {t('reject')}
          </Button>
        </>
      )}
    </>
  );

  const renderMobileCard = (r) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AuthenticatedPhoto
          fetcher={() => registrationRequestsAPI.getPhotoBlob(r.id)}
          cacheKey={r.id}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900 truncate">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">@{r.username}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-neutral-400">{t('phone')}</dt><dd className="text-neutral-700 font-medium truncate">{r.phone || '—'}</dd></div>
        <div><dt className="text-neutral-400">{t('branchCode')}</dt><dd className="text-neutral-700 font-medium truncate">{r.branch_name || r.branch_code || '—'}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2 pt-1">{renderActions(r)}</div>
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton height="h-9" width="w-48" />
            <Skeleton height="h-5" width="w-72" />
          </div>
          <Card><CardContent className="p-4"><Skeleton height="h-10" /></CardContent></Card>
          <Card><CardContent className="p-4"><SkeletonTable /></CardContent></Card>
        </div>
      </ModernAdminLayout>
    );
  }

  if (error) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">{t('registrationRequests')}</h1>
          <ErrorState title={t('unableToLoadRequests')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('registrationRequests')}</h1>
          <p className="text-neutral-500 mt-1.5">{t('registrationRequestsSubtitle')}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchRequestsPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: 'all', label: t('allStatuses') },
                  { value: 'PENDING', label: t('statusPending') },
                  { value: 'APPROVED', label: t('statusApproved') },
                  { value: 'REJECTED', label: t('statusRejected') },
                ]}
              />
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>{t('clear')}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-neutral-900">{t('registrationRequests')} ({filtered.length})</h2>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <EmptyState
                title={t('noRequestsYet')}
                description={t('noRequestsYetDesc')}
                icon={ClipboardList}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={t('noRequestsMatch')}
                description={t('noRequestsMatchDesc')}
                icon={ListX}
                action={handleClearFilters}
                actionText={t('clear')}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={paginated}
                  rowKey={(r) => r.id}
                  renderActions={renderActions}
                  renderMobileCard={renderMobileCard}
                  actionsHeader={t('actions')}
                />
                <Pagination
                  currentPage={pageSafe}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={PAGE_SIZE}
                  hasNext={pageSafe < totalPages}
                  hasPrevious={pageSafe > 1}
                  onPageChange={setCurrentPage}
                  itemsLabel={t('submissionsUnit')}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RegistrationRequestDetailModal
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        request={detailRequest}
        t={t}
        language={language}
      />

      <ConfirmModal
        isOpen={!!approveConfirm}
        onClose={() => setApproveConfirm(null)}
        onConfirm={handleApprove}
        title={t('approveRequestTitle')}
        message={t('approveRequestMessage')}
        confirmText={t('approve')}
      />

      {rejectTarget && (
        <RejectReasonModal
          isOpen={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          submitting={actionSubmitting}
        />
      )}
    </ModernAdminLayout>
  );
};

export default AdminRegistrationRequestsModern;
