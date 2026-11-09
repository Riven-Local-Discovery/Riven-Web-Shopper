import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import logoMark from '@/assets/img/riven-logo-mark.png';
import { colors } from '@/theme';
import { initials } from '@/utils/format';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function Card({
  children,
  style,
  className,
  onPress,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onPress?: () => void;
}) {
  const cls = ['card', onPress ? 'pressable' : '', className].filter(Boolean).join(' ');
  if (onPress) {
    return (
      <button type="button" className={cls} style={style} onClick={onPress}>
        {children}
      </button>
    );
  }
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

export function Avatar({ uri, name, size = 44, ring }: { uri?: string; name?: string; size?: number; ring?: boolean }) {
  return (
    <span className={`avatar${ring ? ' avatar-ring' : ''}`} style={{ width: size, height: size }}>
      {uri ? (
        <img src={uri} alt={name ?? ''} />
      ) : (
        <span className="avatar-initials" style={{ fontSize: size * 0.36 }}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}

const toneColors = {
  success: [colors.successSoft, colors.success],
  info: [colors.infoSoft, colors.info],
  warning: [colors.warningSoft, colors.warning],
  danger: [colors.dangerSoft, colors.danger],
  neutral: [colors.surfaceAlt, colors.primary],
  accent: [colors.secondarySoft, colors.secondary],
} as const;

export type BadgeTone = keyof typeof toneColors;

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const [bg, fg] = toneColors[tone];
  return (
    <span className="badge" style={{ backgroundColor: bg, color: fg }}>
      {label}
    </span>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <button type="button" onClick={onPress} aria-pressed={!!active} className={`chip${active ? ' chip-active' : ''}`}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {label}
    </button>
  );
}

export function ChipRow<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: CSSProperties;
}) {
  return (
    <div className="chip-row" style={style}>
      {options.map((o) => (
        <Chip key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`tab${active ? ' tab-active' : ''}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <span className="row" style={{ gap: onChange ? 6 : 1 }} aria-label={onChange ? undefined : `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name: IconName = value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline';
        const star = <Icon name={name} size={size} color={colors.star} />;
        return onChange ? (
          <button
            key={i}
            type="button"
            className="icon-plain"
            onClick={() => onChange(i)}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            aria-pressed={value === i}
          >
            {star}
          </button>
        ) : (
          <span key={i} className="row">
            {star}
          </span>
        );
      })}
    </span>
  );
}

export function RatingInline({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="row" style={{ gap: 4 }}>
      <Icon name="star" size={13} color={colors.star} />
      <AppText variant="caption" weight="bold" color={colors.text}>
        {rating.toFixed(1)}
      </AppText>
      {count !== undefined ? <AppText variant="caption">({count} reviews)</AppText> : null}
    </span>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <span className="stepper">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Icon name="remove" size={16} />
      </button>
      <AppText variant="label" className="stepper-value" aria-live="polite">
        {value}
      </AppText>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Icon name="add" size={16} />
      </button>
    </span>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-header">
      <AppText variant="h3">{title}</AppText>
      {action ? (
        <button type="button" className="link" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function ListRow({
  icon,
  label,
  value,
  onPress,
  danger,
  last,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <button type="button" onClick={onPress} className={`list-row${last ? '' : ' list-row-border'}`}>
      <span className="list-icon" style={danger ? { backgroundColor: colors.dangerSoft } : undefined}>
        <Icon name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </span>
      <AppText variant="body" weight="semibold" style={{ flex: 1 }} color={danger ? colors.danger : colors.text}>
        {label}
      </AppText>
      {value ? <AppText variant="bodySm">{value}</AppText> : null}
      <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
    </button>
  );
}

export function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="summary-row">
      <AppText variant={strong ? 'title' : 'bodySm'}>{label}</AppText>
      <AppText variant={strong ? 'h3' : 'label'} as="span" color={strong ? colors.text : colors.textMuted}>
        {value}
      </AppText>
    </div>
  );
}

export function Divider({ style }: { style?: CSSProperties }) {
  return <hr className="divider" style={style} />;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmit,
  onPress,
  right,
  autoFocus,
}: {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onPress?: () => void;
  right?: ReactNode;
  autoFocus?: boolean;
}) {
  if (onPress) {
    return (
      <button type="button" className="search" onClick={onPress}>
        <Icon name="search" size={18} color={colors.textSubtle} />
        <AppText variant="bodySm" color={colors.textSubtle} style={{ flex: 1, textAlign: 'left' }}>
          {placeholder}
        </AppText>
        {right}
      </button>
    );
  }
  return (
    <form
      role="search"
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Icon name="search" size={18} color={colors.textSubtle} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      {right}
    </form>
  );
}

export function Logo({ light, size = 'md' }: { light?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 16, md: 20, lg: 30 }[size];
  const color = light ? colors.textOnDark : colors.primary;
  return (
    <span className="row" style={{ gap: s * 0.5 }} aria-label="Riven" role="img">
      {/* The mark is tinted with a CSS mask so it can follow the text color. */}
      <span
        aria-hidden
        className="logo-mark"
        style={{ width: s * 2.1, height: s * 1.4, backgroundColor: color, WebkitMaskImage: `url(${logoMark})`, maskImage: `url(${logoMark})` }}
      />
      <span aria-hidden className="logo-word" style={{ fontSize: s * 0.8, letterSpacing: s * 0.45, color }}>
        IVEN
      </span>
    </span>
  );
}

/** Bottom sheet on phones, centered dialog on wider screens. Closes on backdrop click and Escape. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="overlay overlay-sheet" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {title ? (
          <AppText variant="h3" style={{ marginBottom: 12 }}>
            {title}
          </AppText>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
