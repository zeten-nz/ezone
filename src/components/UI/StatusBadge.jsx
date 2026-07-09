import Badge from './Badge';
import { useLanguage } from '../../context/LanguageContext';
import { STATUS_BADGE } from '../../config/statusBadge';

/** `status` is one of the STATUS_BADGE keys — ACTIVE/DISABLED/PENDING/APPROVED/REJECTED. */
const StatusBadge = ({ status, size }) => {
  const { t } = useLanguage();
  const config = STATUS_BADGE[status] || STATUS_BADGE.ACTIVE;
  return <Badge variant={config.variant} size={size}>{t(config.labelKey)}</Badge>;
};

export default StatusBadge;
