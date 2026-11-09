import { useNavigate } from 'react-router-dom';
import { useMe } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EditableAvatar } from '@/components/EditableAvatar';
import { Screen, useDocumentTitle } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { Card, Chip, ListRow } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/utils/alert';

export default function ProfilePage() {
  const navigate = useNavigate();
  const me = useMe();
  const { logout } = useAuth();
  const user = me.data;
  useDocumentTitle('Profile');

  const confirmLogout = () =>
    showAlert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  if (!user) {
    return <Screen>{me.isLoading ? <LoadingState /> : <ErrorState error={me.error} onRetry={me.refetch} />}</Screen>;
  }

  return (
    <Screen>
      <div className="profile-header">
        <EditableAvatar user={user} size={76} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="h2">{user.fullName}</AppText>
          <AppText variant="bodySm">{user.email}</AppText>
          {user.location ? (
            <AppText variant="caption">
              {user.location.city}, {user.location.country}
            </AppText>
          ) : null}
        </div>
        <Button title="Edit Profile" size="sm" variant="outline" fullWidth={false} onPress={() => navigate('/account/edit')} />
      </div>

      <Card className="stats">
        <Stat label="Orders" value={user.stats.orders} onPress={() => navigate('/orders')} />
        <span className="stat-divider" />
        <Stat label="Favorites" value={user.stats.favorites} onPress={() => navigate('/social/favorites')} />
        <span className="stat-divider" />
        <Stat label="Following" value={user.stats.following} onPress={() => navigate('/social/following')} />
      </Card>

      <AppText variant="h3" style={{ margin: '24px 0 12px' }}>
        Interests
      </AppText>
      <div className="wrap-row">
        {user.interests.map((i) => (
          <Chip key={i} label={i} />
        ))}
        <Chip label="Add" icon="add" onPress={() => navigate('/account/edit')} />
      </div>

      <Card style={{ marginTop: 24, padding: '4px 16px' }}>
        <ListRow icon="receipt-outline" label="My Orders" onPress={() => navigate('/orders')} />
        <ListRow icon="heart-outline" label="Favorites" onPress={() => navigate('/social/favorites')} />
        <ListRow icon="people-outline" label="Following" onPress={() => navigate('/social/following')} />
        <ListRow icon="settings-outline" label="Settings" onPress={() => navigate('/account/settings')} last />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button type="button" className="link link-danger" style={{ padding: 16 }} onClick={confirmLogout}>
          Log out
        </button>
      </div>
    </Screen>
  );
}

function Stat({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <button type="button" className="stat" onClick={onPress}>
      <AppText variant="h2" as="span">
        {value}
      </AppText>
      <AppText variant="caption">{label}</AppText>
    </button>
  );
}
