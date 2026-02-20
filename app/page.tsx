import Link from 'next/link'
import HomeMapSection from '@/components/home-map-section'

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 page-enter"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(42, 26, 10, 0.9) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 20% 80%, rgba(30, 20, 40, 0.4) 0%, transparent 60%),
          #111008
        `,
      }}>

      {/* Hero */}
      <div className="text-center mb-14 max-w-2xl">
        <p className="text-xs tracking-[0.45em] uppercase mb-4" style={{ color: '#6a5a3a' }}>
          Setting de D&amp;D 5e · Fantasía Épica Steampunk
        </p>

        <h1
          className="font-serif font-bold mb-5"
          style={{
            fontSize: 'clamp(4rem, 12vw, 7.5rem)',
            color: '#c9a84c',
            letterSpacing: '0.08em',
            lineHeight: 1,
            textShadow: '0 0 60px rgba(201, 168, 76, 0.18), 0 2px 4px rgba(0,0,0,0.8)',
          }}>
          AETHORN
        </h1>

        {/* Decorative rule */}
        <div className="flex items-center gap-3 justify-center mb-5">
          <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, transparent, #4a3820)' }} />
          <span style={{ color: '#c9a84c', fontSize: '0.5rem', letterSpacing: '0.6em', opacity: 0.6 }}>◆ · ◆</span>
          <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, #4a3820, transparent)' }} />
        </div>

        <p className="text-base leading-relaxed font-serif" style={{ color: '#a09070', fontStyle: 'italic' }}>
          Un mundo donde el estruendo de los engranajes de vapor ahoga el susurro de las corrientes arcanas,
          y dos civilizaciones luchan por el alma de la creación.
        </p>
      </div>

      {/* Faction cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mb-12">

        {/* Forjas Vornidas */}
        <Link
          href="/wiki/facciones/alianza-de-las-forjas-vornidas"
          className="group block rounded-lg border p-6 card-lift relative overflow-hidden"
          style={{ background: '#181408', borderColor: '#3a2a10' }}>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.08) 0%, transparent 70%)',
            }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 transition-colors duration-200"
                style={{ background: '#2a1e08', color: '#c9a84c', border: '1px solid #4a3210' }}>
                ⚙
              </div>
              <h2
                className="text-base font-semibold font-serif leading-snug transition-colors duration-200 group-hover:text-yellow-300"
                style={{ color: '#c9a84c' }}>
                La Alianza de las Forjas Vornidas
              </h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#7a6a4a' }}>
              Engranajes, vapor y progreso industrial forjado en hierro aethérico.
              Cuatro reinos unidos bajo la promesa del avance tecnológico.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors duration-200" style={{ color: '#5a4a28' }}>
              <span>Explorar</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(201, 168, 76, 0.15)' }} />
        </Link>

        {/* Confluencia de Vael */}
        <Link
          href="/wiki/facciones/confluencia-de-vael"
          className="group block rounded-lg border p-6 card-lift relative overflow-hidden"
          style={{ background: '#0d1018', borderColor: '#1a2535' }}>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(80, 130, 180, 0.08) 0%, transparent 70%)',
            }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 transition-colors duration-200"
                style={{ background: '#0e1828', color: '#5a9ab8', border: '1px solid #1e3045' }}>
                ✦
              </div>
              <h2
                className="text-base font-semibold font-serif leading-snug transition-colors duration-200 group-hover:text-blue-300"
                style={{ color: '#5a9ab8' }}>
                La Confluencia del Vael
              </h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#4a6070' }}>
              Corrientes arcanas tejidas desde el alba del mundo.
              Cuatro reinos unidos por el flujo eterno del Vael primordial.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors duration-200" style={{ color: '#2a4050' }}>
              <span>Explorar</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(90, 154, 184, 0.15)' }} />
        </Link>
      </div>

      {/* Map of Aethorn */}
      <HomeMapSection />

      {/* Section navigation */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {[
          { href: '/wiki/facciones', label: 'Facciones' },
          { href: '/wiki/razas', label: 'Razas' },
          { href: '/wiki/historia-de-aethorn', label: 'Historia' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="nav-section-btn px-5 py-2 rounded border text-sm font-medium">
            {label}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #3a2a10)' }} />
          <span className="font-serif text-xs" style={{ color: '#3a3020', letterSpacing: '0.15em' }}>AETHORN</span>
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #3a2a10, transparent)' }} />
        </div>
        <p className="text-xs" style={{ color: '#3a3020' }}>D&amp;D 5e · Wiki de Worldbuilding</p>
      </footer>
    </main>
  )
}
