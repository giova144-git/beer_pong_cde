import { useState } from 'react'
import { supabase } from './lib/supabase'
import logoClub from './assets/logo_club.svg'
import logoCodea from './assets/codea.png'

const CARRERAS = [
  'Ciencias Administrativas',
  'Comunicación Social y Empresarial',
  'Contaduría Pública',
  'Derecho',
  'Economía Empresarial',
  'Educación',
  'Estudios Internacionales',
  'Estudios Liberales',
  'Idiomas Modernos',
  'Ingeniería Civil',
  'Ingeniería de Producción',
  'Ingeniería de Sistemas',
  'Ingeniería Eléctrica',
  'Ingeniería Mecánica',
  'Ingeniería Química',
  'Matemáticas Industriales',
  'Psicología',
  'TSU en Sistemas Inteligentes',
  'Turismo Sostenible',
]

export default function App() {
  const [form, setForm] = useState({ nombre: '', apellido: '', carrera: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isComplete = form.nombre.trim() && form.apellido.trim() && form.carrera

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isComplete) return
    setStatus('loading')
    setErrorMsg('')
    const { error } = await supabase.from('usuarios').insert({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      carrera: form.carrera,
    })
    if (error) {
      setErrorMsg('No se pudo registrar. Intenta de nuevo.')
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-14">

      {/* ── Fondo oscuro base — siempre visible detrás de todo ── */}
      <div className="fixed inset-0" style={{ background: '#0e1a0f', zIndex: -2 }} />

      {/* ── Orbes de color Codea ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        {/* orbe grande superior-izquierda */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-20%', left: '-20%',
            width: '70vmax', height: '70vmax',
            background: 'radial-gradient(circle, rgba(61,94,58,0.55) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* orbe grande inferior-derecha */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-20%', right: '-20%',
            width: '65vmax', height: '65vmax',
            background: 'radial-gradient(circle, rgba(78,120,72,0.45) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        {/* acento central sutil */}
        <div
          className="absolute rounded-full"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50vmax', height: '50vmax',
            background: 'radial-gradient(circle, rgba(46,74,44,0.28) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── Card principal ── */}
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="rounded-3xl px-6 py-8 sm:px-8 sm:py-10"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.13)',
            boxShadow:
              '0 32px 64px rgba(0,0,0,0.60), 0 8px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          {/* Logos */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <img
              src={logoClub}
              alt="Club de Emprendimiento UNIMET"
              className="h-12 w-12 object-contain drop-shadow-lg"
              style={{ filter: 'invert(1) brightness(0.85)' }}
            />
            <span className="text-white/30 text-xl font-light select-none">×</span>
            <img src={logoCodea} alt="Codea" className="h-12 object-contain drop-shadow-lg brightness-110" />
          </div>

          {/* Título */}
          <div className="text-center mb-7">
            <h1 className="text-white text-xl font-bold tracking-tight leading-snug">
              Meet &amp; Greet
              <span className="block text-white/50 text-base font-normal mt-0.5">Codea × UNIMET</span>
            </h1>
            <div className="mt-3 h-px w-14 mx-auto rounded-full" style={{ background: 'rgba(78,120,72,0.6)' }} />
            <p className="mt-2.5 text-white/40 text-xs">Registra tu asistencia al evento</p>
          </div>

          {status === 'success' ? (
            <SuccessState nombre={form.nombre} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <GlassField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                disabled={status === 'loading'}
              />
              <GlassField
                label="Apellido"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
                disabled={status === 'loading'}
              />

              {/* Carrera */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Carrera</label>
                <select
                  name="carrera"
                  value={form.carrera}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: form.carrera ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.30)',
                  }}
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all
                    focus:border-[rgba(255,255,255,0.35)] focus:ring-2 focus:ring-[rgba(255,255,255,0.08)]
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="" disabled style={{ background: '#1a2e1b', color: 'rgba(255,255,255,0.4)' }}>
                    Selecciona tu carrera…
                  </option>
                  {CARRERAS.map(c => (
                    <option key={c} value={c} style={{ background: '#1a2e1b', color: '#fff' }}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {status === 'error' && (
                <p className="text-red-300 text-xs text-center rounded-xl px-4 py-2.5 border border-red-400/20"
                  style={{ background: 'rgba(239,68,68,0.10)' }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={!isComplete || status === 'loading'}
                className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 mt-1 active:scale-[0.98]"
                style={{
                  background: isComplete && status !== 'loading'
                    ? 'linear-gradient(135deg, #4e7848 0%, #3d5e3a 100%)'
                    : 'rgba(255,255,255,0.08)',
                  color: isComplete && status !== 'loading' ? '#fff' : 'rgba(255,255,255,0.25)',
                  boxShadow: isComplete && status !== 'loading'
                    ? '0 4px 20px rgba(61,94,58,0.50)'
                    : 'none',
                  cursor: !isComplete || status === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Registrando…
                  </span>
                ) : (
                  'Registrar Asistencia'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          Club de Emprendimiento · Universidad Metropolitana
        </p>
      </div>
    </div>
  )
}

function GlassField({ label, name, value, onChange, placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.90)',
        }}
        className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all
          placeholder:text-white/20
          focus:border-[rgba(255,255,255,0.35)] focus:ring-2 focus:ring-[rgba(255,255,255,0.08)]
          disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  )
}

function SuccessState({ nombre }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(78,120,72,0.20)',
          border: '1px solid rgba(78,120,72,0.40)',
          boxShadow: '0 0 24px rgba(78,120,72,0.25)',
        }}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="rgba(120,180,112,1)" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <p className="text-white font-semibold text-lg">¡Bienvenido/a, {nombre}!</p>
        <p className="text-white/50 text-sm mt-1">Asistencia registrada exitosamente.</p>
        <p className="text-white/30 text-xs mt-3">Disfruta el evento 🎉</p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
