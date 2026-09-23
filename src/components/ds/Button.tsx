import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface CommonProps {
  variant?: ButtonVariant;
  /** Tighter ghost box for inline actions such as per-block copy buttons. */
  small?: boolean;
  className?: string;
  children: ReactNode;
}

type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string };
type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

export type ButtonProps = LinkProps | NativeButtonProps;

/**
 * The brand's button set: one solid cyan call to action (primary), one hairline
 * (secondary), one cyan-hairline header button (ghost). Renders an <a> when
 * `href` is given, otherwise a <button type="button">. Hover/press styling lives
 * in components.css (.ccc-btn*), colour only — nothing moves.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', small = false, className = '', children } = props;
  const cls = `ccc-btn ccc-btn--${variant}${small ? ' ccc-btn--small' : ''}${className ? ` ${className}` : ''}`;

  if (props.href !== undefined) {
    const { variant: _v, small: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <a {...rest} className={cls}>
        {children}
      </a>
    );
  }
  const { variant: _v, small: _s, className: _c, children: _ch, href: _h, ...rest } = props;
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
