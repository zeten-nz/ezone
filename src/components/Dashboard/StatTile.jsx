import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '../UI/Card';
import { formatCompactNumber } from '../../utils/formatCompactNumber';

/**
 * Stat-tile contract: label + value (+ optional delta vs a named period,
 * + optional sparkline). Delta color follows direction (up is good for
 * submission counts). The sparkline stays in a muted gray — only the
 * current-period point is drawn in the accent color.
 */
const StatTile = ({ label, value, icon: Icon, delta, deltaLabel, sparkline, index = 0 }) => {
  const isCompact = typeof value === 'number';
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta) && delta !== 0;
  const isUp = delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-500">{label}</p>
              <p className="text-3xl font-semibold text-neutral-900 mt-2 truncate">
                {isCompact ? formatCompactNumber(value) : value}
              </p>
              {hasDelta && (
                <p className={`flex items-center gap-1 text-sm mt-2 font-medium ${isUp ? 'text-green-700' : 'text-red-700'}`}>
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(delta)}% {deltaLabel}
                </p>
              )}
              {!hasDelta && deltaLabel && (
                <p className="text-sm text-neutral-500 mt-2">{deltaLabel}</p>
              )}
            </div>
            {Icon && (
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>

          {sparkline && sparkline.length > 1 && (
            <div className="h-8 mt-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id={`sparkline-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#9ca3af"
                    strokeWidth={1.5}
                    fill={`url(#sparkline-${label})`}
                    isAnimationActive={false}
                    dot={(props) => {
                      const isLast = props.index === sparkline.length - 1;
                      if (!isLast) return null;
                      return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill="#2563eb" stroke="#ffffff" strokeWidth={1.5} />;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatTile;
