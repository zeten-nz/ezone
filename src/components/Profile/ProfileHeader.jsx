import AuthenticatedPhoto from '../UI/AuthenticatedPhoto';
import StatusBadge from '../UI/StatusBadge';
import { initialsOf } from '../../utils/initials';
import { authAPI } from '../../services/api';

/** Top banner — avatar/photo, name, username, role, branch, account-status badge. */
const ProfileHeader = ({ profile, photoVersion, t }) => (
  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
      {profile.has_photo ? (
        <AuthenticatedPhoto
          fetcher={() => authAPI.getProfilePhotoBlob()}
          cacheKey={photoVersion}
          className="w-20 h-20 rounded-full flex-shrink-0 ring-4 ring-white shadow-sm"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-semibold flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-sm">
          {initialsOf(profile.full_name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-neutral-900 truncate">{profile.full_name}</h1>
          <StatusBadge status={profile.is_active ? 'ACTIVE' : 'DISABLED'} size="sm" />
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          @{profile.username} &middot; {profile.role === 'ADMIN' ? t('admin') : t('employee')}
          {profile.branch_code && <> &middot; {profile.branch_code}</>}
        </p>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
