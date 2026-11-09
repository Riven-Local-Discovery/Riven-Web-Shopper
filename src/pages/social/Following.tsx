import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useFollows, useToggleFollow } from '@/api/hooks';
import { Button } from '@/components/Button';
import { VendorRow } from '@/components/cards';
import { Header, Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { showAlert } from '@/utils/alert';

export default function FollowingPage() {
  const navigate = useNavigate();
  const follows = useFollows();
  const toggle = useToggleFollow();
  const items = follows.data ?? [];

  const unfollow = (vendorId: string, name: string) =>
    showAlert('Unfollow', `Stop following ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unfollow',
        style: 'destructive',
        onPress: () => toggle.mutate({ vendorId, follow: false }, { onError: (e) => showAlert('Unfollow', getErrorMessage(e)) }),
      },
    ]);

  return (
    <Screen header={<Header title="Following" />}>
      {follows.isLoading ? (
        <LoadingState />
      ) : follows.isError ? (
        <ErrorState error={follows.error} onRetry={follows.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="You're not following anyone"
          message="Follow makers to hear about new drops and upcoming bazaars."
          actionLabel="Discover bazaars"
          onAction={() => navigate('/bazaars')}
        />
      ) : (
        <div className="stack grid-2" style={{ paddingTop: 8 }}>
          {items.map((f) => (
            <VendorRow
              key={f.id}
              vendor={f.vendor}
              right={<Button title="Following" size="sm" variant="outline" fullWidth={false} onPress={() => unfollow(f.vendor.id, f.vendor.name)} />}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}
