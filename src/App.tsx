import { useMemo, type CSSProperties } from 'react';
import { contentFor } from './content/i18n';
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
import { StartSection } from './components/sections/StartSection';
import { VerifySection } from './components/sections/VerifySection';
import { LangToggle } from './components/ui/LangToggle';
import { OS_LABEL } from './components/ui/os';
import { LangContext } from './hooks/langContext';
import { useLang } from './hooks/useLang';
import { useSelection } from './hooks/useSelection';

export default function App() {
  const { selection, toggleAgent, toggleGoal, toggleExtra, setOs } = useSelection();
  const { lang, setLang } = useLang();
  const plan = useMemo(() => resolvePlan(selection, lang), [selection, lang]);
  const prompt = useMemo(() => buildAgentPrompt(selection, lang), [selection, lang]);
  const agentsMd = useMemo(() => buildAgentsMd(selection, lang), [selection, lang]);
  const verifyScript = useMemo(() => buildVerifyScript(selection), [selection]);
  const { agents, sectionCopy, ui } = contentFor(lang);

  const agentLabels = agents.filter((a) => selection.agents.includes(a.id)).map((a) => a.label);
  const meta = [
    ui.steps(plan.steps.length),
    agentLabels.length > 0 ? agentLabels.join(', ') : ui.noAgent,
    OS_LABEL[selection.os],
  ];
  const navLinks = [
    { label: ui.nav.setup, href: '#your-setup' },
    { label: ui.nav.security, href: '#security' },
    { label: ui.nav.verify, href: '#verify' },
  ];

  return (
    <LangContext value={lang}>
    <div id="top" className="relative pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <a
        href="#choose"
        className="ccc-btn ccc-btn--primary fixed top-3 left-3 z-50 -translate-y-[200%] focus:translate-y-0"
      >
        {ui.skipLink}
      </a>
      <NavBar
        className="ccc-enter absolute inset-x-0 top-0 z-30 mx-auto max-w-page"
        style={{ '--enter-delay': '0.1s' } as CSSProperties}
        label={ui.nav.label}
        links={navLinks}
        cta={{ label: sectionCopy.setup.copyPromptCta, href: '#prompt' }}
        end={<LangToggle lang={lang} onChange={setLang} label={ui.lang.group} />}
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
              <StartSection selection={selection} />
            </div>
            <aside aria-label={ui.output.aside} className="hidden pt-8 pb-8 lg:block">
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
    </LangContext>
  );
}
