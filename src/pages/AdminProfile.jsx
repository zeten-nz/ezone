import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { authAPI } from '../services/api';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mening Profilim</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">{success}</div>}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Ma'lumotlari</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">To'liq Ismi</label>
              <p className="mt-1 text-gray-900">{profile?.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Foydalanuvchi Nomi</label>
              <p className="mt-1 text-gray-900">{profile?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <p className="mt-1"><span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{profile?.role}</span></p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefon</label>
              <p className="mt-1 text-gray-900">{profile?.phone || 'Yo\'q'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parolni O'zgartirish</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joriy Parol *</label>
              <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yangi Parol *</label>
              <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yangi Parolni Tasdiqlash *</label>
              <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">Parolni O'zgartirish</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
