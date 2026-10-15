import { StrictMode, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import { ThemeProvider } from '@/components/theme-provider'
import { useSession } from '@/lib/session'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function Bootstrap({ children }: { children: ReactNode }) {
  const hydrate = useSession((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/forja">
          <Bootstrap>
            <App />
            <Toaster richColors position="top-center" />
          </Bootstrap>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
