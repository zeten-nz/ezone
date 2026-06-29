import { useState } from 'react';
import { MdCheckCircle, MdCameraAlt } from 'react-icons/md';
import ModernEmployeeLayout from '../components/ModernEmployeeLayout';
import { warrantyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { regions } from '../regions';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Toast from '../components/UI/Toast';
import VehicleScannerModal from '../components/VehicleScanner/VehicleScannerModal';

const SectionCard = ({ title, children }) => (
  <Card>
    <CardHeader>
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

const EmployeeWarrantyFormModern = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [scannerOpen, setScannerOpen] = useState(false);

  const [formData, setFormData] = useState({
    region: '',
    city: '',
    district: '',
    organization_name: '',
    organization_phone: '',
    installer_full_name: '',
    warranty_book_number: '',
    installation_date: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_production_year: new Date().getFullYear(),
    vehicle_plate_number: '',
    vehicle_vin: '',
    vehicle_engine_volume: '',
    vehicle_engine_power: '',
    vehicle_mileage: '',
    owner_full_name: '',
    owner_phone: '',
    reducer_fuel_type: 'LPG',
    reducer_manufacturer: '',
    reducer_serial_number: '',
    cylinder_fuel_type: 'LPG',
    cylinder_manufacturer: '',
    cylinder_serial_number: '',
    stag_controller_manufacturer: '',
    stag_controller_serial_number: '',
    injector_rail_manufacturer: '',
    injector_rail_serial_number: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: '',
        district: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'region', 'city', 'district', 'organization_name', 'organization_phone',
      'installer_full_name', 'warranty_book_number', 'installation_date',
      'vehicle_brand', 'vehicle_model', 'vehicle_plate_number', 'vehicle_vin',
      'vehicle_engine_volume', 'vehicle_engine_power', 'vehicle_mileage',
      'owner_full_name', 'owner_phone', 'reducer_manufacturer',
      'reducer_serial_number', 'cylinder_manufacturer', 'cylinder_serial_number',
      'stag_controller_manufacturer', 'stag_controller_serial_number',
      'injector_rail_manufacturer', 'injector_rail_serial_number'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      await warrantyAPI.createForm(formData);
      setToast({ type: 'success', message: 'Warranty form submitted successfully!' });
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          region: '', city: '', district: '',
          organization_name: '', organization_phone: '',
          installer_full_name: '', warranty_book_number: '',
          installation_date: '',
          vehicle_brand: '', vehicle_model: '',
          vehicle_production_year: new Date().getFullYear(),
          vehicle_plate_number: '', vehicle_vin: '',
          vehicle_engine_volume: '', vehicle_engine_power: '',
          vehicle_mileage: '',
          owner_full_name: '', owner_phone: '',
          reducer_fuel_type: 'LPG',
          reducer_manufacturer: '', reducer_serial_number: '',
          cylinder_fuel_type: 'LPG',
          cylinder_manufacturer: '', cylinder_serial_number: '',
          stag_controller_manufacturer: '', stag_controller_serial_number: '',
          injector_rail_manufacturer: '', injector_rail_serial_number: '',
        });
        setSubmitted(false);
      }, 2000);
    } catch {
      setToast({ type: 'error', message: 'Error submitting form' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ModernEmployeeLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <MdCheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Form Submitted!</h2>
            <p className="text-neutral-600">Your warranty form has been submitted successfully</p>
          </div>
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
          <h1 className="text-4xl font-bold text-neutral-900">{t('warrantyForm')}</h1>
          <p className="text-neutral-600 mt-2">{t('empAlert')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard title="Tashkilot tafsilotlari">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t('region')}
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Tanlang...' }, ...Object.keys(regions).map(r => ({ value: r, label: r }))]}
                error={errors.region}
                required
              />
              <Select
                label={t('city')}
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                options={[{ value: '', label: 'Tanlang...' }, ...(formData.region ? regions[formData.region].map(c => ({ value: c, label: c })) : [])]}
                error={errors.city}
                required
              />
              <Input
                label={t('district')}
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                error={errors.district}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('organizationName')}
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                error={errors.organization_name}
                required
              />
              <Input
                label={t('organizationPhone')}
                name="organization_phone"
                type="tel"
                value={formData.organization_phone}
                onChange={handleInputChange}
                error={errors.organization_phone}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('installerName')}
                name="installer_full_name"
                value={formData.installer_full_name}
                onChange={handleInputChange}
                error={errors.installer_full_name}
                required
              />
              <Input
                label={t('warrantyBookNumber')}
                name="warranty_book_number"
                value={formData.warranty_book_number}
                onChange={handleInputChange}
                error={errors.warranty_book_number}
                required
              />
            </div>
            <Input
              label={t('installationDate')}
              name="installation_date"
              type="date"
              value={formData.installation_date}
              onChange={handleInputChange}
              error={errors.installation_date}
              required
            />
          </SectionCard>

          <SectionCard title="Avtomobil haqida ma'lumot">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScannerOpen(true)}
              >
                <MdCameraAlt className="w-4 h-4 mr-1 inline" />
                Guvohnomani Skanerla
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('vehicleBrand')}
                name="vehicle_brand"
                value={formData.vehicle_brand}
                onChange={handleInputChange}
                error={errors.vehicle_brand}
                required
              />
              <Input
                label={t('vehicleModel')}
                name="vehicle_model"
                value={formData.vehicle_model}
                onChange={handleInputChange}
                error={errors.vehicle_model}
                required
              />
              <Input
                label={t('productionYear')}
                name="vehicle_production_year"
                type="number"
                value={formData.vehicle_production_year}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('plateNumber')}
                name="vehicle_plate_number"
                value={formData.vehicle_plate_number}
                onChange={handleInputChange}
                error={errors.vehicle_plate_number}
                required
              />
              <Input
                label={t('vinNumber')}
                name="vehicle_vin"
                value={formData.vehicle_vin}
                onChange={handleInputChange}
                error={errors.vehicle_vin}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('engineVolume')}
                name="vehicle_engine_volume"
                value={formData.vehicle_engine_volume}
                onChange={handleInputChange}
                error={errors.vehicle_engine_volume}
                required
              />
              <Input
                label={t('enginePower')}
                name="vehicle_engine_power"
                value={formData.vehicle_engine_power}
                onChange={handleInputChange}
                error={errors.vehicle_engine_power}
                required
              />
              <Input
                label={t('mileage')}
                name="vehicle_mileage"
                type="number"
                value={formData.vehicle_mileage}
                onChange={handleInputChange}
                error={errors.vehicle_mileage}
                required
              />
            </div>
          </SectionCard>

          <SectionCard title="Egasi haqida ma'lumot">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('ownerName')}
                name="owner_full_name"
                value={formData.owner_full_name}
                onChange={handleInputChange}
                error={errors.owner_full_name}
                required
              />
              <Input
                label={t('ownerPhone')}
                name="owner_phone"
                type="tel"
                value={formData.owner_phone}
                onChange={handleInputChange}
                error={errors.owner_phone}
                required
              />
            </div>
          </SectionCard>

          <SectionCard title="Uskuna tafsilotlari">
            <h3 className="font-semibold text-neutral-900 mb-4">{t('reducer')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t('fuelType')}
                name="reducer_fuel_type"
                value={formData.reducer_fuel_type}
                onChange={handleInputChange}
                options={[
                  { value: 'LPG', label: 'LPG' },
                  { value: 'CNG', label: 'CNG' },
                ]}
              />
              <Input
                label={t('manufacturer')}
                name="reducer_manufacturer"
                value={formData.reducer_manufacturer}
                onChange={handleInputChange}
                error={errors.reducer_manufacturer}
                required
              />
              <Input
                label={t('serialNumber')}
                name="reducer_serial_number"
                value={formData.reducer_serial_number}
                onChange={handleInputChange}
                error={errors.reducer_serial_number}
                required
              />
            </div>

            <h3 className="font-semibold text-neutral-900 mb-4 mt-6">{t('cylinder')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t('fuelType')}
                name="cylinder_fuel_type"
                value={formData.cylinder_fuel_type}
                onChange={handleInputChange}
                options={[
                  { value: 'LPG', label: 'LPG' },
                  { value: 'CNG', label: 'CNG' },
                ]}
              />
              <Input
                label={t('manufacturer')}
                name="cylinder_manufacturer"
                value={formData.cylinder_manufacturer}
                onChange={handleInputChange}
                error={errors.cylinder_manufacturer}
                required
              />
              <Input
                label={t('serialNumber')}
                name="cylinder_serial_number"
                value={formData.cylinder_serial_number}
                onChange={handleInputChange}
                error={errors.cylinder_serial_number}
                required
              />
            </div>

            <h3 className="font-semibold text-neutral-900 mb-4 mt-6">{t('controller')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('manufacturer')}
                name="stag_controller_manufacturer"
                value={formData.stag_controller_manufacturer}
                onChange={handleInputChange}
                error={errors.stag_controller_manufacturer}
                required
              />
              <Input
                label={t('serialNumber')}
                name="stag_controller_serial_number"
                value={formData.stag_controller_serial_number}
                onChange={handleInputChange}
                error={errors.stag_controller_serial_number}
                required
              />
            </div>

            <h3 className="font-semibold text-neutral-900 mb-4 mt-6">{t('injectorRail')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('manufacturer')}
                name="injector_rail_manufacturer"
                value={formData.injector_rail_manufacturer}
                onChange={handleInputChange}
                error={errors.injector_rail_manufacturer}
                required
              />
              <Input
                label={t('serialNumber')}
                name="injector_rail_serial_number"
                value={formData.injector_rail_serial_number}
                onChange={handleInputChange}
                error={errors.injector_rail_serial_number}
                required
              />
            </div>
          </SectionCard>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="reset">
              {t('clear')}
            </Button>
            <Button type="submit" loading={loading}>
              {t('submitForm')}
            </Button>
          </div>
        </form>

        <VehicleScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onComplete={(data) => {
            setFormData(prev => ({ ...prev, ...data }));
            setScannerOpen(false);
          }}
        />
      </div>
    </ModernEmployeeLayout>
  );
};

export default EmployeeWarrantyFormModern;
