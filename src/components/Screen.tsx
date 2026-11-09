import { useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Riven` : 'Riven';
  }, [title]);
}

/** Back if this tab has in-app history, otherwise the given fallback (home by default). */
export function useGoBack(fallback = '/') {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}

interface ScreenProps {
  children: ReactNode;
  header?: ReactNode;
  /** Sticky action bar at the bottom of the page. */
  footer?: ReactNode;
  /** narrow: forms and flows · default: lists · wide: grids and feeds. */
  width?: 'narrow' | 'default' | 'wide';
  className?: string;
}

/** Page container: centered column with an optional page header and a sticky footer. */
export function Screen({ children, header, footer, width = 'default', className }: ScreenProps) {
  return (
    <div className={`page page-${width}${className ? ` ${className}` : ''}`}>
      {header}
      <div className="page-body">{children}</div>
      {footer ? (
        <div className="page-footer">
          <div className="page-footer-inner">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

interface HeaderProps {
  title?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
}

export function Header({ title, back = true, onBack, right, transparent }: HeaderProps) {
  const goBack = useGoBack();
  useDocumentTitle(title);
  return (
    <div className={`page-header${transparent ? ' page-header-transparent' : ''}`}>
      <div className="page-header-side">
        {back ? (
          <IconButton name="chevron-back" label="Go back" onPress={onBack ?? goBack} variant={transparent ? 'glass' : 'plain'} />
        ) : null}
      </div>
      <AppText variant="h3" lines={1} className="page-header-title" color={transparent ? colors.textOnDark : undefined}>
        {title}
      </AppText>
      <div className="page-header-side page-header-right">{right}</div>
    </div>
  );
}

interface IconButtonProps {
  name: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'plain' | 'glass' | 'surface';
  color?: string;
  size?: number;
  badge?: number;
}

export function IconButton({ name, label, onPress, variant = 'plain', color, size = 22, badge }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onPress} className={`icon-btn icon-btn-${variant}`}>
      <Icon name={name} size={size} color={color ?? (variant === 'glass' ? colors.textOnDark : colors.text)} />
      {badge ? <span className="count-badge">{badge > 99 ? '99+' : badge}</span> : null}
    </button>
  );
}
