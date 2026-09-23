// Minimal shell. The UI agent builds the real page.
// PENDING: render the DS NavBar / Wordmark / GradientHeadline here once the
// creativecodecampus design system has been pulled and ported to src/components/ds/.
export default function App() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold">quick-ai-setup</h1>
      <p className="mt-4">
        From no AI setup to a working AI coding setup, in one sitting.
      </p>
    </main>
  )
}
