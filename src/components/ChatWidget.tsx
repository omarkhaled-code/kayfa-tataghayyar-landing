'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const WELCOME: Msg = {
  role: 'assistant',
  content:
    'أهلاً 👋 أنا المساعد بتاع كتاب «كيف تتغيّر للأفضل». اسألني عن محتوى الكتاب، السعر، أو طريقة الوصول وأنا في خدمتك.',
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // تمرير لأسفل عند وصول رسالة جديدة
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // نرسل المحادثة بدون رسالة الترحيب الثابتة
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            data.reply ||
            'حصل خطأ بسيط، ممكن تعيد سؤالك؟',
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'مش قادر أوصل للسيرفر دلوقتي، جرّب تاني بعد شوية.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* نافذة الشات */}
      {open && (
        <div className="fixed bottom-24 left-4 z-50 flex h-[70vh] max-h-[520px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-navy/15 bg-white shadow-2xl md:bottom-24 md:left-6 animate-fade-up">
          {/* ترويسة */}
          <div className="flex items-center justify-between bg-navy px-4 py-3 text-ivory">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-navy-dark">
                💬
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">مساعد الكتاب</p>
                <p className="text-[11px] text-ivory/60">بيرد على أسئلتك</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="text-ivory/70 transition hover:text-ivory"
            >
              ✕
            </button>
          </div>

          {/* الرسائل */}
          <div
            ref={scrollRef}
            className="thin-scroll flex-1 space-y-3 overflow-y-auto bg-ivory px-3 py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  'flex ' +
                  (m.role === 'user' ? 'justify-start' : 'justify-end')
                }
              >
                <div
                  className={
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ' +
                    (m.role === 'user'
                      ? 'bg-navy text-ivory'
                      : 'border border-navy/10 bg-white text-ink')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="rounded-2xl border border-navy/10 bg-white px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-navy/40 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-navy/40 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-navy/40" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* الإدخال */}
          <div className="flex items-center gap-2 border-t border-navy/10 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="اكتب سؤالك…"
              className="flex-1 rounded-xl border border-navy/15 bg-ivory px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              onClick={send}
              disabled={loading}
              aria-label="إرسال"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-navy-dark transition hover:bg-gold-light disabled:opacity-60"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* زر الفقاعة */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="افتح الدردشة"
        className="fixed bottom-20 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-2xl text-ivory shadow-xl transition hover:bg-navy-light md:bottom-6 md:left-6"
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}
