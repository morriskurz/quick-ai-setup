import { useContent } from '../../hooks/langContext';
import { Wordmark } from '../ds';

const REPO = 'https://github.com/morriskurz/quick-ai-setup';

export function Footer() {
  const { ui } = useContent();
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-gutter py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="m-0 text-nav text-ink-body">{ui.footer.licence}</p>
        </div>
        <a className="ccc-navlink" href={REPO} target="_blank" rel="noopener noreferrer">
          {ui.footer.source}<span className="ccc-visually-hidden">{ui.newTab}</span>
        </a>
      </div>
    </footer>
  );
}
