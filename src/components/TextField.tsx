import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  icon?: IconName;
  error?: string;
  hint?: string;
  secure?: boolean;
  multiline?: boolean;
  onChangeText?: (text: string) => void;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, error, hint, secure, multiline, onChangeText, disabled, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  const iconColor = error ? colors.danger : focused ? colors.secondary : colors.textSubtle;

  const shared = {
    ...rest,
    id: inputId,
    disabled,
    'aria-invalid': !!error || undefined,
    'aria-describedby': error || hint ? helpId : undefined,
    onFocus: (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      setFocused(true);
      rest.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      setFocused(false);
      rest.onBlur?.(e);
    },
  };

  return (
    <div className="field-wrap">
      {label ? (
        <label htmlFor={inputId} className="field-label" style={focused ? { color: colors.secondary } : undefined}>
          {label}
        </label>
      ) : null}
      <div
        className={[
          'field',
          multiline ? 'field-multiline' : '',
          focused ? 'field-focused' : '',
          error ? 'field-error' : '',
          disabled ? 'field-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {icon ? <Icon name={icon} size={18} color={iconColor} /> : null}
        {multiline ? (
          <textarea {...shared} onChange={(e) => onChangeText?.(e.target.value)} />
        ) : (
          <input
            {...shared}
            ref={ref}
            type={secure ? (hidden ? 'password' : 'text') : (rest.type ?? 'text')}
            onChange={(e) => onChangeText?.(e.target.value)}
          />
        )}
        {secure ? (
          <button
            type="button"
            className="icon-plain"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? 'Show password' : 'Hide password'}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={iconColor} />
          </button>
        ) : null}
      </div>
      {error ? (
        <AppText variant="caption" id={helpId} color={colors.danger} className="field-help" as="p">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" id={helpId} className="field-help" as="p">
          {hint}
        </AppText>
      ) : null}
    </div>
  );
});
