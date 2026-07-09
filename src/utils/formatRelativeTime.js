const UNITS = {
  uz: { justNow: 'hozirgina', minute: 'daqiqa oldin', hour: 'soat oldin', day: 'kun oldin' },
  ru: { justNow: 'только что', minute: 'мин. назад', hour: 'ч. назад', day: 'дн. назад' },
};

/** Formats a timestamp as "3 soat oldin" / "3 ч. назад" style relative time. */
export function formatRelativeTime(dateInput, language = 'uz') {
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const u = UNITS[language] || UNITS.uz;

  if (diffMin < 1) return u.justNow;
  if (diffMin < 60) return `${diffMin} ${u.minute}`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ${u.hour}`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ${u.day}`;
}
