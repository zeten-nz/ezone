import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const AdminWarrantyForms = () => {
  const { t } = useLanguage();
  const [forms, setForms] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalForms, setTotalForms] = useState(0);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await warrantyAPI.getAllForms();
      setAllForms(response.data);
      setTotalForms(response.data.length);
      setForms(response.data.slice(0, pageSize));
    } catch (err) {
      setError('Error loading warranty forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    const filtered = allForms.filter(form =>
      form.vehicle_plate_number.toLowerCase().includes(value.toLowerCase()) ||
      form.owner_full_name.toLowerCase().includes(value.toLowerCase()) ||
      form.employee_name.toLowerCase().includes(value.toLowerCase())
    );
    setTotalForms(filtered.length);
    setCurrentPage(1);
    setForms(filtered.slice(0, pageSize));
  };

  const handlePageChange = (newPage) => {
    let filtered = allForms;
    if (search) {
      filtered = filtered.filter(form =>
        form.vehicle_plate_number.toLowerCase().includes(search.toLowerCase()) ||
        form.owner_full_name.toLowerCase().includes(search.toLowerCase()) ||
        form.employee_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    const start = (newPage - 1) * pageSize;
    setForms(filtered.slice(start, start + pageSize));
    setCurrentPage(newPage);
  };

  const handleDelete = async (formId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await warrantyAPI.deleteForm(formId);
        setSuccess('Form deleted');
        await fetchForms();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error deleting form');
      }
    }
  };

  const handleViewDetail = async (formId) => {
    try {
      const response = await warrantyAPI.getFormDetail(formId);
      setSelectedForm(response.data);
      setShowDetail(true);
    } catch (err) {
      setError('Error loading form details');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalPages = Math.ceil(totalForms / pageSize);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('warrantyForms')}</h2>
        <p className="text-gray-600 mt-2">Total: {totalForms} forms</p>
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

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by plate, owner, or employee..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button
            onClick={() => { setSearch(''); handleSearch(''); }}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('employee')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plate Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('date')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {forms.length > 0 ? (
                forms.map((form, idx) => (
                  <tr key={form.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{form.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{form.employee_name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{form.vehicle_plate_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{form.owner_full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(form.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetail(form.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No warranty forms found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} | Total: {totalForms}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetail && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Form Details</h3>
              <button onClick={() => { setShowDetail(false); setSelectedForm(null); }} className="text-2xl">×</button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-gray-600">Employee:</p><p className="font-bold">{selectedForm.employee_name}</p></div>
                <div><p className="text-gray-600">Date:</p><p className="font-bold">{new Date(selectedForm.installation_date).toLocaleDateString()}</p></div>
                <div><p className="text-gray-600">Brand:</p><p className="font-bold">{selectedForm.vehicle_brand}</p></div>
                <div><p className="text-gray-600">Plate:</p><p className="font-mono font-bold">{selectedForm.vehicle_plate_number}</p></div>
                <div><p className="text-gray-600">Owner:</p><p className="font-bold">{selectedForm.owner_full_name}</p></div>
                <div><p className="text-gray-600">VIN:</p><p className="font-mono">{selectedForm.vehicle_vin}</p></div>
                <div><p className="text-gray-600">Reducer:</p><p>{selectedForm.reducer_manufacturer}</p></div>
                <div><p className="text-gray-600">Cylinder:</p><p>{selectedForm.cylinder_manufacturer}</p></div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={() => { setShowDetail(false); setSelectedForm(null); }} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded">Close</button>
              <button onClick={() => { handleDelete(selectedForm.id); setShowDetail(false); setSelectedForm(null); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWarrantyForms;
