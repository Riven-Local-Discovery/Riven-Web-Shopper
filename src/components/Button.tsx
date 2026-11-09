import type { CSSProperties } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  style?: CSSProperties;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth = true,
  type = 'button',
  style,
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <button
      type={type}
      onClick={onPress}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={`btn btn-${variant} btn-${size}${fullWidth ? ' btn-block' : ''}`}
      style={style}
    >
      {loading ? (
        <span className="spinner spinner-sm" aria-label="Loading" />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'sm' ? 15 : 18} /> : null}
          <span>{title}</span>
        </>
      )}
    </button>
  );
}
