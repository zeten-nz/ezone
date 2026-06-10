import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { dashboardAPI, exportAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDays, setSelectedDays] = useState('all');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getDashboard();
        setData(response.data);
      } catch (err) {
        setError('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const response = await exportAPI.exportWarrantyForms(selectedDays);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timeRange = selectedDays === 'all' ? 'all' : `last${selectedDays}days`;
      link.setAttribute('download', `warranty_forms_${new Date().toISOString().split('T')[0]}_${timeRange}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccess('Excel file downloaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">{t('loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h2>
        <p className="text-gray-600 mt-2">Total: {data?.total_forms || 0} forms</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">{t('totalEmployees')}</p>
          <p className="text-4xl font-bold text-blue-600 mt-3">{data?.total_employees || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">{t('totalForms')}</p>
          <p className="text-4xl font-bold text-green-600 mt-3">{data?.total_forms || 0}</p>
        </div>
      </div>

      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('exportData') || 'Export Data'}</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('timePeriod') || 'Time Period'}
            </label>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 1 Week</option>
              <option value="30">Last 1 Month</option>
              <option value="90">Last 3 Months</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last 1 Year</option>
              <option value="all">All Data</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`px-6 py-2 rounded-lg font-medium text-white transition ${
                exporting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Warranty Forms</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('employee')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plate Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_forms && data.recent_forms.length > 0 ? (
                data.recent_forms.map((form) => (
                  <tr key={form.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{form.employee_name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{form.vehicle_plate_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{form.owner_full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(form.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No warranty forms submitted yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
