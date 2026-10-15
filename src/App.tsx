import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/components/app-shell'
import { RequireAuth } from '@/components/require-auth'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { CoachDashboard } from '@/pages/coach/Dashboard'
import { CoachAlumnos } from '@/pages/coach/Alumnos'
import { CoachAlumnoDetail } from '@/pages/coach/AlumnoDetail'
import { CoachServicios } from '@/pages/coach/Servicios'
import { CoachAdherencia } from '@/pages/coach/Adherencia'
import { Mensajes } from '@/pages/shared/Mensajes'
import { AlumnoDashboard } from '@/pages/alumno/Dashboard'
import { AlumnoEntreno } from '@/pages/alumno/Entreno'
import { AlumnoNutricion } from '@/pages/alumno/Nutricion'
import { AlumnoAgua } from '@/pages/alumno/Agua'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth roles={['coach', 'admin']} />}>
        <Route path="/coach" element={<AppShell />}>
          <Route index element={<CoachDashboard />} />
          <Route path="alumnos" element={<CoachAlumnos />} />
          <Route path="alumnos/:id" element={<CoachAlumnoDetail />} />
          <Route path="servicios" element={<CoachServicios />} />
          <Route path="adherencia" element={<CoachAdherencia />} />
          <Route path="mensajes" element={<Mensajes />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['alumno']} />}>
        <Route path="/alumno" element={<AppShell />}>
          <Route index element={<AlumnoDashboard />} />
          <Route path="entreno" element={<AlumnoEntreno />} />
          <Route path="nutricion" element={<AlumnoNutricion />} />
          <Route path="agua" element={<AlumnoAgua />} />
          <Route path="mensajes" element={<Mensajes />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
