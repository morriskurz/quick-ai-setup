import type { SetupPlan } from '../../content/types';
import { Section } from '../ui/Section';

// COPY: owner review — security copy. Claims about agent permission modes are
// kept generic on purpose [needs verification per agent before launch].
const BLOCKS = [
  {
    title: 'What the prompt does',
    body: 'It asks your agent to install the tools listed under Your setup, add the skills you ticked, and write two rule files, AGENTS.md and CLAUDE.md. It does not create accounts. When a step needs a sign-up or a login, the agent stops and asks you to do it.',
  },
  {
    title: 'Read before you run',
    body: 'Every command is written out below, with a line on why it is there and a link to the official docs. If your computer asks for your password or an administrator prompt appears, the command is installing software for the whole machine. That is expected here — and a good moment to read the line first.',
  },
  {
    title: 'Keep the agent asking',
    body: 'Coding agents can run commands on their own. For this setup, keep yours in the mode where it asks before running anything, read each request, and only then approve it. Do not start it with a flag that skips permissions.',
  },
];

export function SecuritySection({ plan }: { plan: SetupPlan }) {
  const human = plan.steps.filter((s) => s.kind === 'human').length;
  const auto = plan.steps.length - human;
  return (
    <Section
      id="security"
      eyebrow="Before you copy"
      // COPY: owner review
      lead="Read what it does."
      gradient="Then run it."
      intro={
        <p className="m-0">
          Your setup has {plan.steps.length} {plan.steps.length === 1 ? 'step' : 'steps'}: {auto} the agent can run,{' '}
          {human} you do yourself.
        </p>
      }
    >
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {BLOCKS.map((b) => (
          <div key={b.title} className="border-t border-hairline pt-5">
            <h3 className="m-0 text-ui font-semibold text-ink">{b.title}</h3>
            <p className="mt-2 mb-0 text-nav leading-[1.65] text-ink-body">{b.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
