import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { userAPI } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  const [createForm, setCreateForm] = useState({
    full_name: '', username: '', password: '', phone: '', branch_code: '',
  });

  const [editForm, setEditForm] = useState({
    full_name: '', phone: '', branch_code: '',
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Foydalanuvchilarni yuklab olishda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await userAPI.createUser(createForm);
      setSuccess('Foydalanuvchi muvaffaqiyatli yaratildi!');
      setCreateForm({ full_name: '', username: '', password: '', phone: '', branch_code: '' });
      setShowCreateForm(false);
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Foydalanuvchini yaratishda xato');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await userAPI.updateUser(selectedUser.id, editForm);
      setSuccess('Foydalanuvchi muvaffaqiyatli yangilandi!');
      setShowEditForm(false);
      setSelectedUser(null);
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Foydalanuvchini yangilashda xato');
    }
  };

  const handleDisableUser = async (userId) => {
    if (window.confirm('Siz bu foydalanuvchini o\'chirishni xohlaysizmi?')) {
      setError('');
      try {
        await userAPI.disableUser(userId);
        setSuccess('Foydalanuvchi muvaffaqiyatli o\'chirildi!');
        await fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Foydalanuvchini o\'chirishda xato');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (resetPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      await userAPI.resetPassword(selectedUser.id, resetPassword);
      setSuccess('Parol muvaffaqiyatli tiklandi!');
      setShowPasswordReset(false);
      setResetPassword('');
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Parolni tiklaashda xato');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      phone: user.phone || '',
      branch_code: user.branch_code || '',
    });
    setShowEditForm(true);
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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Foydalanuvchilarni Boshqarish</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          {showCreateForm ? 'Bekor Qilish' : 'Yangi Foydalanuvchi Yaratish'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">{success}</div>}

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yangi Foydalanuvchi Yaratish</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder="To'liq Ismi *" required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} placeholder="Foydalanuvchi Nomi *" required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Parol *" required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="tel" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="Telefon" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="md:col-span-2">
                <input type="text" value={createForm.branch_code} onChange={(e) => setCreateForm({ ...createForm, branch_code: e.target.value })} placeholder="Filial Kodi" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Foydalanuvchi Yaratish</button>
          </form>
        </div>
      )}

      {showEditForm && selectedUser && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Foydalanuvchini Tahrirlash: {selectedUser.full_name}</h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} placeholder="To'liq Ismi *" required className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Telefon" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="md:col-span-2">
                <input type="text" value={editForm.branch_code} onChange={(e) => setEditForm({ ...editForm, branch_code: e.target.value })} placeholder="Filial Kodi" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Foydalanuvchini Yangilash</button>
            <button type="button" onClick={() => { setShowEditForm(false); setSelectedUser(null); }} className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition">Bekor Qilish</button>
          </form>
        </div>
      )}

      {showPasswordReset && selectedUser && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parol Tikla: {selectedUser.full_name}</h3>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Yangi Parol *" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Parolni Tikla</button>
            <button type="button" onClick={() => { setShowPasswordReset(false); setResetPassword(''); }} className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition">Bekor Qilish</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ismi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Foydalanuvchi Nomi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telefon</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Filial</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Holati</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'Yo\'q'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.branch_code || 'Yo\'q'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Faol' : 'O\'chirilgan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {user.is_active && (
                        <>
                          <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-800 font-medium">Tahrirlash</button>
                          <button onClick={() => { setSelectedUser(user); setShowPasswordReset(true); }} className="text-yellow-600 hover:text-yellow-800 font-medium">Parol</button>
                          <button onClick={() => handleDisableUser(user.id)} className="text-red-600 hover:text-red-800 font-medium">O'chirish</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-600 text-sm">Foydalanuvchilar topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
