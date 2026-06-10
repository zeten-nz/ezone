import { useState, useEffect } from 'react';
import ModernAdminLayout from '../components/ModernAdminLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Toast from '../components/UI/Toast';
import EmptyState from '../components/UI/EmptyState';
import { ConfirmModal, Modal } from '../components/UI/Modal';
import { SkeletonTable } from '../components/UI/Skeleton';

const AdminWarrantyFormsModern = () => {
  const { t } = useLanguage();
  const [forms, setForms] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalForms, setTotalForms] = useState(0);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    updatePagination();
  }, [search, pageSize, allForms]);

  const fetchForms = async () => {
    try {
      const response = await warrantyAPI.getAllForms();
      setAllForms(response.data);
      setTotalForms(response.data.length);
    } catch (err) {
      setToast({ type: 'error', message: 'Error loading warranty forms' });
    } finally {
      setLoading(false);
    }
  };

  const updatePagination = () => {
    let filtered = allForms;
    if (search) {
      filtered = filtered.filter(form =>
        form.vehicle_plate_number.toLowerCase().includes(search.toLowerCase()) ||
        form.owner_full_name.toLowerCase().includes(search.toLowerCase()) ||
        form.employee_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setTotalForms(filtered.length);
    const start = (currentPage - 1) * pageSize;
    setForms(filtered.slice(start, start + pageSize));
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await warrantyAPI.deleteForm(deleteConfirm);
      setToast({ type: 'success', message: 'Form deleted successfully' });
      setDeleteConfirm(null);
      await fetchForms();
    } catch (err) {
      setToast({ type: 'error', message: 'Error deleting form' });
    }
  };

  const handleViewDetail = async (formId) => {
    try {
      const response = await warrantyAPI.getFormDetail(formId);
      setSelectedForm(response.data);
      setShowDetail(true);
    } catch (err) {
      setToast({ type: 'error', message: 'Error loading form details' });
    }
  };

  const totalPages = Math.ceil(totalForms / pageSize);

  if (loading) {
    return (
      <ModernAdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-neutral-900">{t('warrantyForms')}</h1>
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
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('warrantyForms')}</h1>
          <p className="text-neutral-600 mt-2">Manage and view all warranty form submissions</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Search & Filter</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by plate, owner, or employee..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              {search && (
                <Button
                  variant="secondary"
                  onClick={() => handleSearch('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                All Forms ({totalForms})
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            {forms.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">ID</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">{t('employee')}</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Plate</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Owner</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">{t('date')}</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map((form) => (
                        <tr
                          key={form.id}
                          className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-neutral-900">{form.id}</td>
                          <td className="py-4 px-4 text-neutral-700">{form.employee_name}</td>
                          <td className="py-4 px-4 font-mono text-neutral-700">{form.vehicle_plate_number}</td>
                          <td className="py-4 px-4 text-neutral-700">{form.owner_full_name}</td>
                          <td className="py-4 px-4 text-neutral-600">
                            {new Date(form.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetail(form.id)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setDeleteConfirm(form.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                    <p className="text-sm text-neutral-600">
                      Page {currentPage} of {totalPages} • Total: {totalForms}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                        <Button
                          key={i + 1}
                          size="sm"
                          variant={currentPage === i + 1 ? 'primary' : 'secondary'}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No warranty forms found"
                description="Adjust your search filters to find warranty forms"
                icon={() => <span className="text-3xl">🔍</span>}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showDetail && !!selectedForm}
        onClose={() => setShowDetail(false)}
        title="Form Details"
        size="2xl"
      >
        {selectedForm && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Employee</p>
                <p className="font-medium text-neutral-900">{selectedForm.employee_name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Date</p>
                <p className="font-medium text-neutral-900">
                  {new Date(selectedForm.installation_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-4">
              <h3 className="font-semibold text-neutral-900">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Brand</p>
                  <p className="font-medium text-neutral-900">{selectedForm.vehicle_brand}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Model</p>
                  <p className="font-medium text-neutral-900">{selectedForm.vehicle_model}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Plate Number</p>
                  <p className="font-mono font-medium text-neutral-900">{selectedForm.vehicle_plate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">VIN</p>
                  <p className="font-mono font-medium text-neutral-900">{selectedForm.vehicle_vin}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-4">
              <h3 className="font-semibold text-neutral-900">Owner Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Name</p>
                  <p className="font-medium text-neutral-900">{selectedForm.owner_full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-900">{selectedForm.owner_phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Form"
        message="Are you sure you want to delete this warranty form? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </ModernAdminLayout>
  );
};

export default AdminWarrantyFormsModern;
