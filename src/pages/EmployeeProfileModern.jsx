import { useState, useEffect } from 'react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { authAPI, exportAPI } from '../services/api';
import { downloadBlob, buildExportFilename } from '../utils/download';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import Badge from '../components/UI/Badge';

const EmployeeProfileModern = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedDays, setSelectedDays] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch {
        setToast({ type: 'error', message: 'Error loading profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await authAPI.changePassword(passwords.currentPassword, passwords.newPassword);
      setToast({ type: 'success', message: 'Password changed successfully' });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Error changing password' });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportAPI.exportEmployeeData(user.id, selectedDays);
      downloadBlob(response.data, buildExportFilename('my_warranty', selectedDays));
      setToast({ type: 'success', message: 'Excel file downloaded' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error exporting data' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <ModernEmployeeLayout>
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        </div>
      </ModernEmployeeLayout>
    );
  }

  return (
    <ModernEmployeeLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">{t('myProfile')}</h1>
          <p className="text-neutral-600 mt-2">{t('empProfile')}</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">{t('empAccount')}</h2>
              <p className="text-sm text-neutral-600 mt-1">{t('empAccountDetails')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                  <div className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900">
                    {profile?.full_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Username</label>
                  <div className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900">
                    {profile?.username}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                  <div className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900">
                    {profile?.phone || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Branch Code</label>
                  <div className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900">
                    {profile?.branch_code || '—'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                <Badge variant="success">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Ma'lumotlarimni eksport qilish</h2>
              <p className="text-sm text-neutral-600 mt-1">Kafolat formasini yuklab oling</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('timePeriod') || 'Time Period'}
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  options={[
                    { value: '7', label: 'oxirgi 1 hafta' },
                    { value: '30', label: 'oxirgi 1 oy' },
                    { value: '90', label: 'oxirgi 3 oy' },
                    { value: '180', label: 'oxirgi 6 oy' },
                    { value: '365', label: 'oxirgi 1 yil' },
                    { value: 'all', label: 'Hammasi' },
                  ]}
                />
                <div className="flex items-end">
                  <Button
                    onClick={handleExport}
                    loading={exporting}
                    className="w-full"
                  >
                    {exporting ? 'Exporting...' : 'Download Excel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Xavfsizlik sozlamalari</h2>
              <p className="text-sm text-neutral-600 mt-1">Parolingiz va xavfsizligingizni boshqaring</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label={t('currentPassword')}
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPassword: e.target.value })
                  }
                  showPasswordToggle
                  required
                />
                <Input
                  label={t('newPassword')}
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  showPasswordToggle
                  hint="At least 6 characters"
                  required
                />
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                  }
                  showPasswordToggle
                  required
                />
                <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
                  <Button variant="secondary">
                    {t('cancel')}
                  </Button>
                  <Button type="submit">
                    {t('changePassword')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernEmployeeLayout>
  );
};

export default EmployeeProfileModern;
