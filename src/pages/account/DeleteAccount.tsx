import { useState } from 'react';
import { getErrorMessage } from '@/api/client';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Header, Screen, useGoBack } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';

export default function DeleteAccountPage() {
  const goBack = useGoBack('/account/settings');
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const submit = () => {
    if (!password) return setError('Please enter your password');
    showAlert('Delete account permanently?', 'Your profile, orders history, favorites and reviews will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          setError('');
          try {
            await deleteAccount(password);
          } catch (e) {
            setError(getErrorMessage(e));
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen
      width="narrow"
      header={<Header title="Delete Account" />}
      footer={
        <div className="footer-actions">
          <Button title="Delete Account" variant="danger" onPress={submit} loading={deleting} />
          <Button title="Cancel" variant="outline" onPress={goBack} />
        </div>
      }
    >
      <div className="center-block">
        <span className="result-icon">
          <Icon name="trash-outline" size={34} color={colors.secondary} />
        </span>
        <AppText variant="h2" align="center">
          Delete Account
        </AppText>
        <AppText variant="bodySm" align="center">
          This action is permanent. Please enter your password to confirm.
        </AppText>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextField
          label="Password"
          icon="lock-closed-outline"
          secure
          value={password}
          onChangeText={setPassword}
          error={error}
          autoComplete="current-password"
        />
      </form>
    </Screen>
  );
}
