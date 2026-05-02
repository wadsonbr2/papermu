import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Send, Loader2, Bot, User } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: 'Olá! Sou sua IA Especialista em Mu Online. Estou aqui para ajudar você a configurar seu servidor, editar itens, ajustar drops (EventItemBag), gerenciar o banco de dados SQL, e resolver problemas de compilação. Como posso ajudar com seu MuServer hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const aiProvider = localStorage.getItem('MUSERVER_AI_PROVIDER') || 'gemini';
      let responseText = '';
      const systemInstruction = "Você é um Especialista Master em desenvolvimento Muserver (Mu Online). Você sabe tudo sobre versões 97d, Season 2, Season 6, Season 15+, arquivos Louis Emulator, IGCN, MuEmu e TitanTech. Ajude o administrador a editar arquivos (commonserver.cfg, Message.wtf, Item.txt), montar queries SQL, configurar drops, spots, shops, rates de chaos machine e resolver problemas complexos (crash de GS, disconnect). Use tom profissional e direto, retornando scripts de código, dicas práticas e tabelas quando necessário.";

      if (aiProvider === 'local') {
        const localUrl = localStorage.getItem('MUSERVER_LOCAL_AI_URL') || 'http://localhost:1234/v1';
        const localModel = localStorage.getItem('MUSERVER_LOCAL_AI_MODEL') || 'local-model';
        
        const oaiHistory = [
          { role: 'system', content: systemInstruction },
          ...messages.map(m => ({
             role: m.role === 'model' ? 'assistant' : 'user',
             content: m.text
          })),
          { role: 'user', content: userText }
        ];

        const res = await fetch(`${localUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: localModel,
            messages: oaiHistory,
            temperature: 0.7,
          })
        });

        if (!res.ok) {
           throw new Error(`Erro na API Local (${res.status}): Verifique se o LM Studio/Ollama está rodando e CORS está ativado.`);
        }
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || '';
      } else {
        const apiKey = localStorage.getItem('MUSERVER_GEMINI_API_KEY');
        if (!apiKey) {
          throw new Error("A chave GEMINI_API_KEY não foi configurada. Acesse Configurações do Painel para adicioná-la.");
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
              ...history,
              { role: 'user', parts: [{ text: userText }] }
          ],
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        responseText = response.text || '';
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText || 'Ocorreu um erro ao gerar a resposta.' }]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Desculpe, ocorreu um erro ao conectar com o serviço. Verifique sua chave API nas Configurações.';
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111317] border border-[#1e2126] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#1e2126] bg-[#050506] flex items-center gap-3">
        <div className="text-orange-400">
          ✧
        </div>
        <div>
          <h2 className="font-bold text-white uppercase tracking-tight">MU-AI CO-PILOT</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Suporte técnico & Scripts</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded flex items-center justify-center ${msg.role === 'user' ? 'bg-orange-500 text-black font-bold' : 'bg-[#1e2126] text-orange-400'}`}>
              {msg.role === 'user' ? <User size={16} /> : "✧"}
            </div>
            
            <div className={`p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-[#1e2126] text-white border border-[#2a2d33]' 
                : 'bg-[#050506] text-slate-300 border border-[#1e2126]'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body text-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#0d0d14] prose-pre:border prose-pre:border-white/10">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
             <div className="shrink-0 w-8 h-8 rounded bg-[#1e2126] text-orange-400 flex items-center justify-center">
              ✧
            </div>
            <div className="p-3 rounded-lg bg-[#050506] border border-[#1e2126] flex items-center text-orange-500 text-xs italic">
              Analisando... <Loader2 className="w-3 h-3 ml-2 animate-spin text-orange-500" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#050506] border-t border-[#1e2126]">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pergunte à IA do Servidor..."
            className="w-full bg-[#1e2126] text-slate-200 border border-[#2a2d33] rounded-lg pl-3 pr-10 py-3 text-sm focus:outline-none focus:border-orange-500 transition-all disabled:opacity-50 font-sans"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 text-orange-500 hover:text-orange-400 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
