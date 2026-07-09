import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dayLabel = (isoDate, language) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'short' });
};

function TrendTooltip({ active, payload, language }) {
  if (!active || !payload?.length) return null;
  const { date, count } = payload[0].payload;
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-neutral-500">{dayLabel(date, language)}</p>
      <p className="text-sm font-semibold text-neutral-900 tabular-nums">{count} {language === 'ru' ? 'заявок' : 'ta'}</p>
    </div>
  );
}

/**
 * 14-day submissions trend — single series, sequential blue, area wash at
 * ~10% opacity per the mark spec. No legend (single series names itself via
 * the card title). Hairline horizontal gridlines only, recessive.
 */
const SubmissionsTrendChart = ({ data, language }) => {
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="0" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => dayLabel(d, language)}
            tick={{ fontSize: 12, fill: '#898781' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, Math.ceil(maxCount * 1.2) || 1]}
            tick={{ fontSize: 12, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={<TrendTooltip language={language} />}
            cursor={{ stroke: '#c3c2b7', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#trend-fill)"
            activeDot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubmissionsTrendChart;
