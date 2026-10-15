import { Route, Routes } from 'react-router'
import RequireAuth from '@/components/auth/RequireAuth'
import AppShell from '@/components/layout/AppShell'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import CoachDashboard from '@/pages/coach/Dashboard'
import AlumnosPage from '@/pages/coach/Alumnos'
import AlumnoDetailPage from '@/pages/coach/AlumnoDetail'
import ServiciosPage from '@/pages/coach/Servicios'
import RutinasPage from '@/pages/coach/Rutinas'
import NutricionPage from '@/pages/coach/Nutricion'
import CheckinsPage from '@/pages/coach/Checkins'
import CoachMensajesPage from '@/pages/coach/Mensajes'
import SuscripcionesPage from '@/pages/coach/Suscripciones'
import AlumnoDashboard from '@/pages/alumno/Dashboard'
import AlumnoPlanPage from '@/pages/alumno/Plan'
import AlumnoEntrenamientoPage from '@/pages/alumno/Entrenamiento'
import AlumnoComidasPage from '@/pages/alumno/Comidas'
import AlumnoAguaPage from '@/pages/alumno/Agua'
import AlumnoMensajesPage from '@/pages/alumno/Mensajes'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/coach"
        element={
          <RequireAuth role="coach">
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<CoachDashboard />} />
        <Route path="alumnos" element={<AlumnosPage />} />
        <Route path="alumnos/:id" element={<AlumnoDetailPage />} />
        <Route path="servicios" element={<ServiciosPage />} />
        <Route path="rutinas" element={<RutinasPage />} />
        <Route path="nutricion" element={<NutricionPage />} />
        <Route path="checkins" element={<CheckinsPage />} />
        <Route path="mensajes" element={<CoachMensajesPage />} />
        <Route path="suscripciones" element={<SuscripcionesPage />} />
      </Route>

      <Route
        path="/alumno"
        element={
          <RequireAuth role="alumno">
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<AlumnoDashboard />} />
        <Route path="plan" element={<AlumnoPlanPage />} />
        <Route path="entrenamiento" element={<AlumnoEntrenamientoPage />} />
        <Route path="comidas" element={<AlumnoComidasPage />} />
        <Route path="agua" element={<AlumnoAguaPage />} />
        <Route path="mensajes" element={<AlumnoMensajesPage />} />
      </Route>
    </Routes>
  )
}
