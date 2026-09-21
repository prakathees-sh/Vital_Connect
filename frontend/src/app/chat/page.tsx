'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Building,
  Radio,
  Clock,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';

export default function ChatPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const ta = language === 'ta';

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.listConversations()
      .then((res) => {
        setConversations(res || []);
        if (res && res.length > 0) {
          setActiveConversation(res[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConversation) return;

    api.getMessages(activeConversation.id).then((msgs) => {
      setMessages(msgs || []);
      scrollToBottom();
    }).catch(() => {});

    const wsUrl = `ws://127.0.0.1:8000/api/v1/chat/ws/${activeConversation.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const incoming = JSON.parse(event.data);
        setMessages((prev) => [...prev, incoming]);
        scrollToBottom();
      } catch (e) {
        console.error("WS Parse error", e);
      }
    };

    socketRef.current = ws;

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const text = inputText.trim();
    setInputText('');

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        conversation_id: activeConversation.id,
        sender_id: user?.id || null,
        sender_name: user?.full_name || 'Responder',
        sender_role: user?.role || 'DONOR',
        message_text: text,
      }));
    } else {
      try {
        const sent = await api.sendMessage(activeConversation.id, text);
        setMessages((prev) => [...prev, sent]);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-2 sm:px-0 space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>{ta ? 'அவசர கால ஒருங்கிணைப்பு அரட்டை' : 'Emergency Coordination Chat'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {ta
              ? 'நோயாளி, மருத்துவமனை மற்றும் தானியர்களுக்கு இடையேயான நேரலை பாதுகாப்பான தகவல் தொடர்பு'
              : 'Real-time, request-bound coordination between patients, hospitals, and voluntary donors'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{ta ? 'நேரலை இணைப்பு' : 'WebSocket Real-Time Link'}</span>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm h-[600px]">
        {/* Left: Threads List */}
        <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            {ta ? 'செயலில் உள்ள அவசர இழைகள்' : 'Active Emergency Threads'}
          </p>

          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              {ta ? 'செயலில் உள்ள இழைகள் எதுவும் இல்லை' : 'No active emergency threads'}
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConversation?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConversation(c)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all space-y-1 ${
                    isSelected
                      ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                      {c.request_code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {c.hospital_name}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {c.latest_message}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Right: Messages Stream */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/40">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                      {activeConversation.request_code}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeConversation.hospital_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {ta ? 'இரத்தத் தேவை: ' : 'Blood requirement: '} <b>{activeConversation.blood_group}</b> • {ta ? 'பாதுகாக்கப்பட்ட தடம்' : 'Encrypted channel'}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {ta ? 'நிகழ்நேர தடம்' : 'Real-Time Channel'}
                </span>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => {
                  const isSystem = m.is_system;
                  const isMine = m.sender_id === user?.id;

                  if (isSystem) {
                    return (
                      <div key={m.id || idx} className="my-2 flex justify-center">
                        <div className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-medium text-center max-w-md">
                          ℹ️ {m.message_text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                        {m.sender_name} ({m.sender_role})
                      </span>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                        }`}
                      >
                        {m.message_text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={ta ? 'அவசர கால குழுவிற்கு செய்தியை உள்ளிடவும்...' : 'Type message to emergency coordination team...'}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              {ta ? 'ஒருங்கிணைப்பைத் தொடங்க அவசர இழையைத் தேர்ந்தெடுக்கவும்' : 'Select an emergency thread to begin coordination'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
