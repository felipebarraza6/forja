import { useQuery } from '@tanstack/react-query'
import { getMyStudent } from '@/lib/api/forja'
import { isDemoMode } from '@/lib/api/client'

/** Resuelve el alumno actual (API: /students/me/; demo: stu-1). */
export function useMyStudent() {
  return useQuery({
    queryKey: ['my-student', isDemoMode() ? 'demo' : 'live'],
    queryFn: async () => {
      const s = await getMyStudent()
      if (!s) throw new Error('No se encontró el perfil de alumno')
      return s
    },
  })
}
