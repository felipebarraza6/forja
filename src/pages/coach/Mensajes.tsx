import { useEffect, useMemo, useState } from 'react'
import { listMessages, listThreads, sendMessage, subscribeMessages } from '@/lib/api/forja'
import type { ChatMessage, ChatThread } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getRole } from '@/lib/api/client'
import { cn } from '@/lib/utils'

export default function CoachMensajesPage() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const role = getRole() ?? 'coach'

  useEffect(() => {
    void listThreads().then((t) => {
      setThreads(t)
      setActiveId(t[0]?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (activeId == null) return
    void listMessages(activeId).then(setMessages)
    return subscribeMessages(activeId, (msg) => {
      setMessages((prev) => [...prev, msg])
    })
  }, [activeId])

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  )

  const onSend = async () => {
    if (!text.trim() || activeId == null) return
    const msg = await sendMessage(activeId, role, text.trim())
    setMessages((prev) => [...prev, msg])
    setText('')
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-5xl flex-col gap-4 lg:h-[calc(100dvh-4rem)] lg:flex-row">
      <aside className="shrink-0 overflow-hidden rounded-xl border border-border bg-bg-raised/50 lg:w-72">
        <div className="border-b border-border px-4 py-3">
          <h1 className="font-display text-lg font-semibold">Mensajes</h1>
          <p className="text-xs text-text-muted">Tiempo real vía SSE cuando el backend lo exponga.</p>
        </div>
        <ScrollArea className="h-40 lg:h-[calc(100%-4rem)]">
          <ul>
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    'w-full border-b border-border px-4 py-3 text-left transition hover:bg-bg-sunken/70',
                    activeId === t.id && 'bg-bg-sunken',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{t.alumnoName}</p>
                    {t.unread > 0 && (
                      <span className="rounded-full bg-accent px-1.5 text-[10px] text-bg">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-muted">{t.lastMessage}</p>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-bg-raised/40">
        <div className="border-b border-border px-4 py-3">
          <p className="font-medium">{active?.alumnoName ?? 'Selecciona un chat'}</p>
        </div>
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  m.from === role
                    ? 'ml-auto bg-accent text-bg'
                    : 'bg-bg-sunken text-text',
                )}
              >
                <p>{m.text}</p>
                <p className={cn('mt-1 text-[10px]', m.from === role ? 'text-bg/70' : 'text-text-faint')}>
                  {new Date(m.at).toLocaleString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short',
                  })}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 border-t border-border p-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onSend()
            }}
          />
          <Button type="button" onClick={() => void onSend()}>
            Enviar
          </Button>
        </div>
      </section>
    </div>
  )
}
