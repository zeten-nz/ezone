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
  TOO_MANY_REQUESTS: { uz: "So'rovlar soni juda ko'p. Birozdan so'ng qayta urinib ko'ring.", ru: 'Слишком много запросов. Повторите попытку позже.' },
  TIMEOUT: { uz: "So'rov vaqti tugadi. Qaytadan urinib ko'ring.", ru: 'Время ожидания истекло. Попробуйте снова.' },
  NETWORK_ERROR: { uz: 'Internet aloqasini tekshiring.', ru: 'Проверьте подключение к интернету.' },
  UNKNOWN_ERROR: { uz: "Nimadir xato ketdi. Qaytadan urinib ko'ring.", ru: 'Что-то пошло не так. Попробуйте снова.' },
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
