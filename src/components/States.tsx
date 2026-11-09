import { getErrorMessage } from '@/api/client';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-label={label ?? 'Loading'} />
      {label ? <AppText variant="bodySm">{label}</AppText> : null}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <span className="state-icon" style={{ backgroundColor: colors.dangerSoft }}>
        <Icon name="cloud-offline-outline" size={28} color={colors.danger} />
      </span>
      <AppText variant="h3" align="center">
        Something went wrong
      </AppText>
      <AppText variant="bodySm" align="center">
        {getErrorMessage(error)}
      </AppText>
      {onRetry ? <Button title="Try again" onPress={onRetry} size="sm" fullWidth={false} variant="dark" /> : null}
    </div>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="state">
      <span className="state-icon">
        <Icon name={icon} size={28} color={colors.secondary} />
      </span>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySm" align="center">
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} size="sm" fullWidth={false} /> : null}
    </div>
  );
}
