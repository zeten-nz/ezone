import { User, AtSign, Phone, MapPin, Building2, ShieldCheck, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../UI/Card';
import StatusBadge from '../UI/StatusBadge';

const InfoField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-neutral-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-medium text-neutral-900 mt-0.5 truncate">{value || '—'}</p>
    </div>
  </div>
);

const formatDate = (value, language, withTime = false) => {
  if (!value) return null;
  const locale = language === 'ru' ? 'ru-RU' : 'uz-UZ';
  const options = withTime
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(value).toLocaleDateString(locale, options);
};

// Accounts created before first_name/last_name existed (or created directly
// by an admin rather than through registration) have neither column
// populated — falling back to splitting full_name keeps the field non-empty
// without ever writing a guess back to the database.
const deriveNames = (profile) => {
  if (profile.first_name || profile.last_name) {
    return { first: profile.first_name, last: profile.last_name };
  }
  const parts = (profile.full_name || '').trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') };
};

/** Read-only account details — see ProfileHeader for the editable-looking summary strip. */
const PersonalInfoCard = ({ profile, t, language }) => {
  const { first, last } = deriveNames(profile);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-neutral-900">{t('personalInformation')}</h2>
        <p className="text-sm text-neutral-500 mt-1">{t('personalInformationDesc')}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoField icon={User} label={t('firstName')} value={first} />
          <InfoField icon={User} label={t('lastName')} value={last} />
          <InfoField icon={AtSign} label={t('username')} value={profile.username} />
          <InfoField icon={Phone} label={t('phone')} value={profile.phone} />
          <InfoField icon={MapPin} label={t('region')} value={profile.region} />
          <InfoField icon={MapPin} label={t('district')} value={profile.district} />
          <InfoField icon={Building2} label={t('branch')} value={profile.branch_name || profile.branch_code} />
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">{t('accountStatus')}</p>
              <div className="mt-1">
                <StatusBadge status={profile.is_active ? 'ACTIVE' : 'DISABLED'} size="sm" />
              </div>
            </div>
          </div>
          <InfoField icon={Calendar} label={t('registrationDate')} value={formatDate(profile.created_at, language)} />
          <InfoField
            icon={Clock}
            label={t('lastLogin')}
            value={profile.last_login_at ? formatDate(profile.last_login_at, language, true) : t('never')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
