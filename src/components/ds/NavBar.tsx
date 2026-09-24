import type { CSSProperties, ReactNode } from 'react';
import { Button } from './Button';
import { Wordmark } from './Wordmark';

export interface NavLink {
  label: string;
  href: string;
}

interface NavBarProps {
  /** Accessible name of the section links. */
  label?: string;
  links?: NavLink[];
  cta?: { label: string; href: string };
  /** Always visible at the far right, at every width (the language toggle). */
  end?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Transparent header that floats over the motif: wordmark left, dim links and a
 * ghost CTA right, then the `end` slot. Links hide below 768px and the CTA below
 * 1024px (the mobile bottom sheet carries the copy action there); `end` always shows.
 */
export function NavBar({ label = 'Page sections', links = [], cta, end, className = '', style }: NavBarProps) {
  return (
    <header
      className={`flex items-center justify-between gap-6 px-gutter py-[26px] ${className}`}
      style={style}
    >
      <Wordmark href="#top" />
      <div className="flex items-center gap-[28px]">
      <nav aria-label={label} className="flex items-center gap-[28px]">
        <ul className="m-0 hidden list-none items-center gap-[28px] p-0 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a className="ccc-navlink" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {cta && (
          <Button variant="ghost" href={cta.href} className="hidden lg:inline-flex">
            {cta.label}
          </Button>
        )}
      </nav>
      {end}
      </div>
    </header>
  );
}
