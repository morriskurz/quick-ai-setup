import { Wordmark } from '../ds';

const REPO = 'https://github.com/morriskurz/quick-ai-setup';

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-gutter py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="m-0 text-nav text-ink-body">Code under the MIT licence. Content © creativecodecampus, all rights reserved.</p>
        </div>
        <a className="ccc-navlink" href={REPO} target="_blank" rel="noopener noreferrer">
          Source on GitHub<span className="ccc-visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
