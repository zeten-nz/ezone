import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  uz: {
    login: 'Kirish',
    logout: 'Chiqish',
    profile: 'Profil',
    dashboard: 'Bosh Sahifa',
    welcome: 'Xush kelibsiz',
    username: 'Foydalanuvchi Nomi',
    password: 'Parol',
    currentPassword: 'Joriy Parol',
    newPassword: 'Yangi Parol',
    confirmPassword: 'Parolni Tasdiqlash',
    changePassword: 'Parolni O\'zgartirish',
    loginFailed: 'Kirish muvaffaqiyatsiz',
    passwordChanged: 'Parol o\'zgartirildi',
    warrantyForm: 'Kafolat daftari',
    submitForm: 'Yuborish',
    formSubmitted: 'Muvaffaqiyatli yuborildi',
    myProfile: 'Mening Profilim',
    users: 'Foydalanuvchilar',
    manageUsers: 'Foydalanuvchilarni Boshqarish',
    createUser: 'Yangi Foydalanuvchi Yaratish',
    editUser: 'Tahrirlash',
    deleteUser: 'O\'chirish',
    warrantyForms: 'Kafolat daftarlari',
    searchForms: 'Qidirish',
    exportExcel: 'Excel Eksport',
    totalForms: 'Jami Shakslar',
    totalEmployees: 'Jami Xodimlar',
    warrantyInfo: 'Garantiya Ma\'lumotlari',
    vehicleInfo: 'Avtomobil Ma\'lumotlari',
    equipmentInfo: 'Uskunalar Ma\'lumotlari',
    region: 'Viloyat',
    city: 'Shahar',
    district: 'Tuman',
    organizationName: 'Tashkilot Nomi',
    organizationPhone: 'Tashkilot Tel',
    installerName: 'O\'rnatuvchi Ismi',
    warrantyBookNumber: 'Garantiya Raqami',
    installationDate: 'O\'rnatish Sanasi',
    vehicleBrand: 'Avtomobil Brendi',
    vehicleModel: 'Model',
    productionYear: 'Yil',
    plateNumber: 'Raqamli Belgisi',
    vinNumber: 'VIN',
    engineVolume: 'Dvigatel Hajmi',
    enginePower: 'Dvigatel Quvvati',
    mileage: 'Probeg',
    ownerName: 'Eganing Ismi',
    ownerPhone: 'Eganing Tel',
    reducer: 'Redyuktor',
    cylinder: 'Tsilinder',
    controller: 'STAG Kontrolyeri',
    injectorRail: 'Injektor Relsi',
    fuelType: 'Yonilgi Turi',
    manufacturer: 'Ishlab Chiqaruvchi',
    serialNumber: 'Seriya Raqami',
    save: 'Saqlash',
    cancel: 'Bekor',
    delete: 'O\'chirish',
    view: 'Ko\'rish',
    clear: 'Tozalash',
    loading: 'Yuklanmoqda...',
    error: 'Xato',
    success: 'Muvaffaqiyat',
    search: 'Qidirish',
    filter: 'Filter',
    employee: 'Xodim',
    required: 'Majburiy',
    date: 'Sana',
    phone: 'Telefon',
    actions: 'Amallar',
    exportData: 'Ma\'lumotlarni Eksport Qilish',
    timePeriod: 'Vaqt Oralig\'i',
    loginTitle: "Sistema boshqaruv kafolati",
    empAlert: "O'rnatishingiz uchun kafolat formasi tafsilotlarini to'ldiring",
    empProfile: "Hisob sozlamalaringiz boshqaring",
    empAccount: "Hisob ma'lumotlari",
    empAccountDetails: "Hisobingizning asosiy ma'lumotlari"
  },
  ru: {
    login: 'Вход',
    logout: 'Выход',
    profile: 'Профиль',
    dashboard: 'Главная',
    welcome: 'Добро пожаловать',
    username: 'Имя пользователя',
    password: 'Пароль',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтвердить пароль',
    changePassword: 'Изменить пароль',
    loginFailed: 'Ошибка входа',
    passwordChanged: 'Пароль изменен',
    warrantyForm: 'Гарантийная форма',
    submitForm: 'Отправить',
    formSubmitted: 'Успешно отправлено',
    myProfile: 'Мой профиль',
    users: 'Пользователи',
    manageUsers: 'Управление пользователями',
    createUser: 'Создать пользователя',
    editUser: 'Редактировать',
    deleteUser: 'Удалить',
    warrantyForms: 'Гарантийные формы',
    searchForms: 'Поиск',
    exportExcel: 'Экспорт Excel',
    totalForms: 'Всего форм',
    totalEmployees: 'Всего сотрудников',
    warrantyInfo: 'Информация о гарантии',
    vehicleInfo: 'Информация об автомобиле',
    equipmentInfo: 'Информация об оборудовании',
    region: 'Область',
    city: 'Город',
    district: 'Район',
    organizationName: 'Название организации',
    organizationPhone: 'Телефон организации',
    installerName: 'Имя установщика',
    warrantyBookNumber: 'Номер гарантии',
    installationDate: 'Дата установки',
    vehicleBrand: 'Марка автомобиля',
    vehicleModel: 'Модель',
    productionYear: 'Год',
    plateNumber: 'Номерной знак',
    vinNumber: 'VIN',
    engineVolume: 'Объем двигателя',
    enginePower: 'Мощность двигателя',
    mileage: 'Пробег',
    ownerName: 'Имя владельца',
    ownerPhone: 'Телефон владельца',
    reducer: 'Редуктор',
    cylinder: 'Цилиндр',
    controller: 'Контроллер STAG',
    injectorRail: 'Инжекторная рейка',
    fuelType: 'Тип топлива',
    manufacturer: 'Производитель',
    serialNumber: 'Серийный номер',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    view: 'Просмотр',
    clear: 'Очистить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    search: 'Поиск',
    filter: 'Фильтр',
    employee: 'Сотрудник',
    required: 'Обязательно',
    date: 'Дата',
    phone: 'Телефон',
    actions: 'Действия',
    exportData: 'Экспорт данных',
    timePeriod: 'Период времени',
    loginTitle: "Система управления гарантиями",
    empAlert: "Заполните форму гарантии, указав данные о вашей установке.",
    empProfile: "Управление настройками учетной записи",
    empAccount: "Информация об учетной записи",
    empAccountDetails: "Основные данные вашей учетной записи"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('ezone_language');
    return saved || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('ezone_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'uz' ? 'ru' : 'uz');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
