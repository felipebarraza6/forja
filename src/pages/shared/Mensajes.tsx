import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import {
  listMessages,
  listThreads,
  sendMessage,
  subscribeThreadEvents,
} from '@/lib/api/forja'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageSkeleton } from '@/components/ui/skeleton'
import { useSession } from '@/lib/session'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function Mensajes() {
  const session = useSession((s) => s.session)!
  const sender = session.role === 'alumno' ? 'alumno' : 'coach'
  const qc = useQueryClient()
  const threads = useQuery({ queryKey: ['threads'], queryFn: listThreads })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [body, setBody] = useState('')

  const selected = useMemo(() => {
    const list = threads.data ?? []
    if (session.role === 'alumno') {
      return list[0] ?? null
    }
    return list.find((t) => t.id === activeId) ?? list[0] ?? null
  }, [threads.data, activeId, session.role])

  const messages = useQuery({
    queryKey: ['messages', selected?.id],
    queryFn: () => listMessages(selected!.id),
    enabled: !!selected,
  })

  useEffect(() => {
    if (!selected) return
    return subscribeThreadEvents(selected.id, () => {
      void qc.invalidateQueries({ queryKey: ['messages', selected.id] })
    })
  }, [selected, qc])

  const send = useMutation({
    mutationFn: () => sendMessage(selected!.id, body.trim(), sender),
    onSuccess: async () => {
      setBody('')
      await qc.invalidateQueries({ queryKey: ['messages', selected!.id] })
      await qc.invalidateQueries({ queryKey: ['threads'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (threads.isLoading) return <PageSkeleton rows={3} />

  if ((threads.data ?? []).length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Comunicación</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Mensajes</h1>
          <p className="mt-2 text-text-muted">
            Chat coach–alumno con eventos SSE cuando el backend esté disponible.
          </p>
        </div>
        <EmptyState
          icon={MessageSquare}
          title="Sin conversaciones"
          description="Cuando haya hilos activos entre coach y alumno aparecerán aquí."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Comunicación</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Chat coach–alumno con eventos SSE cuando el backend esté disponible.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {session.role !== 'alumno' && (
          <ul className="surface divide-y divide-border overflow-hidden">
            {(threads.data ?? []).map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    'flex w-full flex-col items-start gap-1 px-3 py-3 text-left transition-colors duration-200 hover:bg-bg-sunken/70',
                    selected?.id === t.id && 'bg-bg-sunken',
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="font-medium">{t.student_name}</span>
                    {t.unread > 0 && <Badge>{t.unread}</Badge>}
                  </span>
                  <span className="line-clamp-1 text-xs text-text-faint">{t.last_message}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="surface flex min-h-[420px] flex-col">
          <div className="border-b border-border px-4 py-3">
            <p className="font-medium">
              {session.role === 'alumno' ? 'Tu coach' : selected?.student_name ?? '—'}
            </p>
            <p className="text-xs text-text-faint">
              Actualizado {selected ? formatDate(selected.updated_at) : '—'}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(messages.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-text-faint">
                Escribe el primer mensaje de este hilo.
              </p>
            ) : (
              (messages.data ?? []).map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm transition-opacity duration-200',
                    m.sender === sender
                      ? 'ml-auto bg-accent/15 text-text'
                      : 'bg-bg-sunken text-text-muted',
                  )}
                >
                  <p>{m.body}</p>
                  <p className="mt-1 text-[10px] text-text-faint">
                    {new Date(m.created_at).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              if (!body.trim() || !selected) return
              send.mutate()
            }}
          >
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe un mensaje…"
              className="min-h-[44px] flex-1 resize-none"
              rows={2}
            />
            <Button
              type="submit"
              disabled={!body.trim() || send.isPending}
              className="sm:self-end"
            >
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
