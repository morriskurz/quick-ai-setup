import morrisPhoto from '../assets/morris.jpg';

// COPY: owner review — consulting section. Swap values here; no component code
// needs to change. Do not add claims beyond these strings.
export const CONSULTING = {
  eyebrow: 'AI-readiness consulting',
  lead: 'Setup is step one.',
  gradient: 'Habits make it stick.',
  body: 'The first call is free and includes an AI-readiness check — for how you work yourself and for your whole company. After that, I help founders and teams go further: advanced habits, a knowledge system, and a setup the whole team uses.',
  /** Empty string renders an empty hairline frame instead of the photo. */
  photoSrc: morrisPhoto as string,
  photoAlt: 'Morris Kurz at his desk',
  /** Intrinsic size of the photo file: reserves space, no layout shift. */
  photoWidth: 1080,
  photoHeight: 1080,
  name: 'Morris Kurz',
  role: 'Founder · Munich',
  bio: 'I co-founded hey circle and, as CTO for four years, built and ran its software, finance and sales teams. Before that I built explainable machine-learning models for a Swiss private bank. Today I measure what AI actually changes in software development.',
  cta: 'Book a free AI-readiness check',
  /** External links open in a new tab; in-page anchors do not. */
  bookingUrl: 'https://calendar.app.google/PWuAfbTPyD2exyD6A',
  secondaryLink: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/morris-kurz/' },
  meta: ['Co-founder & CTO, hey circle', 'MSc Mathematics, KIT', 'EO Accelerator Munich'],
};
