import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodySm' | 'caption' | 'label';

interface AppTextProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: CSSProperties['textAlign'];
  /** Clamp to this many lines with an ellipsis. */
  lines?: number;
  as?: ElementType;
  children?: ReactNode;
}

const defaultTag: Record<Variant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  title: 'p',
  body: 'p',
  bodySm: 'p',
  caption: 'span',
  label: 'span',
};

const weights = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** Typography primitive: one class per variant (see styles.css), with color/weight/alignment overrides. */
export function AppText({ variant = 'body', color, weight, align, lines, as, style, className, ...rest }: AppTextProps) {
  const Tag = as ?? defaultTag[variant];
  const isHeading = ['display', 'h1', 'h2', 'h3', 'title'].includes(variant);
  return (
    <Tag
      {...rest}
      className={['t', `t-${variant}`, lines ? 'clamp' : '', className].filter(Boolean).join(' ')}
      style={{
        ...(color ? { color } : null),
        ...(weight && !isHeading ? { fontWeight: weights[weight] } : null),
        ...(align ? { textAlign: align } : null),
        ...(lines ? { WebkitLineClamp: lines } : null),
        ...style,
      }}
    />
  );
}
