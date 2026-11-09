import { useRef, useState } from 'react';
import { getErrorMessage } from '@/api/client';
import { useUpdateProfile, useUploadAvatar } from '@/api/hooks';
import type { User } from '@/api/types';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { Avatar, Sheet } from './ui';

const MAX_BYTES = 5 * 1024 * 1024;

/** Profile photo with a camera badge; clicking it lets the user upload, take or remove a photo. */
export function EditableAvatar({ user, size = 96 }: { user: User; size?: number }) {
  const upload = useUploadAvatar();
  const update = useUpdateProfile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const libraryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const busy = upload.isPending || update.isPending;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again
    if (!file) return;
    if (!file.type.startsWith('image/')) return showAlert('Not an image', 'Please choose a JPG, PNG or WebP image.');
    if (file.size > MAX_BYTES) return showAlert('Image too large', 'Please choose an image under 5 MB.');
    upload.mutate(file, { onError: (err) => showAlert('Could not update photo', getErrorMessage(err)) });
  };

  const pick = (input: HTMLInputElement | null) => {
    setSheetOpen(false);
    input?.click();
  };

  const remove = () => {
    setSheetOpen(false);
    showAlert('Remove photo', 'Remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          update.mutate({ avatarUrl: null }, { onError: (e) => showAlert('Could not remove photo', getErrorMessage(e)) }),
      },
    ]);
  };

  const badge = Math.max(28, size * 0.32);

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        disabled={busy}
        aria-label="Change profile photo"
        className="editable-avatar"
        style={{ width: size, height: size }}
      >
        <Avatar uri={user.avatarUrl} name={user.fullName} size={size} />
        {busy ? (
          <span className="avatar-busy">
            <span className="spinner spinner-sm spinner-light" />
          </span>
        ) : null}
        <span className="avatar-badge" style={{ width: badge, height: badge }}>
          <Icon name="camera" size={badge * 0.5} color={colors.textOnDark} />
        </span>
      </button>

      <input ref={libraryInput} type="file" accept="image/*" hidden onChange={onFile} />
      <input ref={cameraInput} type="file" accept="image/*" capture="user" hidden onChange={onFile} />

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Profile photo">
        <SheetOption icon="images-outline" label="Upload a photo" onPress={() => pick(libraryInput.current)} />
        <SheetOption icon="camera-outline" label="Take photo" onPress={() => pick(cameraInput.current)} />
        {user.avatarUrl ? <SheetOption icon="trash-outline" label="Remove photo" danger onPress={remove} /> : null}
        <SheetOption icon="close" label="Cancel" onPress={() => setSheetOpen(false)} />
      </Sheet>
    </>
  );
}

function SheetOption({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  const color = danger ? colors.danger : colors.text;
  return (
    <button type="button" onClick={onPress} className="sheet-option">
      <Icon name={icon} size={20} color={color} />
      <AppText variant="body" as="span" weight="semibold" color={color}>
        {label}
      </AppText>
    </button>
  );
}
