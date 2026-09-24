import type { Lang } from '../../content/types';

const OPTIONS: { lang: Lang; short: string; name: string }[] = [
  { lang: 'en', short: 'EN', name: 'English' },
  { lang: 'de', short: 'DE', name: 'Deutsch' },
];

interface LangToggleProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
  /** Group name, in the current language. */
  label: string;
}

/**
 * "EN · DE" in nav type: the active language at full ink, the other dimmed. Two real
 * buttons with aria-pressed; each names its language in that language.
 */
export function LangToggle({ lang, onChange, label }: LangToggleProps) {
  return (
    <div role="group" aria-label={label} className="ccc-lang">
      {OPTIONS.map((o, i) => (
        <span key={o.lang} className="contents">
          {i > 0 && (
            <span aria-hidden="true" className="ccc-lang__dot">
              ·
            </span>
          )}
          <button
            type="button"
            lang={o.lang}
            aria-label={o.name}
            aria-pressed={lang === o.lang}
            className="ccc-lang__btn"
            onClick={() => onChange(o.lang)}
          >
            {o.short}
          </button>
        </span>
      ))}
    </div>
  );
}
