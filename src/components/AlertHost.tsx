import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '@/theme';
import { alertStore, type AlertButton, type AlertRequest } from '@/utils/alert';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

const tones = {
  brand: { fg: colors.secondary, bg: colors.secondarySoft },
  success: { fg: colors.success, bg: colors.successSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
} as const;

/** Renders the queued `showAlert` dialogs. Mount once near the app root. */
export function AlertHost() {
  const alert = useSyncExternalStore(alertStore.subscribe, alertStore.current, alertStore.current);
  if (!alert) return null;
  return createPortal(<Dialog key={alert.id} alert={alert} />, document.body);
}

function press(alert: AlertRequest, button?: AlertButton) {
  alertStore.dismiss(alert.id);
  button?.onPress?.();
}

// Escape / backdrop click behaves like the cancel button when there is one.
function cancel(alert: AlertRequest) {
  const cancelButton = alert.buttons.find((b) => b.style === 'cancel');
  if (cancelButton || alert.buttons.length === 1) press(alert, cancelButton ?? alert.buttons[0]);
}

function Dialog({ alert }: { alert: AlertRequest }) {
  const destructive = alert.buttons.some((b) => b.style === 'destructive');
  const tone = tones[alert.tone ?? (destructive ? 'danger' : 'brand')];
  const icon = alert.icon ?? (destructive ? 'alert-circle-outline' : undefined);
  // Stacked, with actions on top and the cancel button last.
  const ordered = [...alert.buttons].sort((a, b) => Number(a.style === 'cancel') - Number(b.style === 'cancel'));
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cardRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancel(alert);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [alert]);

  return (
    <div className="overlay overlay-center" onClick={() => cancel(alert)}>
      <div
        ref={cardRef}
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`alert-${alert.id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        {icon ? (
          <span className="dialog-icon" style={{ backgroundColor: tone.bg }}>
            <Icon name={icon} size={28} color={tone.fg} />
          </span>
        ) : null}
        <AppText variant="h3" align="center" id={`alert-${alert.id}-title`}>
          {alert.title}
        </AppText>
        {alert.message ? (
          <AppText variant="bodySm" align="center" style={{ marginBottom: 8, whiteSpace: 'pre-line' }}>
            {alert.message}
          </AppText>
        ) : null}
        <div className="dialog-buttons">
          {ordered.map((b) => (
            <Button
              key={b.text}
              title={b.text}
              onPress={() => press(alert, b)}
              variant={b.style === 'cancel' ? 'outline' : b.style === 'destructive' ? 'danger' : 'primary'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
