function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-gray-900">
      <h1 className="text-display font-bold">O-lion</h1>
      <p className="text-body1 text-gray-500">React + Vite + TypeScript + Tailwind + PWA</p>
      <a
        href="/test"
        className="rounded-lg bg-primary-500 px-4 py-3 text-button text-gray-0"
      >
        Design System Test
      </a>
    </main>
  )
}

export default HomePage
