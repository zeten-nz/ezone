import { useState, useEffect, useCallback } from 'react';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { authAPI, exportAPI } from '../services/api';
import { downloadBlob, buildExportFilename } from '../utils/download';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/UI/Toast';
import ErrorState from '../components/UI/ErrorState';
import ProfileHeader from '../components/Profile/ProfileHeader';
import PersonalInfoCard from '../components/Profile/PersonalInfoCard';
import SecurityCard from '../components/Profile/SecurityCard';
import ProfilePhotoCard from '../components/Profile/ProfilePhotoCard';
import ExportCard from '../components/Profile/ExportCard';

/**
 * Shared by both roles (/profile for employees, /admin/profile for admins).
 * Orchestrator only — each section is its own component under
 * components/Profile/ so this stays readable as the page grows.
 */
const EmployeeProfileModern = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [selectedDays, setSelectedDays] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  // Bumping photoVersion forces AuthenticatedPhoto to re-fetch even when
  // `has_photo` itself doesn't change (e.g. replacing one photo with
  // another) — refetching the profile alone wouldn't be enough to bust that
  // cache since the filename isn't exposed to the client at all.
  const handlePhotoChanged = useCallback(() => {
    setPhotoVersion((v) => v + 1);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportAPI.exportEmployeeData(user.id, selectedDays, language);
      downloadBlob(response.data, buildExportFilename('my_warranty', selectedDays));
      setToast({ type: 'success', message: t('exportToExcel') });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
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

  if (error) {
    return (
      <ModernEmployeeLayout>
        <ErrorState title={t('unableToLoadProfile')} description={error} onRetry={() => setRefreshKey((k) => k + 1)} />
      </ModernEmployeeLayout>
    );
  }

  return (
    <ModernEmployeeLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <ProfileHeader profile={profile} photoVersion={photoVersion} t={t} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoCard profile={profile} t={t} language={language} />
            <SecurityCard t={t} onToast={setToast} />
          </div>
          <div className="space-y-6">
            <ProfilePhotoCard
              profile={profile}
              photoVersion={photoVersion}
              onPhotoChanged={handlePhotoChanged}
              t={t}
              onToast={setToast}
            />
            <ExportCard
              t={t}
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
              onExport={handleExport}
              exporting={exporting}
            />
          </div>
        </div>
      </div>
    </ModernEmployeeLayout>
  );
};

export default EmployeeProfileModern;
