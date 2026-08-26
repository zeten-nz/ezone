/**
 * BILINGUAL ERROR MESSAGE DICTIONARY
 *
 * The backend's `message` field is for server-side logs only — it's always
 * English (express-validator, hardcoded strings) and MUST NEVER be shown to
 * the user (see ezone-server/middleware/errorHandler.js and every controller,
 * which all send an `errorCode` alongside `message` for exactly this reason).
 *
 * src/api/client.js looks up the backend's `errorCode` here to build the
 * AppError.message that pages actually display. This is the single place
 * new backend error codes need a bilingual entry added.
 */

const ERROR_CODE_MESSAGES = {
  VALIDATION_ERROR: { uz: "Kiritilgan ma'lumotlarni tekshiring.", ru: 'Проверьте введённые данные.' },
  BAD_REQUEST: { uz: "So'rov noto'g'ri. Ma'lumotlarni tekshiring.", ru: 'Некорректный запрос. Проверьте данные.' },
  UNAUTHORIZED: { uz: 'Sessiya muddati tugadi. Iltimos, qayta kiring.', ru: 'Сессия истекла. Пожалуйста, войдите снова.' },
  FORBIDDEN: { uz: "Bu amalni bajarish uchun ruxsatingiz yo'q.", ru: 'У вас нет прав для выполнения этого действия.' },
  NOT_FOUND: { uz: "So'ralgan ma'lumot topilmadi.", ru: 'Запрашиваемые данные не найдены.' },
  CONFLICT: { uz: 'Bunday yozuv allaqachon mavjud.', ru: 'Такая запись уже существует.' },
  INVALID_STATE: { uz: "Bu so'rov allaqachon ko'rib chiqilgan.", ru: 'Эта заявка уже была рассмотрена.' },
  INVALID_CREDENTIALS: { uz: "Login yoki parol noto'g'ri.", ru: 'Неверный логин или пароль.' },
  ACCOUNT_PENDING_APPROVAL: { uz: "Sizning so'rovingiz hali administrator tomonidan tasdiqlanmagan.", ru: 'Ваша заявка еще не подтверждена администратором.' },
  ACCOUNT_REJECTED: { uz: "Sizning so'rovingiz administrator tomonidan rad etilgan.", ru: 'Ваша заявка была отклонена администратором.' },
  INVALID_CURRENT_PASSWORD: { uz: "Joriy parol noto'g'ri.", ru: 'Текущий пароль неверен.' },
  INVALID_FILE_TYPE: { uz: "Fayl formati noto'g'ri. Faqat JPG, PNG yoki WEBP.", ru: 'Неверный формат файла. Только JPG, PNG или WEBP.' },
  INVALID_FILE: { uz: 'Fayl yaroqsiz.', ru: 'Файл недействителен.' },
  FILE_TOO_LARGE: { uz: "Fayl hajmi juda katta (5 MB dan oshmasligi kerak).", ru: 'Файл слишком большой (не более 5 МБ).' },
  EDIT_WINDOW_EXPIRED: { uz: 'Tahrirlash muddati (24 soat) tugagan.', ru: 'Время редактирования (24 часа) истекло.' },
  INCOMPLETE_PROFILE: { uz: "Profilingizda filial ma'lumotlari yo'q — administratorga murojaat qiling.", ru: 'В вашем профиле не указан филиал — обратитесь к администратору.' },
  EQUIPMENT_INCOMPLETE: { uz: "Barcha 4 ta jihoz turini tanlashingiz kerak (Redyuktor, Tsilindr, Kontroller, Injektor relsi).", ru: 'Необходимо выбрать все 4 типа оборудования (Редуктор, Цилиндр, Контроллер, Инжекторная рейка).' },
  PRODUCT_INACTIVE: { uz: 'Tanlangan mahsulot endi faol emas.', ru: 'Выбранный продукт больше не активен.' },
  PRODUCT_IN_USE: { uz: "Bu mahsulot mavjud kafolatlarda ishlatilgan va o'chirib bo'lmaydi — uni faolsizlantiring.", ru: 'Этот продукт используется в существующих гарантиях и не может быть удалён — деактивируйте его.' },
  BRAND_NOT_FOUND: { uz: "Tanlangan brend mavjud emas.", ru: 'Выбранный бренд не существует.' },
  BRAND_IN_USE: { uz: "Bu brend mahsulotlarda ishlatilmoqda va o'chirilmaydi — uni faolsizlantiring.", ru: 'Этот бренд используется в продуктах и не может быть удалён — деактивируйте его.' },
  CAR_IN_USE: { uz: "Bu avtomobil kafolatlarda ishlatilmoqda va o'chirilmaydi — uni faolsizlantiring.", ru: 'Этот автомобиль используется в гарантиях и не может быть удалён — деактивируйте его.' },
  TOO_MANY_REQUESTS: { uz: "So'rovlar soni juda ko'p. Birozdan so'ng qayta urinib ko'ring.", ru: 'Слишком много запросов. Повторите попытку позже.' },
  TIMEOUT: { uz: "So'rov vaqti tugadi. Qaytadan urinib ko'ring.", ru: 'Время ожидания истекло. Попробуйте снова.' },
  NETWORK_ERROR: { uz: 'Internet aloqasini tekshiring.', ru: 'Проверьте подключение к интернету.' },
  UNKNOWN_ERROR: { uz: "Nimadir xato ketdi. Qaytadan urinib ko'ring.", ru: 'Что-то пошло не так. Попробуйте снова.' },

  // Inventory barcode validation — still returned by the standalone
  // Inventory module's GET /api/inventory/validate/:barcode endpoint (the
  // warranty workflow no longer performs inventory validation; temporary
  // product decision). BARCODE_REQUIRED is reused by warranty create/update
  // for a missing SERIAL NUMBER — the code was kept stable so older clients
  // keep resolving it, only the wording changed.
  BARCODE_NOT_FOUND: { uz: "Bu shtrix-kod ombor tizimida topilmadi.", ru: 'Этот штрих-код не найден в системе склада.' },
  BARCODE_WRONG_PRODUCT: { uz: "Bu shtrix-kod boshqa mahsulotga tegishli.", ru: 'Этот штрих-код принадлежит другому продукту.' },
  BARCODE_WRONG_CATEGORY: { uz: "Bu shtrix-kod ushbu jihoz turi uchun mos emas.", ru: 'Этот штрих-код не подходит для данного типа оборудования.' },
  BARCODE_PRODUCT_INACTIVE: { uz: "Bu shtrix-kodga tegishli mahsulot endi faol emas.", ru: 'Продукт этого штрих-кода больше не активен.' },
  BARCODE_NOT_AVAILABLE: { uz: "Bu shtrix-kod hozir mavjud emas (allaqachon o'rnatilgan yoki boshqa holatda).", ru: 'Этот штрих-код сейчас недоступен (уже установлен или в другом статусе).' },
  BARCODE_CLAIM_FAILED: { uz: "Bu shtrix-kod hozirgina band qilindi — boshqa birini tanlang.", ru: 'Этот штрих-код только что был занят — выберите другой.' },
  BARCODE_REQUIRED: { uz: "Har bir jihoz uchun seriya raqami kiritilishi shart.", ru: 'Для каждого оборудования необходимо указать серийный номер.' },

  // Manual Verification workflow (see ezone-server/services/inventoryService.js's
  // validateBarcodeOrAcceptManual) — only reachable when the barcode
  // genuinely resolves to BARCODE_NOT_FOUND and the installer opts in; every
  // other barcode failure above continues to block submission unchanged.
  SELLER_INFO_REQUIRED: { uz: "Qo'lda tekshirish uchun sotuvchi ismi, telefon raqami va izoh kiritilishi shart.", ru: 'Для ручной проверки необходимо указать имя продавца, номер телефона и комментарий.' },
  MANUAL_VERIFICATION_UNRESOLVED: { uz: "Ushbu kafolatda qo'lda tekshirish kutilayotgan yoki rad etilgan jihoz bor — sinxronlashdan oldin uni hal qiling.", ru: 'В этой гарантии есть оборудование, ожидающее или отклонённое ручной проверкой — сначала разрешите это, прежде чем повторять синхронизацию.' },

  // Installer points (Phase 3 — see ezone-server/services/pointsService.js)
  REASON_REQUIRED: { uz: "Qo'lda ball tuzatishi uchun sabab kiritilishi shart.", ru: 'Для ручной корректировки баллов необходимо указать причину.' },

  // Manual inventory operations (Phase 4 — see ezone-server/services/inventoryService.js)
  ITEM_STATE_CHANGED: { uz: "Ushbu element holati o'zgardi — sahifani yangilab, qayta urinib ko'ring.", ru: 'Состояние этого товара изменилось — обновите страницу и попробуйте снова.' },
  ITEM_INSTALLED: { uz: "O'rnatilgan elementning shtrix-kodini tuzatib bo'lmaydi — avval uni bo'shating.", ru: 'Нельзя исправить штрих-код установленного товара — сначала освободите его.' },
  BARCODE_ALREADY_EXISTS: { uz: 'Bu shtrix-kod boshqa elementda allaqachon ishlatilmoqda.', ru: 'Этот штрих-код уже используется другим товаром.' },
  MERGE_PRODUCT_MISMATCH: { uz: "Turli mahsulotlarga tegishli elementlarni birlashtirib bo'lmaydi.", ru: 'Нельзя объединить товары, относящиеся к разным продуктам.' },

  // Catalog sync (see ezone-server/middleware/catalogReadOnlyGuard.js and
  // controllers/catalogSyncController.js's runCatalogSync)
  CATALOG_READ_ONLY: { uz: 'Katalog EasyGas sinxronizatsiyasi orqali boshqariladi.', ru: 'Каталог управляется через синхронизацию EasyGas.' },
  SYNC_ALREADY_RUNNING: { uz: 'Sinxronlash allaqachon ishlamoqda.', ru: 'Синхронизация уже выполняется.' },
};

// Fallback when the backend responds without an errorCode at all (e.g. a
// route this project doesn't own yet, or an envelope shape not yet updated).
const HTTP_STATUS_FALLBACK = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
};

export function getErrorMessage(errorCode, statusCode, language) {
  const lang = language === 'ru' ? 'ru' : 'uz';
  const key = ERROR_CODE_MESSAGES[errorCode] ? errorCode : HTTP_STATUS_FALLBACK[statusCode];
  const entry = ERROR_CODE_MESSAGES[key] || ERROR_CODE_MESSAGES.UNKNOWN_ERROR;
  return entry[lang];
}
