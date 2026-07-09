import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, UserPlus, Pencil, KeyRound, Ban, CheckCircle, Users as UsersIcon, UserX } from 'lucide-react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { userAPI } from '../services/api';
import { initialsOf } from '../utils/initials';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';
import Skeleton, { SkeletonTable } from '../components/UI/Skeleton';
import ErrorState from '../components/UI/ErrorState';
import DataTable from '../components/UI/DataTable';
import Pagination from '../components/UI/Pagination';
import UserFormModal from '../components/Users/UserFormModal';
import NewPasswordModal from '../components/Users/NewPasswordModal';

const PAGE_SIZE = 10;

const AdminUsersModern = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null); // { id, action: 'enable' | 'disable' }
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRetry = () => fetchUsers(true);

  // The backend has no server-side search/filter/pagination for users (see
  // usersService.getAll) — everything below runs over the single fetched
  // list, exactly as before, just windowed for display.
  const employees = useMemo(() => users.filter((u) => u.role === 'EMPLOYEE'), [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((u) => {
      const matchesSearch =
        !q ||
        u.full_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.branch_code?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

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

  const handleOpenCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, data);
        setToast({ type: 'success', message: t('userUpdated') });
      } else {
        await userAPI.createUser(data);
        setToast({ type: 'success', message: t('userCreated') });
      }
      setShowModal(false);
      setEditingUser(null);
      await fetchUsers(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirm) return;
    const { id, action } = statusConfirm;
    try {
      if (action === 'enable') {
        await userAPI.enableUser(id);
        setToast({ type: 'success', message: t('userEnabled') });
      } else {
        await userAPI.disableUser(id);
        setToast({ type: 'success', message: t('userDisabled') });
      }
      setStatusConfirm(null);
      await fetchUsers(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordConfirm) return;
    try {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      const generated = Array.from(arr, (n) => n.toString(36)).join('').slice(0, 10);
      await userAPI.resetPassword(resetPasswordConfirm, generated);
      setResetPasswordConfirm(null);
      setNewPassword(generated);
      await fetchUsers(false);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('fullName'),
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {initialsOf(u.full_name)}
          </div>
          <span className="font-medium text-neutral-900 truncate">{u.full_name}</span>
        </div>
      ),
    },
    { key: 'username', header: t('username'), render: (u) => u.username },
    { key: 'branch', header: t('branch'), render: (u) => u.branch_code || '—' },
    { key: 'phone', header: t('phone'), render: (u) => u.phone || '—' },
    {
      key: 'status',
      header: t('status'),
      render: (u) => <StatusBadge status={u.is_active ? 'ACTIVE' : 'DISABLED'} />,
    },
  ];

  const renderActions = (u) => (
    <>
      <Button size="sm" variant="outline" icon={Pencil} onClick={() => handleOpenEdit(u)}>
        {t('editUser')}
      </Button>
      {u.is_active ? (
        <>
          <Button size="sm" variant="secondary" icon={KeyRound} onClick={() => setResetPasswordConfirm(u.id)}>
            {t('resetPasswordAction')}
          </Button>
          <Button size="sm" variant="danger" icon={Ban} onClick={() => setStatusConfirm({ id: u.id, action: 'disable' })}>
            {t('disableAction')}
          </Button>
        </>
      ) : (
        <Button size="sm" variant="success" icon={CheckCircle} onClick={() => setStatusConfirm({ id: u.id, action: 'enable' })}>
          {t('enableAction')}
        </Button>
      )}
    </>
  );

  const renderMobileCard = (u) => (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
          {initialsOf(u.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900 truncate">{u.full_name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">@{u.username}</p>
        </div>
        <StatusBadge status={u.is_active ? 'ACTIVE' : 'DISABLED'} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-neutral-400">{t('branch')}</dt><dd className="text-neutral-700 font-medium truncate">{u.branch_code || '—'}</dd></div>
        <div><dt className="text-neutral-400">{t('phone')}</dt><dd className="text-neutral-700 font-medium truncate">{u.phone || '—'}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2 pt-1">{renderActions(u)}</div>
    </div>
  );

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="h-9" width="w-48" />
              <Skeleton height="h-5" width="w-72" />
            </div>
            <Skeleton height="h-10" width="w-32" />
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
          <h1 className="text-3xl font-semibold text-neutral-900">{t('users')}</h1>
          <ErrorState title={t('unableToLoadUsers')} description={error} onRetry={handleRetry} />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">{t('users')}</h1>
            <p className="text-neutral-500 mt-1.5">{t('usersSubtitle')}</p>
          </div>
          <Button onClick={handleOpenCreate} icon={UserPlus}>
            {t('createUser')}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                icon={Search}
                placeholder={t('searchUsersPlaceholder')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={[
                  { value: 'all', label: t('allStatuses') },
                  { value: 'active', label: t('active') },
                  { value: 'inactive', label: t('inactive') },
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
            <h2 className="text-base font-semibold text-neutral-900">{t('users')} ({filtered.length})</h2>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <EmptyState
                title={t('noEmployeesYet')}
                description={t('noEmployeesYetDesc')}
                icon={UsersIcon}
                action={handleOpenCreate}
                actionText={t('createUser')}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={t('noUsersMatch')}
                description={t('noUsersMatchDesc')}
                icon={UserX}
                action={handleClearFilters}
                actionText={t('clear')}
              />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  rows={paginated}
                  rowKey={(u) => u.id}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? t('editUser') : t('createUser')}
        size="md"
      >
        {showModal && (
          <UserFormModal
            editingUser={editingUser}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>

      <NewPasswordModal password={newPassword} onClose={() => setNewPassword(null)} />

      <ConfirmModal
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleToggleStatus}
        title={statusConfirm?.action === 'enable' ? t('enableUserTitle') : t('disableUserTitle')}
        message={statusConfirm?.action === 'enable' ? t('enableUserMessage') : t('disableUserMessage')}
        confirmText={statusConfirm?.action === 'enable' ? t('enableAction') : t('disableAction')}
        isDangerous={statusConfirm?.action !== 'enable'}
      />

      <ConfirmModal
        isOpen={!!resetPasswordConfirm}
        onClose={() => setResetPasswordConfirm(null)}
        onConfirm={handleResetPassword}
        title={t('resetPasswordConfirmTitle')}
        message={t('resetPasswordConfirmMessage')}
        confirmText={t('resetPasswordAction')}
      />
    </ModernAdminLayout>
  );
};

export default AdminUsersModern;
