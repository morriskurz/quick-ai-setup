import { useMemo, type CSSProperties } from 'react';
import { agents, sectionCopy } from './content';
import { buildAgentPrompt, buildAgentsMd, buildVerifyScript, resolvePlan } from './lib/generate';
import { NavBar } from './components/ds';
import { MobileSheet } from './components/output/MobileSheet';
import { OutputPanel } from './components/output/OutputPanel';
import { AgentsMdSection } from './components/sections/AgentsMdSection';
import { ChooseSection } from './components/sections/ChooseSection';
import { ConsultingSection } from './components/sections/ConsultingSection';
import { ExtrasSection } from './components/sections/ExtrasSection';
import { Footer } from './components/sections/Footer';
import { GoalsSection } from './components/sections/GoalsSection';
import { Hero } from './components/sections/Hero';
import { SecuritySection } from './components/sections/SecuritySection';
import { SetupSection } from './components/sections/SetupSection';
import { VerifySection } from './components/sections/VerifySection';
import { OS_LABEL } from './components/ui/os';
import { useSelection } from './hooks/useSelection';

const NAV_LINKS = [
  { label: 'Setup', href: '#your-setup' },
  { label: 'Security', href: '#security' },
  { label: 'Verify', href: '#verify' },
];

export default function App() {
  const { selection, toggleAgent, toggleGoal, toggleExtra, setOs } = useSelection();

  const plan = useMemo(() => resolvePlan(selection), [selection]);
  const prompt = useMemo(() => buildAgentPrompt(selection), [selection]);
  const agentsMd = useMemo(() => buildAgentsMd(selection), [selection]);
  const verifyScript = useMemo(() => buildVerifyScript(selection), [selection]);

  const agentLabels = agents.filter((a) => selection.agents.includes(a.id)).map((a) => a.label);
  const meta = [
    `${plan.steps.length} ${plan.steps.length === 1 ? 'step' : 'steps'}`,
    agentLabels.length > 0 ? agentLabels.join(', ') : 'No agent',
    OS_LABEL[selection.os],
  ];

  return (
    <div id="top" className="relative pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <a
        href="#choose"
        className="ccc-btn ccc-btn--primary fixed top-3 left-3 z-50 -translate-y-[200%] focus:translate-y-0"
      >
        Skip to the setup
      </a>
      <NavBar
        className="ccc-enter absolute inset-x-0 top-0 z-30 mx-auto max-w-page"
        style={{ '--enter-delay': '0.1s' } as CSSProperties}
        links={NAV_LINKS}
        cta={{ label: sectionCopy.setup.copyPromptCta, href: '#prompt' }}
      />
      <main>
        <Hero />
        <div className="mx-auto max-w-page px-gutter">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-24">
            <div className="flex min-w-0 flex-col gap-28 pt-8 pb-8 lg:gap-32">
              <ChooseSection selection={selection} onToggleAgent={toggleAgent} onSetOs={setOs} />
              <GoalsSection selection={selection} onToggle={toggleGoal} />
              <ExtrasSection selection={selection} onToggle={toggleExtra} />
              <SecuritySection plan={plan} selection={selection} />
              <SetupSection
                selection={selection}
                plan={plan}
                prompt={prompt}
                verifyScript={verifyScript}
                onSetOs={setOs}
              />
              <AgentsMdSection files={agentsMd} selection={selection} />
              <VerifySection selection={selection} script={verifyScript} onSetOs={setOs} />
            </div>
            <aside aria-label="Live output" className="hidden pt-8 pb-8 lg:block">
              <div className="sticky top-6">
                <OutputPanel prompt={prompt} meta={meta} />
              </div>
            </aside>
          </div>
        </div>
        <ConsultingSection />
      </main>
      <Footer />
      <MobileSheet prompt={prompt} stepCount={plan.steps.length} />
    </div>
  );
}
