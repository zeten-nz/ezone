import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeLayout from '../components/EmployeeLayout';
import { warrantyAPI } from '../services/api';
import { regions } from '../regions';

const EmployeeWarrantyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    region: '', city: '', district: '', organization_name: '', organization_phone: '',
    installer_full_name: '', warranty_book_number: '', installation_date: '',
    vehicle_brand: '', vehicle_model: '', vehicle_production_year: '', vehicle_plate_number: '',
    vehicle_vin: '', vehicle_engine_volume: '', vehicle_engine_power: '', vehicle_mileage: '',
    owner_full_name: '', owner_phone: '', reducer_fuel_type: 'LPG', reducer_manufacturer: '',
    reducer_serial_number: '', cylinder_fuel_type: 'LPG', cylinder_manufacturer: '',
    cylinder_serial_number: '', stag_controller_manufacturer: '', stag_controller_serial_number: '',
    injector_rail_manufacturer: '', injector_rail_serial_number: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region') {
      setForm(prev => ({ ...prev, [name]: value, city: '', district: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await warrantyAPI.createForm(form);
      setSuccess('✓ Garantiya shakli muvaffaqiyatli yuborildi!');
      setForm({
        region: '', city: '', district: '', organization_name: '', organization_phone: '',
        installer_full_name: '', warranty_book_number: '', installation_date: '',
        vehicle_brand: '', vehicle_model: '', vehicle_production_year: '', vehicle_plate_number: '',
        vehicle_vin: '', vehicle_engine_volume: '', vehicle_engine_power: '', vehicle_mileage: '',
        owner_full_name: '', owner_phone: '', reducer_fuel_type: 'LPG', reducer_manufacturer: '',
        reducer_serial_number: '', cylinder_fuel_type: 'LPG', cylinder_manufacturer: '',
        cylinder_serial_number: '', stag_controller_manufacturer: '', stag_controller_serial_number: '',
        injector_rail_manufacturer: '', injector_rail_serial_number: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || 'Shak yuborishda xato'));
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', required = true, placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
    </div>
  );

  const SelectField = ({ label, name, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <select name={name} value={form[name]} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
        <option value="">Tanlang...</option>
        {options.filter(opt => opt !== '').map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <EmployeeLayout>
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg mb-6 shadow-lg">
          <h1 className="text-3xl font-bold">Kafolat daftarchasi</h1>
          <p className="text-blue-100 mt-2">Avtomobil gas o'rnatish garantiyasi</p>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>}
        {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b-2 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900">I. GARANTIYA MA'LUMOTLARI</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Viloyat" name="region" options={Object.keys(regions)} />
              <SelectField label="Shahar/Tuman" name="city" options={form.region ? regions[form.region] : []} />
              <InputField label="Tuman" name="district" />
              <InputField label="Tashkilot Nomi" name="organization_name" />
              <InputField label="Tashkilot Telefoni" name="organization_phone" type="tel" />
              <InputField label="O'rnatuvchining F.I.O" name="installer_full_name" />
              <InputField label="Garantiya Daftari Raqami" name="warranty_book_number" />
              <InputField label="O'rnatish Sanasi" name="installation_date" type="date" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b-2 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900">II. AVTOMOBIL MA'LUMOTLARI</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Brend" name="vehicle_brand" />
              <InputField label="Model" name="vehicle_model" />
              <InputField label="Ishlab Chiqarilgan Yil" name="vehicle_production_year" type="number" />
              <InputField label="Raqamli Belgisi" name="vehicle_plate_number" />
              <InputField label="VIN Raqami" name="vehicle_vin" />
              <InputField label="Dvigatel Hajmi" name="vehicle_engine_volume" />
              <InputField label="Dvigatel Quvvati" name="vehicle_engine_power" />
              <InputField label="Probeg (km)" name="vehicle_mileage" type="number" />
              <InputField label="Eganing F.I.O" name="owner_full_name" />
              <InputField label="Eganing Telefoni" name="owner_phone" type="tel" />
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b-2 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900">III. USKUNALAR MA'LUMOTLARI</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Reducer */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">1. Redyuktor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField label="Yonilg'i Turi" name="reducer_fuel_type" options={['LPG', 'CNG']} />
                  <InputField label="Ishlab Chiqaruvchi" name="reducer_manufacturer" />
                  <InputField label="Seriya Raqami" name="reducer_serial_number" />
                </div>
              </div>

              {/* Cylinder */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">2. Tsilinder</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField label="Yonilg'i Turi" name="cylinder_fuel_type" options={['LPG', 'CNG']} />
                  <InputField label="Ishlab Chiqaruvchi" name="cylinder_manufacturer" />
                  <InputField label="Seriya Raqami" name="cylinder_serial_number" />
                </div>
              </div>

              {/* STAG Controller */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">3. STAG Kontrolyeri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Ishlab Chiqaruvchi" name="stag_controller_manufacturer" />
                  <InputField label="Seriya Raqami" name="stag_controller_serial_number" />
                </div>
              </div>

              {/* Injector Rail */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">4. Injektor Relsi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Ishlab Chiqaruvchi" name="injector_rail_manufacturer" />
                  <InputField label="Seriya Raqami" name="injector_rail_serial_number" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}>
              {loading ? '⏳ Yuborilmoqda...' : '✓ Shakl Yuborish'}
            </button>
            <button type="reset" className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold transition">
              Tozalash
            </button>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700"><strong>Eslatma:</strong> Barcha maydonlar "*" belgisi bilan belgilangan majburiy maydonlardir. Shakl to'liq to'ldirilgandan so'ng "Shakl Yuborish" tugmasini bosing.</p>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeWarrantyForm;
