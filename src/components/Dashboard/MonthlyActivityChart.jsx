import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTH_LABELS_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const MONTH_LABELS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const monthLabel = (month, language) => (language === 'ru' ? MONTH_LABELS_RU : MONTH_LABELS_UZ)[month - 1];

function ActivityTooltip({ active, payload, language, t }) {
  if (!active || !payload?.length) return null;
  const { month, warranty_count } = payload[0].payload;
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-neutral-500">{monthLabel(month, language)}</p>
      <p className="text-sm font-semibold text-neutral-900 tabular-nums">{warranty_count} {t('submissionsUnit')}</p>
    </div>
  );
}

/**
 * 12-month warranty-count trend — single series, same sequential blue and
 * ~10% opacity area wash as SubmissionsTrendChart (this dashboard's existing
 * trend-chart pattern). Ranks by count, not points — reward_points is a
 * future-only field with nothing real to sum yet (see reportsController.js).
 * No legend needed for one series (the card title names it); hairline
 * horizontal gridlines only.
 */
const MonthlyActivityChart = ({ data, language, t }) => {
  const maxCount = Math.max(1, ...data.map((d) => d.warranty_count));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="activity-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="0" />
          <XAxis
            dataKey="month"
            tickFormatter={(m) => monthLabel(m, language)}
            tick={{ fontSize: 12, fill: '#898781' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, Math.ceil(maxCount * 1.2) || 1]}
            tick={{ fontSize: 12, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            content={<ActivityTooltip language={language} t={t} />}
            cursor={{ stroke: '#c3c2b7', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="warranty_count"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#activity-trend-fill)"
            activeDot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyActivityChart;
