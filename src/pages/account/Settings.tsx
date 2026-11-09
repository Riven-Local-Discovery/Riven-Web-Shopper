import { useNavigate } from 'react-router-dom';
import { useMe } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Header, Screen } from '@/components/Screen';
import { Avatar, Card, ListRow } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/utils/alert';
import { firstName, greeting } from '@/utils/format';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { logout } = useAuth();

  return (
    <Screen width="narrow" header={<Header title="Account" />}>
      <div className="center-block" style={{ paddingTop: 8, gap: 4 }}>
        <Avatar uri={me?.avatarUrl} name={me?.fullName} size={84} />
        <AppText variant="h2">
          {greeting()}, {firstName(me?.fullName)}
        </AppText>
        <AppText variant="bodySm">{me?.email}</AppText>
      </div>

      <Card className="list-card">
        <ListRow icon="person-outline" label="My Profile" onPress={() => navigate('/account/edit')} />
        <ListRow icon="receipt-outline" label="My Orders" onPress={() => navigate('/orders')} />
        <ListRow icon="heart-outline" label="Favorites" onPress={() => navigate('/social/favorites')} />
        <ListRow icon="people-outline" label="Following" onPress={() => navigate('/social/following')} last />
      </Card>

      <Card className="list-card">
        <ListRow icon="location-outline" label="Location" value={me?.location?.city} onPress={() => navigate('/account/location')} />
        <ListRow
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => (window.location.href = 'mailto:support@riven.app?subject=Riven%20support')}
        />
        <ListRow
          icon="log-out-outline"
          label="Log out"
          onPress={() =>
            showAlert('Log out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: logout },
            ])
          }
          last
        />
      </Card>

      <Card className="list-card">
        <ListRow icon="trash-outline" label="Delete Account" danger onPress={() => navigate('/account/delete')} last />
      </Card>
    </Screen>
  );
}
