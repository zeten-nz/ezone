import { useState, useEffect } from 'react';
import EmployeeLayout from '../components/EmployeeLayout';
import { authAPI, exportAPI } from '../services/api';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedDays, setSelectedDays] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (err) {
        setError('Profilni yuklab olishda xato');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Yangi parollar mos kelmadi');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      await authAPI.changePassword(
        passwords.currentPassword,
        passwords.newPassword
      );
      setSuccess('Parol muvaffaqiyatli o\'zgartirildi!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Parol o\'zgartirilmadi');
    }
  };

  const handleExport = async () => {
    if (!profile?.id) return;
    setExporting(true);
    try {
      const response = await exportAPI.exportEmployeeData(profile.id, selectedDays);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timeRange = selectedDays === 'all' ? 'all' : `last${selectedDays}days`;
      link.setAttribute('download', `my_warranty_${new Date().toISOString().split('T')[0]}_${timeRange}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccess('Excel fayl yuklab olindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Excel eksport xatosi');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mening Profilim</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mening Garantiya Ma'lumotlarini Eksport Qilish
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaqt Oralig'i
              </label>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Oxirgi 1 Hafta</option>
                <option value="30">Oxirgi 1 Oy</option>
                <option value="90">Oxirgi 3 Oy</option>
                <option value="180">Oxirgi 6 Oy</option>
                <option value="365">Oxirgi 1 Yil</option>
                <option value="all">Barcha Ma'lumotlar</option>
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
                {exporting ? 'Eksport...' : 'Excel Yuklab Olish'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Profil Ma'lumotlari
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                To'liq Ismi
              </label>
              <p className="mt-1 text-gray-900">{profile?.full_name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Foydalanuvchi Nomi
              </label>
              <p className="mt-1 text-gray-900">{profile?.username}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Telefon
              </label>
              <p className="mt-1 text-gray-900">{profile?.phone || 'Yo\'q'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Filial
              </label>
              <p className="mt-1 text-gray-900">
                {profile?.branch_code || 'Belgilanmagan'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Parolni O'zgartirish
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joriy Parol *
              </label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yangi Parol *
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yangi Parolni Tasdiqlash *
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
            >
              Parolni O'zgartirish
            </button>
          </form>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeProfile;
