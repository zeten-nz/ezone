import { useState, useEffect } from 'react';
import { MdPeople, MdArticle, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { dashboardAPI, exportAPI } from '../services/api';
import { downloadBlob, buildExportFilename } from '../utils/download';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import { SkeletonCard } from '../components/UI/Skeleton';

const KPICard = ({ title, value, Icon, trend }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>
          {trend && (
            <p className={`flex items-center gap-1 text-sm mt-2 font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0
                ? <MdArrowUpward className="w-4 h-4" />
                : <MdArrowDownward className="w-4 h-4" />
              }
              {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const AdminDashboardModern = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedDays, setSelectedDays] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getDashboard();
        setData(response.data);
      } catch {
        setToast({ type: 'error', message: 'Error loading dashboard' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportAPI.exportWarrantyForms(selectedDays);
      downloadBlob(response.data, buildExportFilename('warranty_forms', selectedDays));
      setToast({ type: 'success', message: 'Excel file downloaded successfully' });
    } catch (err) {
      setToast({ type: 'error', message: err?.message || 'Error exporting data' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
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

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">{t('dashboard')}</h1>
          <p className="text-neutral-600 mt-2">Welcome back! Here's your system overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title={t('totalEmployees')}
            value={data?.total_employees || 0}
            Icon={MdPeople}
            trend={12}
          />
          <KPICard
            title={t('totalForms')}
            value={data?.total_forms || 0}
            Icon={MdArticle}
            trend={24}
          />
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">{t('exportData') || 'Export Data'}</h2>
            <p className="text-sm text-neutral-600 mt-1">Download warranty forms with optional date filtering</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('timePeriod') || 'Time Period'}
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value)}
                options={[
                  { value: '7', label: 'Last 1 Week' },
                  { value: '30', label: 'Last 1 Month' },
                  { value: '90', label: 'Last 3 Months' },
                  { value: '180', label: 'Last 6 Months' },
                  { value: '365', label: 'Last 1 Year' },
                  { value: 'all', label: 'All Data' },
                ]}
              />
              <div className="flex items-end">
                <Button
                  onClick={handleExport}
                  loading={exporting}
                  className="w-full"
                >
                  {exporting ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            {data?.recent_forms && data.recent_forms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">{t('employee')}</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Vehicle</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Owner</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_forms.map((form, idx) => (
                      <tr
                        key={form.id}
                        className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-neutral-900">{form.employee_name}</td>
                        <td className="py-3 px-4 font-mono text-neutral-700">{form.vehicle_plate_number}</td>
                        <td className="py-3 px-4 text-neutral-700">{form.owner_full_name}</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {new Date(form.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">No warranty forms submitted yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  );
};

export default AdminDashboardModern;
