import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '@/api/client';
import { useMe, useUpdateProfile } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EditableAvatar } from '@/components/EditableAvatar';
import { Header, Screen, useGoBack } from '@/components/Screen';
import { LoadingState } from '@/components/States';
import { TextField } from '@/components/TextField';
import { Chip } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';

const SUGGESTED_INTERESTS = ['Art', 'Fashion', 'Handmade', 'Home Decor', 'Food', 'Jewelry', 'Pottery', 'Vintage', 'Wellness'];

export default function EditProfilePage() {
  const goBack = useGoBack('/profile');
  const { data: me } = useMe();
  const update = useUpdateProfile();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [nameError, setNameError] = useState('');
  const initialized = useRef(false);

  // Fill the form once; later `me` updates (e.g. a new photo) must not overwrite unsaved edits.
  useEffect(() => {
    if (!me || initialized.current) return;
    initialized.current = true;
    setFullName(me.fullName);
    setPhone(me.phone ?? '');
    setInterests(me.interests);
  }, [me]);

  if (!me) {
    return (
      <Screen width="narrow" header={<Header title="Edit Profile" />}>
        <LoadingState />
      </Screen>
    );
  }

  const toggle = (i: string) => setInterests((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));
  const addCustom = () => {
    const value = newInterest.trim();
    if (value && !interests.includes(value)) setInterests((l) => [...l, value]);
    setNewInterest('');
  };

  const save = () => {
    if (fullName.trim().length < 2) return setNameError('Please enter your full name');
    setNameError('');
    update.mutate(
      { fullName: fullName.trim(), phone: phone.trim() || undefined, interests },
      {
        onSuccess: goBack,
        onError: (e) => showAlert('Could not save', getErrorMessage(e)),
      },
    );
  };

  const options = [...new Set([...SUGGESTED_INTERESTS, ...interests])];

  return (
    <Screen width="narrow" header={<Header title="Edit Profile" />} footer={<Button title="Save Changes" onPress={save} loading={update.isPending} />}>
      <div className="center-block" style={{ padding: '20px 0' }}>
        <EditableAvatar user={me} size={96} />
        <AppText variant="caption">Click to change photo</AppText>
      </div>

      <TextField label="Full Name" icon="person-outline" value={fullName} onChangeText={setFullName} error={nameError} autoComplete="name" />
      <TextField label="Email" icon="mail-outline" value={me.email} disabled hint="Email can't be changed." />
      <TextField label="Phone" icon="call-outline" value={phone} onChangeText={setPhone} type="tel" placeholder="+20 10 1234 5678" autoComplete="tel" />

      <AppText variant="label" as="p" color={colors.textMuted} style={{ marginBottom: 8 }}>
        Interests
      </AppText>
      <div className="wrap-row" style={{ marginBottom: 16 }}>
        {options.map((i) => (
          <Chip key={i} label={i} active={interests.includes(i)} onPress={() => toggle(i)} />
        ))}
      </div>
      <form
        className="row"
        style={{ gap: 8, alignItems: 'flex-start' }}
        onSubmit={(e) => {
          e.preventDefault();
          addCustom();
        }}
      >
        <div style={{ flex: 1 }}>
          <TextField placeholder="Add interest" aria-label="Add interest" icon="add" value={newInterest} onChangeText={setNewInterest} />
        </div>
        <Button title="Add" type="submit" size="sm" variant="dark" fullWidth={false} disabled={!newInterest.trim()} style={{ marginTop: 8 }} />
      </form>
    </Screen>
  );
}
