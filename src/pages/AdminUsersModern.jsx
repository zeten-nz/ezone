import { useState, useEffect } from 'react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { userAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import { SkeletonTable } from '../components/UI/Skeleton';

const AdminUsersModern = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    phone: '',
    branch_code: '',
  });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setToast({ type: 'error', message: 'Error loading users' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      username: '',
      password: '',
      phone: '',
      branch_code: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      password: '',
      phone: user.phone || '',
      branch_code: user.branch_code || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, formData);
        setToast({ type: 'success', message: 'User updated successfully' });
      } else {
        await userAPI.createUser(formData);
        setToast({ type: 'success', message: 'User created successfully' });
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Error saving user' });
    }
  };

  const handleDisable = async (userId) => {
    try {
      await userAPI.disableUser(userId);
      setToast({ type: 'success', message: 'User disabled' });
      await fetchUsers();
    } catch (err) {
      setToast({ type: 'error', message: 'Error disabling user' });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordConfirm) return;
    try {
      const newPassword = Math.random().toString(36).slice(-8);
      await userAPI.resetPassword(resetPasswordConfirm, newPassword);
      setToast({ type: 'success', message: `Password reset to: ${newPassword}` });
      setResetPasswordConfirm(null);
      await fetchUsers();
    } catch (err) {
      setToast({ type: 'error', message: 'Error resetting password' });
    }
  };

  const employees = users.filter(u => u.role === 'EMPLOYEE');

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-neutral-900">{t('users')}</h1>
          <SkeletonTable />
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{t('users')}</h1>
            <p className="text-neutral-600 mt-2">Manage system users and permissions</p>
          </div>
          <Button onClick={handleOpenCreate}>
            {t('createUser')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">
              Employees ({employees.length})
            </h2>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="text-left py-4 px-4 font-semibold text-neutral-700">Name</th>
                      <th className="text-left py-4 px-4 font-semibold text-neutral-700">Username</th>
                      <th className="text-left py-4 px-4 font-semibold text-neutral-700">Branch</th>
                      <th className="text-left py-4 px-4 font-semibold text-neutral-700">Phone</th>
                      <th className="text-left py-4 px-4 font-semibold text-neutral-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-neutral-900">{user.full_name}</td>
                        <td className="py-4 px-4 text-neutral-700">{user.username}</td>
                        <td className="py-4 px-4 text-neutral-700">{user.branch_code || '—'}</td>
                        <td className="py-4 px-4 text-neutral-700">{user.phone || '—'}</td>
                        <td className="py-4 px-4">
                          <Badge variant={user.is_active ? 'success' : 'danger'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEdit(user)}
                            >
                              Edit
                            </Button>
                            {user.is_active && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setResetPasswordConfirm(user.id)}
                                >
                                  Reset Pass
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setDeleteConfirm(user.id)}
                                >
                                  Disable
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">No employees yet</p>
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
        <div className="space-y-4">
          <Input
            label={t('fullName') || 'Full Name'}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label={t('username')}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              showPasswordToggle
            />
          )}
          <Input
            label={t('phone')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Branch Code"
            value={formData.branch_code}
            onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          handleDisable(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Disable User"
        message="Are you sure you want to disable this user?"
        confirmText="Disable"
        isDangerous
      />

      <ConfirmModal
        isOpen={!!resetPasswordConfirm}
        onClose={() => setResetPasswordConfirm(null)}
        onConfirm={handleResetPassword}
        title="Reset Password"
        message="A new temporary password will be generated. The user will need to change it on next login."
        confirmText="Reset"
      />
    </ModernAdminLayout>
  );
};

export default AdminUsersModern;
