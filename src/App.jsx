import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import './index.css';

const MAX_TEAMS = 16;

const normalizeCedula = (value) => value.replace(/\D/g, '').slice(0, 8);
const formatCedula = (value) => `V-${normalizeCedula(value)}`;
const validCedula = (value) => /^\d{7,8}$/.test(normalizeCedula(value));

const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10);
const formatPhone = (value) => `+58 ${normalizePhone(value)}`;

function App() {
  const [registeredCount, setRegisteredCount] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [player1, setPlayer1] = useState({ firstName: '', lastName: '', cedula: '' });
  const [player2, setPlayer2] = useState({ firstName: '', lastName: '', cedula: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NUEVOS ESTADOS para controlar el flujo de pantallas y caché
  const [isSuccess, setIsSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registeredTeamName, setRegisteredTeamName] = useState('');

  useEffect(() => {
    fetchSpots();
    
    // COMPROBACIÓN DE CACHÉ: Ver si el usuario ya se registró antes
    const hasRegistered = localStorage.getItem('beerpong_registered');
    const savedTeam = localStorage.getItem('beerpong_team_name');
    
    if (hasRegistered === 'true') {
      setAlreadyRegistered(true);
      setRegisteredTeamName(savedTeam || 'Tu Equipo');
    }
  }, []);

  const fetchSpots = async () => {
    try {
      const { count, error } = await supabase
        .from('torneo_beerpong')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setRegisteredCount(count || 0);
    } catch (err) {
      console.error('Error obteniendo cupos:', err.message);
    }
  };

  const spotsAvailable = MAX_TEAMS - registeredCount;
  const isFull = spotsAvailable <= 0;

  const handleInput = (setter) => (field) => (event) => {
    const value = event.target.value;
    if (field === 'cedula') {
      setter((current) => ({ ...current, cedula: normalizeCedula(value) }));
    } else {
      setter((current) => ({ ...current, [field]: value }));
    }
  };

  const validate = () => {
    if (!teamName.trim()) return 'El nombre del equipo es obligatorio.';
    if (phone.length < 10) return 'El teléfono debe tener 10 dígitos (ej. 4141234567).';
    if (!player1.firstName.trim() || !player1.lastName.trim()) return 'Nombre y apellido del Jugador 1 son obligatorios.';
    if (!player2.firstName.trim() || !player2.lastName.trim()) return 'Nombre y apellido del Jugador 2 son obligatorios.';
    if (!validCedula(player1.cedula)) return 'La cédula del Jugador 1 debe tener entre 7 y 8 dígitos.';
    if (!validCedula(player2.cedula)) return 'La cédula del Jugador 2 debe tener entre 7 y 8 dígitos.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isFull) {
      setError('Ya no hay cupos disponibles.');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmed = window.confirm(
      '⚠️ ATENCIÓN:\n\nAl registrarse acepta que el pago es de 12$ a la tasa BCV del día del evento y que el pago se hará en el lugar del evento.\n\n¿Desea continuar con el registro?'
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const { count, error: countError } = await supabase
        .from('torneo_beerpong')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      if (count >= MAX_TEAMS) {
        setRegisteredCount(count);
        throw new Error(`¡Cupos agotados! Ya se registraron los ${MAX_TEAMS} equipos.`);
      }

      const equipoData = {
        team_name: teamName.trim(),
        telefono_responsable: formatPhone(phone),
        p1_first_name: player1.firstName.trim(),
        p1_last_name: player1.lastName.trim(),
        p1_cedula: formatCedula(player1.cedula),
        p2_first_name: player2.firstName.trim(),
        p2_last_name: player2.lastName.trim(),
        p2_cedula: formatCedula(player2.cedula)
      };

      const { error: insertError } = await supabase
        .from('torneo_beerpong')
        .insert(equipoData);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Ese nombre de equipo ya está registrado. ¡Elige otro!');
        }
        throw insertError;
      }

      // GUARDAR EN CACHÉ (LocalStorage) TRAS ÉXITO
      localStorage.setItem('beerpong_registered', 'true');
      localStorage.setItem('beerpong_team_name', teamName.trim());
      
      setRegisteredTeamName(teamName.trim());
      setIsSuccess(true); // Activa la pantalla de éxito

      // Limpieza de formulario
      setTeamName('');
      setPhone('');
      setPlayer1({ firstName: '', lastName: '', cedula: '' });
      setPlayer2({ firstName: '', lastName: '', cedula: '' });
      fetchSpots();

    } catch (submissionError) {
      setError(submissionError.message || 'Ocurrió un error al enviar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <div className="glass-card">
        
        <header className="header-section">
          <div className="logo-container">
            <img src="/logo_club.svg" alt="Club Logo" className="logo" />
            <span className="club-name">CLUB DE EMPRENDIMIENTO</span>
          </div>
          <h1 className="title">Beer Pong <span className="highlight">CDE</span></h1>
          
          <div className={`spots-badge ${isFull ? 'spots-full' : ''}`}>
            {isFull ? '❌ CUPOS AGOTADOS' : `🏆 ${spotsAvailable} CUPOS DISPONIBLES`}
          </div>
        </header>

        {/* REGLA 1: SI YA SE REGISTRÓ EN ESTE DISPOSITIVO ANTES */}
        {alreadyRegistered ? (
          <div className="status-screen already-registered-view">
            <div className="icon-wrapper alert-icon">ℹ️</div>
            <h2>Dispositivo Registrado</h2>
            <p className="status-message">
              Tu dispositivo indica que ya has inscrito al equipo <strong className="team-highlight">"{registeredTeamName}"</strong> en este torneo.
            </p>
            <p className="disclaimer-text">
              Cada dispositivo permite un único registro de equipo. ¡Prepárate para el evento!
            </p>
          </div>
        ) : 
        
        /* REGLA 2: PANTALLA DE ÉXITO TRAS EL REGISTRO ACTUAL */
        isSuccess ? (
          <div className="status-screen success-view">
            {/* Checkmark animado en SVG */}
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
            <h2>¡Registro Completado!</h2>
            <p className="status-message">
              ¡Tu equipo <strong className="team-highlight">"{registeredTeamName}"</strong> ha sido inscrito con éxito!
            </p>
            <div className="success-disclaimer-box">
              <p>
                <strong>Recordatorio Importante:</strong> El pago de la inscripción es de <strong>12$</strong> calculados a la tasa oficial del <strong>BCV</strong> del día del evento. El mismo se realizará de forma presencial en el lugar del torneo.
              </p>
            </div>
          </div>
        ) : 
        
        /* REGLA 3: PANTALLA DE TORNEO LLENO */
        isFull ? (
          <div className="status-screen full-view">
            <h2>¡Torneo Lleno!</h2>
            <p>Gracias por el interés. Hemos alcanzado el límite estricto de {MAX_TEAMS} equipos inscritos.</p>
          </div>
        ) : 
        
        /* REGLA 4: FORMULARIO POR DEFECTO */
        (
          <form onSubmit={handleSubmit} className="glass-form">
            <div className="players-grid">
              <div className="input-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>Nombre del Equipo</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ej. Low Cortisol Team"
                  required
                />
              </div>

              <div className="input-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label>Teléfono del Responsable (WhatsApp)</label>
                <div className="cedula-wrapper">
                  <span className="prefix">+58</span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    placeholder="4141234567"
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="players-grid">
              {/* Jugador 1 */}
              <div className="player-card">
                <h3>Jugador 1</h3>
                <div className="input-group">
                  <label>Nombre</label>
                  <input value={player1.firstName} onChange={handleInput(setPlayer1)('firstName')} placeholder="Nombre" required />
                </div>
                <div className="input-group">
                  <label>Apellido</label>
                  <input value={player1.lastName} onChange={handleInput(setPlayer1)('lastName')} placeholder="Apellido" required />
                </div>
                <div className="input-group">
                  <label>Cédula</label>
                  <div className="cedula-wrapper">
                    <span className="prefix">V-</span>
                    <input value={player1.cedula} onChange={handleInput(setPlayer1)('cedula')} placeholder="12345678" inputMode="numeric" maxLength={8} required />
                  </div>
                </div>
              </div>

              {/* Jugador 2 */}
              <div className="player-card">
                <h3>Jugador 2</h3>
                <div className="input-group">
                  <label>Nombre</label>
                  <input value={player2.firstName} onChange={handleInput(setPlayer2)('firstName')} placeholder="Nombre" required />
                </div>
                <div className="input-group">
                  <label>Apellido</label>
                  <input value={player2.lastName} onChange={handleInput(setPlayer2)('lastName')} placeholder="Apellido" required />
                </div>
                <div className="input-group">
                  <label>Cédula</label>
                  <div className="cedula-wrapper">
                    <span className="prefix">V-</span>
                    <input value={player2.cedula} onChange={handleInput(setPlayer2)('cedula')} placeholder="12345678" inputMode="numeric" maxLength={8} required />
                  </div>
                </div>
              </div>
            </div>

            <p className="disclaimer-text">
              <strong>Nota importante:</strong> El pago es de <strong>12$</strong> a la tasa BCV del día del evento y se realizará presencialmente en las instalaciones.
            </p>

            {error && <div className="alert error">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Equipo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;