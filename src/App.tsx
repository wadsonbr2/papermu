/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Download, Settings, Webhook, Box, Shield, 
  TerminalSquare, Gamepad2, BrainCircuit, Activity,
  Play, Square, RotateCcw, Wrench, HardDrive, FileTerminal, Database, User, Users, Send, Loader2,
  MousePointer2, Target, Gift, Store, MapPin, ArrowLeft, Trash2, Link, CheckCircle, Clock,
  Swords, Crown, ShoppingCart, Flag, TrendingUp, Map, Megaphone, Eye, EyeOff, ServerCrash, FileText, PieChart, Info, ShieldAlert,
  Globe
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box as ThreeBox, Text, Environment, ContactShadows, Float, useGLTF } from '@react-three/drei';
import AIAssistant from './components/AIAssistant';
import { i18n, Language } from './i18n';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverState, setServerState] = useState<'offline' | 'starting' | 'online'>('offline');
  const [language, setLanguage] = useState<Language>('pt');

  const t = i18n[language];

  const navGroups = [
    {
      title: t.sidebar.monitoring,
      items: [
        { id: 'dashboard', label: t.sidebar.dashboard, icon: Activity },
        { id: 'logs', label: t.sidebar.logs, icon: FileText },
        { id: 'server', label: t.sidebar.server, icon: Server },
        { id: 'economy', label: t.sidebar.economy, icon: TrendingUp },
        { id: 'players', label: t.sidebar.players, icon: Users },
        { id: 'security', label: t.sidebar.security, icon: Shield },
      ]
    },
    {
      title: t.sidebar.development,
      items: [
        { id: 'tools', label: t.sidebar.tools, icon: Wrench },
        { id: 'events', label: t.sidebar.events, icon: Clock },
        { id: 'config', label: t.sidebar.config, icon: FileTerminal },
        { id: 'database', label: t.sidebar.database, icon: Database },
        { id: 'ai', label: t.sidebar.ai, icon: BrainCircuit },
      ]
    },
    {
      title: t.sidebar.systems,
      items: [
        { id: 'siege', label: t.sidebar.siege, icon: Flag },
        { id: 'guilds', label: t.sidebar.guilds, icon: Swords },
        { id: 'vip', label: t.sidebar.vip, icon: Crown },
        { id: 'cashshop', label: t.sidebar.cashshop, icon: ShoppingCart },
        { id: 'spots', label: t.sidebar.spots, icon: Map },
        { id: 'shops', label: t.sidebar.shops, icon: Store },
      ]
    },
    {
      title: t.sidebar.cloud,
      items: [
        { id: 'downloads', label: t.sidebar.explorer, icon: Download },
        { id: 'bridge', label: t.sidebar.setup, icon: Target },
        { id: 'webclient', label: t.sidebar.browser, icon: Gamepad2 },
      ]
    }
  ];

  const handleServerAction = (action: 'start' | 'stop' | 'restart') => {
    if (action === 'start') {
      setServerState('starting');
      fetch('/api/action/start', { method: 'POST' }).then(() => setServerState('online'));
    } else if (action === 'stop') {
      fetch('/api/action/stop', { method: 'POST' }).then(() => setServerState('offline'));
    } else if (action === 'restart') {
      setServerState('starting');
      fetch('/api/action/stop', { method: 'POST' }).then(() => {
          fetch('/api/action/start', { method: 'POST' }).then(() => setServerState('online'));
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0b0d] text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#050506] border-r border-[#1e2126] flex flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-[#1e2126]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-black italic">
                MU
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#050506] rounded-full shadow-[0_0_8px_#22c55e]"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">PaperMu</h1>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest leading-none">Embebbed & Cloud Master</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{group.title}</h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group
                        ${isActive ? 'bg-[#1e2126] text-white' : 'text-slate-400 hover:text-white hover:bg-[#1e2126]/50'}`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicator" 
                          className="absolute left-0 w-1 h-5 bg-orange-500 rounded-r-full"
                        />
                      )}
                      <Icon size={18} className={isActive ? 'text-orange-500' : 'group-hover:text-white transition-colors'} />
                      <span className="font-medium text-sm">{item.label}</span>
                      
                      {item.id === 'ai' && (
                        <span className="ml-auto flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-[#1e2126] space-y-4">
          <div className="bg-[#15171a] p-4 rounded-xl border border-[#1e2126]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.header.status}</span>
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]
                ${serverState === 'online' ? 'bg-green-500 text-green-500' : 
                  serverState === 'starting' ? 'bg-yellow-500 text-yellow-500 animate-pulse' : 
                  'bg-red-500 text-red-500'}`}>
              </span>
            </div>
            <p className="text-sm font-mono text-slate-300">v1.0.4.52 Live</p>
            <div className="flex gap-2 mt-4">
               <button 
                  onClick={() => handleServerAction('start')}
                  disabled={serverState !== 'offline'}
                  className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 p-2 rounded-lg flex justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-green-500/20"
                >
                 <Play size={16} />
               </button>
               <button 
                  onClick={() => handleServerAction('restart')}
                  disabled={serverState === 'offline'}
                  className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 p-2 rounded-lg flex justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-yellow-500/20"
                >
                 <RotateCcw size={16} />
               </button>
               <button 
                  onClick={() => handleServerAction('stop')}
                  disabled={serverState === 'offline'}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg flex justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-500/20"
                >
                 <Square size={16} />
               </button>
            </div>
          </div>
          
          <button 
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="w-full flex items-center justify-center gap-2 bg-[#15171a] hover:bg-[#1e2126] border border-[#1e2126] text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors font-medium text-xs"
          >
            <Globe size={14} />
            {language === 'pt' ? 'EN (English)' : 'PT-BR (Português)'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto bg-[#0a0b0d] flex flex-col">
        
        {/* Quick Actions Top Bar */}
        <div className="sticky top-0 z-50 bg-[#0a0b0d]/80 backdrop-blur-md border-b border-[#1e2126] px-8 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="bg-[#1e2126] text-slate-300 text-xs px-3 py-1.5 rounded-full font-mono flex items-center gap-2">
                 <Server size={12} className={serverState === 'online' ? 'text-green-500' : 'text-red-500'} />
                 {serverState === 'online' ? '128 ' + t.dashboard.online : 'Server ' + t.dashboard.offline}
               </div>
               <div className="text-xs text-slate-500 font-mono">
                 RAM: {serverState === 'online' ? '4.2GB / 8GB' : '0GB / 8GB'}
               </div>
            </div>
            
            <div className="flex gap-2">
               <button className="bg-[#111317] hover:bg-[#1e2126] border border-[#1e2126] text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                  <Megaphone size={14} className="text-blue-400" /> Aviso Global
               </button>
               <button className="bg-[#111317] hover:bg-[#1e2126] border border-[#1e2126] text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                  <RotateCcw size={14} className="text-orange-400" /> Clear Cache
               </button>
               <button className="bg-[#111317] hover:bg-red-500/10 border border-[#1e2126] hover:border-red-500/30 text-slate-300 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                  <ServerCrash size={14} /> Manutenção
               </button>
            </div>
        </div>

        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="p-8 max-w-7xl mx-auto flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} serverState={serverState} language={language} />}
              {activeTab === 'logs' && <LogsView />}
              {activeTab === 'economy' && <EconomyView />}
              {activeTab === 'players' && <PlayersView />}
              {activeTab === 'security' && <SecurityView />}
              {activeTab === 'events' && <EventsView />}
              {activeTab === 'siege' && <CastleSiegeView />}
              {activeTab === 'guilds' && <GuildsView />}
              {activeTab === 'vip' && <VipSystemView />}
              {activeTab === 'cashshop' && <CashShopView />}
              {activeTab === 'spots' && <SpotsView />}
              {activeTab === 'shops' && <ShopsView />}
              {activeTab === 'webclient' && <WebClientView />}
              {activeTab === 'downloads' && <DownloadsView />}
              {activeTab === 'bridge' && <SetupView language={language} />}
              {activeTab === 'server' && <ServerManagerView serverState={serverState} />}
              {activeTab === 'tools' && <ToolsView />}
              {activeTab === 'config' && <ConfigView />}
              {activeTab === 'ai' && <AIAssistant />}
              {activeTab === 'database' && <DatabaseView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ---------------- VIEWS ----------------

function MiniWebGLGame() {
  const meshRef = useRef<any>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls autoRotate autoRotateSpeed={2} />
      
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <ThreeBox ref={meshRef} args={[2, 2, 2]}>
          <meshStandardMaterial color="#f97316" wireframe />
        </ThreeBox>
        <Text
           position={[0, -2, 0]}
           fontSize={0.4}
           color="white"
           anchorX="center"
           anchorY="middle"
        >
          MuEngine.wasm (Simulated)
        </Text>
      </Float>
      
      <ContactShadows opacity={0.5} scale={10} blur={2} position={[0, -3, 0]} far={10} />
      <Environment preset="city" />
    </>
  );
}

function WebClientView() {
  const [hasClient, setHasClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasClient) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [hasClient]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      <header className="mb-2 shrink-0">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Seu Mu Online Web <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-1 rounded tracking-widest uppercase">Self-Hosted WebGL</span>
        </h2>
        <p className="text-slate-400 mt-1 max-w-3xl">Faça o upload do seu client compilado em WebGL/WASM para jogar o seu próprio servidor direto no navegador.</p>
      </header>

      {!hasClient ? (
        <div className="flex-1 rounded-2xl border-2 border-dashed border-[#1e2126] bg-[#111317] flex flex-col items-center justify-center p-8 text-center">
            <Gamepad2 size={64} className="text-[#1e2126] mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum Client Web Instalado</h3>
            <p className="text-slate-400 max-w-lg mb-8">
              Para jogar <b>O SEU</b> próprio Mu Online no navegador de forma independente, você precisa da source do Client (Main.exe) compilada para WebGL.
            </p>
            <div className="flex gap-4">
               <button onClick={() => setHasClient(true)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm">
                 SIMULAR DEPLOY DO CLIENTE
               </button>
            </div>
            <div className="mt-8 text-xs text-slate-500 max-w-3xl bg-[#050506] p-5 rounded-lg border border-[#1e2126] text-left leading-relaxed">
              <span className="font-bold text-orange-500 mb-3 block text-sm border-b border-[#1e2126] pb-2">O QUE SERIA NECESSÁRIO NA VIDA REAL?</span>
               <p>O Mu Online clássico usa DirectX/OpenGL antigos que não rodam no Chrome/Edge. Para termos ele real aqui no seu painel:</p>
               <ol className="list-decimal pl-5 mt-3 space-y-2 text-slate-400">
                 <li>Sua empresa precisaria descompilar a source do <span className="text-white">Main.exe</span> (C++).</li>
                 <li>Usar a ferramenta <span className="text-green-400 font-mono">Emscripten</span> para converter o C++ em <span className="text-blue-400 font-mono">WebAssembly (.wasm)</span>.</li>
                 <li>Converter todas as texturas (.bmd, .ozt, .ozj) para formatos web (.gltf, .png, .webp).</li>
                 <li>Fazer o upload da pasta <span className="text-orange-400 font-mono">/dist</span> para o nosso Painel Controlar e hospedar no seu servidor! (O Havek é um ótimo exemplo open-source disso).</li>
               </ol>
            </div>
        </div>
      ) : (
        <div className="flex-1 rounded-2xl overflow-hidden border border-[#1e2126] bg-black relative flex flex-col items-center justify-center cursor-pointer">
             <div className="absolute top-4 right-4 z-20">
               <button onClick={() => setHasClient(false)} className="bg-[#1e2126] hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                  ENCERRAR CLIENTE
               </button>
             </div>
             
             {isLoading ? (
               <div className="z-10 flex flex-col items-center justify-center animate-pulse">
                  <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
                  <h3 className="text-white font-bold text-xl mb-1">Compilando e Carregando Engine...</h3>
                  <div className="w-64 h-2 bg-[#1e2126] rounded-full mt-4 overflow-hidden">
                     <div className="h-full bg-orange-500 w-[85%] rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-3 font-mono">Mounting WebAssembly modules...</p>
               </div>
             ) : (
               <div className="absolute inset-0 w-full h-full">
                  <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                     <MiniWebGLGame />
                  </Canvas>
                  <div className="absolute top-4 left-4 text-xs font-mono text-green-400 p-2 bg-black/50 rounded backdrop-blur border border-green-500/20">
                    WebGL Render Active<br/>
                    FPS: 60<br/>
                    Draw Calls: 7<br/>
                    Triangles: 124
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                     <p className="text-slate-400 text-sm bg-black/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-800">
                       Arraste para mover a câmera 3D. <br/>Aqui entraria o jogo real!
                     </p>
                  </div>
               </div>
             )}
        </div>
      )}
    </div>
  );
}

function DashboardView({ setActiveTab, serverState, language }: { setActiveTab: (tab: string) => void, serverState: string, language: Language }) {
  const isOnline = serverState === 'online';
  const isStarting = serverState === 'starting';
  const t = i18n[language];

  const [hostInfo, setHostInfo] = useState({ os: 'Carregando...', cpu: '...', storage: '...', ram: '...' });
  const [muServerPath, setMuServerPath] = useState("");
  const [isSavingPath, setIsSavingPath] = useState(false);
  const [dbStats, setDbStats] = useState({ onlinePlayers: 0, totalAccounts: 0, totalCharacters: 0, totalGuilds: 0 });

  useEffect(() => {
    fetch('/api/server-info')
      .then(r => r.json())
      .then(data => setHostInfo(data))
      .catch(e => console.error(e));

    fetch('/api/config')
      .then(r => r.json())
      .then(data => setMuServerPath(data.muServerPath))
      .catch(e => console.error(e));
      
    fetch('/api/dashboard-stats')
      .then(r => r.json())
      .then(data => setDbStats(data))
      .catch(e => console.error(e));
  }, []);

  const savePath = () => {
    setIsSavingPath(true);
    fetch('/api/config', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ muServerPath })
    }).then(() => {
       setIsSavingPath(false);
       alert("Caminho do MuServer salvo e configurado!");
    }).catch(() => setIsSavingPath(false));
  };

  // Gráfico de exemplo (o banco de dados do Mu não armazena hitórico de horas nativamente no banco padrão)
  const chartData = [
    { time: '00:00', players: 400, connections: 450 },
    { time: '04:00', players: 300, connections: 320 },
    { time: '08:00', players: 500, connections: 550 },
    { time: '12:00', players: 800, connections: 850 },
    { time: '16:00', players: 1200, connections: 1300 },
    { time: '20:00', players: Math.max(1500, dbStats.onlinePlayers), connections: Math.max(1600, dbStats.onlinePlayers + 100) },
    { time: 'Agora', players: dbStats.onlinePlayers, connections: dbStats.onlinePlayers },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex gap-2 items-center">
           {t.dashboard.title} 
           {dbStats.totalAccounts > 0 && <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-1 rounded tracking-widest uppercase">{t.dashboard.liveDb}</span>}
        </h2>
        <p className="text-slate-400 mt-1">{t.dashboard.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t.dashboard.online, value: isOnline ? dbStats.onlinePlayers : t.dashboard.offline, icon: User, color: 'text-orange-500' },
          { label: t.dashboard.accounts, value: isOnline ? dbStats.totalAccounts : '0', icon: Activity, color: 'text-blue-500' },
          { label: t.dashboard.chars, value: isOnline ? `${dbStats.totalCharacters} / ${dbStats.totalGuilds}` : t.dashboard.offline, icon: Users, color: 'text-green-500' },
          { label: t.dashboard.errors, value: isOnline ? '0' : '0', icon: ServerCrash, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111317] border border-[#1e2126] rounded-2xl p-5 hover:border-orange-500/30 transition-colors flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{stat.label}</p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <h3 className={`text-2xl font-bold ${isOnline ? 'text-white' : 'text-slate-600'}`}>
               {isStarting ? <Loader2 className="animate-spin text-orange-500 h-5 w-5" /> : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
           <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-orange-500"/> {t.dashboard.traffic}</h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e2126" vertical={false} />
                 <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                 <RechartsTooltip contentStyle={{ backgroundColor: '#111317', borderColor: '#1e2126', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                 <Area type="monotone" dataKey="players" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPlayers)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2"><Server size={14} className="text-blue-500"/> {t.dashboard.hostInfo}</h3>
          <div className="space-y-4 flex-1">
             <div className="bg-[#0a0b0d] p-4 rounded-xl border border-[#1e2126]">
                <div className="text-xs text-slate-500 mb-1">{t.dashboard.os}</div>
                <div className="text-sm text-white font-mono flex items-center gap-2"><Shield size={14}/> {hostInfo.os}</div>
             </div>
             <div className="bg-[#0a0b0d] p-4 rounded-xl border border-[#1e2126]">
                <div className="text-xs text-slate-500 mb-1">{t.dashboard.cpu}</div>
                <div className="text-sm text-white font-mono flex items-center gap-2"><BrainCircuit size={14}/> {hostInfo.cpu}</div>
             </div>
             <div className="bg-[#0a0b0d] p-4 rounded-xl border border-[#1e2126]">
                <div className="text-xs text-slate-500 mb-1">{t.dashboard.storage}</div>
                <div className="text-sm text-white font-mono flex items-center gap-2"><HardDrive size={14}/> {hostInfo.storage}</div>
             </div>
          </div>
          
          <div className="mt-4 bg-[#0a0b0d] p-4 rounded-xl border border-[#1e2126] flex flex-col gap-2">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Caminho (MuServer)</div>
            <input 
              type="text" 
              className="bg-[#111317] border border-[#1e2126] text-white text-xs font-mono p-2 rounded focus:outline-none focus:border-blue-500" 
              value={muServerPath} 
              onChange={e => setMuServerPath(e.target.value)} 
            />
            <button onClick={savePath} disabled={isSavingPath} className="w-full bg-[#1e2126] hover:bg-[#2a2d33] text-white py-2 rounded font-bold text-xs transition-colors border border-[#2a2d33] disabled:opacity-50">
              {isSavingPath ? 'Salvando...' : 'Salvar Caminho WSL/Windows'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsView() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if(isPaused) return;
    const interval = setInterval(() => {
      fetch('/api/logs')
        .then(r => r.json())
        .then(data => {
            if(data.logs) {
                setLogs(data.logs);
            }
        });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="mb-2 shrink-0 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <FileText size={28} className="text-orange-500" /> Console em Tempo Real
           </h2>
           <p className="text-slate-400 mt-1">Logs interceptados diretamente do servidor usando a nova API.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsPaused(!isPaused)} className={`${isPaused ? 'bg-orange-600' : 'bg-[#111317]'} hover:bg-[#1e2126] border border-[#1e2126] text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors`}>
             {isPaused ? 'Retomar' : 'Pausar'}
           </button>
           <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">Baixar .TXT</button>
        </div>
      </header>

      <div className="flex gap-2">
         {['Tudo', 'ConnectServer', 'JoinServer', 'GameServer', 'ExDB', 'ChatServer'].map((filter, i) => (
            <button key={i} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${i === 0 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-[#111317] border border-[#1e2126] text-slate-400 hover:text-white'}`}>
              {filter}
            </button>
         ))}
      </div>

      <div className="flex-1 bg-[#050506] border border-[#1e2126] rounded-2xl p-4 font-mono text-xs overflow-y-auto space-y-1 relative">
         <div className="sticky top-0 right-0 float-right flex gap-2 z-10 bg-[#050506]/80 p-1 rounded-bl-lg">
           <span className={`${isPaused ? 'text-red-500' : 'text-green-500 animate-pulse'} flex items-center gap-1`}>
             <div className={`w-2 h-2 ${isPaused ? 'bg-red-500' : 'bg-green-500'} rounded-full`}></div> 
             {isPaused ? 'Pausado' : 'Lendo StdOut...'}
           </span>
         </div>
         {logs.map((line, idx) => (
            <p key={idx} className={line.includes('Error') ? 'text-red-500' : line.includes('GameServer') ? 'text-blue-400' : 'text-slate-300'}>{line}</p>
         ))}
         {logs.length === 0 && <p className="text-slate-600">Aguardando logs do servidor...</p>}
      </div>
    </div>
  );
}

function EconomyView() {
  const pieData = [
    { name: 'Jewel of Bless', value: 4000, color: '#fcd34d' },
    { name: 'Jewel of Soul', value: 3000, color: '#f472b6' },
    { name: 'Jewel of Chaos', value: 8000, color: '#93c5fd' },
    { name: 'Jewel of Life', value: 1500, color: '#fca5a5' }
  ];

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Economia & Drops <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded tracking-widest uppercase">Análise de Inflação</span>
        </h2>
        <p className="text-slate-400 mt-1 max-w-3xl">Monitoramento global da quantidade de jóias forjadas, zen em circulação e transações suspeitas (Dupe).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Zen Total em Contas', value: '1.4 Bilhões' },
          { label: 'WCoinC Em Circulação', value: '45.000' },
          { label: 'Jóias Forjadas (Hoje)', value: '1,240' },
          { label: 'Alerta de DUPE', value: 'Nenhum', color: 'text-green-500' }
        ].map((item, i) => (
          <div key={i} className="bg-[#111317] border border-[#1e2126] rounded-xl p-5">
             <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">{item.label}</div>
             <div className={`text-xl font-bold ${item.color || 'text-white'}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="col-span-1 bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Jóias Distribuídas</h3>
            <div className="flex flex-col gap-4">
              {pieData.map((data, i) => (
                 <div key={i} className="flex justify-between items-center bg-[#050506] p-3 rounded-lg border border-[#1e2126]">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                      <span className="text-sm text-slate-300">{data.name}</span>
                    </div>
                    <span className="font-bold font-mono text-white">{data.value} und</span>
                 </div>
              ))}
            </div>
         </div>
         
         <div className="col-span-2 bg-[#111317] border border-[#1e2126] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Logs de Trade & Loja Pessoal (Store)</h3>
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-300">
                 <thead className="bg-[#1e2126] text-xs uppercase tracking-widest text-slate-400">
                   <tr>
                     <th className="px-4 py-2">Horário</th>
                     <th className="px-4 py-2">Tipo</th>
                     <th className="px-4 py-2">Expedidor</th>
                     <th className="px-4 py-2">Receptor/Item</th>
                     <th className="px-4 py-2">Volume</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1e2126] font-mono text-xs">
                   <tr>
                     <td className="px-4 py-3">14:00:22</td>
                     <td className="px-4 py-3"><span className="text-blue-400 bg-blue-500/10 px-2 rounded">TRADE</span></td>
                     <td className="px-4 py-3">BladeKnight</td>
                     <td className="px-4 py-3">DarkWizard</td>
                     <td className="px-4 py-3 text-orange-400">+5B Zen, Dragon Armor +9</td>
                   </tr>
                   <tr>
                     <td className="px-4 py-3">14:05:10</td>
                     <td className="px-4 py-3"><span className="text-yellow-400 bg-yellow-500/10 px-2 rounded">PERSONAL</span></td>
                     <td className="px-4 py-3">ElfLove</td>
                     <td className="px-4 py-3">Jewel of Chaos</td>
                     <td className="px-4 py-3 text-orange-400">14.000.000 Zen</td>
                   </tr>
                   <tr>
                     <td className="px-4 py-3">14:10:00</td>
                     <td className="px-4 py-3"><span className="text-green-400 bg-green-500/10 px-2 rounded">NPC</span></td>
                     <td className="px-4 py-3">Tester</td>
                     <td className="px-4 py-3">Potion of Healing x10</td>
                     <td className="px-4 py-3 text-red-400">-1.000 Zen</td>
                   </tr>
                 </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

function GuildsView() {
  return (
    <div className="space-y-6">
      <header className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Swords size={28} className="text-blue-500" /> Guilds & Alianças
           </h2>
           <p className="text-slate-400 mt-1 max-w-3xl">Visualização do ranking, membros e brasões (Hostility & Alliance).</p>
        </div>
        <div className="flex gap-2">
           <input type="text" placeholder="Buscar Guild..." className="bg-[#111317] border border-[#1e2126] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
           <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-lg">Buscar</button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { name: 'Illusion', master: 'GM_Zero', score: 14500, members: '15/40', rank: 1, logo: 'bg-red-500' },
           { name: 'Spartans', master: 'Leonidas', score: 12000, members: '38/40', rank: 2, logo: 'bg-yellow-500' },
           { name: 'DarkArmy', master: 'Hades', score: 8500, members: '20/40', rank: 3, logo: 'bg-purple-500' },
           { name: 'Newbies', master: 'NoobBR', score: 120, members: '5/40', rank: 4, logo: 'bg-green-500' },
         ].map((guild, i) => (
            <div key={i} className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6 relative group overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#eab308' : '#3b82f6' }}></div>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-md ${guild.logo} border-2 border-[#1e2126] flex items-center justify-center shadow-lg`}></div>
                     <div>
                        <h3 className="font-bold text-lg text-white">{guild.name}</h3>
                        <p className="text-xs text-slate-500">Master: <span className="text-orange-400 font-mono">{guild.master}</span></p>
                     </div>
                  </div>
                  <div className="bg-[#050506] px-3 py-1 rounded border border-[#1e2126] text-center">
                     <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Rank</div>
                     <div className="text-xl font-black text-white">#{guild.rank}</div>
                  </div>
               </div>
               
               <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-[#050506] p-2 rounded-lg border border-[#1e2126] text-center">
                     <div className="text-[10px] text-slate-500">G-Score</div>
                     <div className="font-bold text-yellow-500 font-mono">{guild.score}</div>
                  </div>
                  <div className="flex-1 bg-[#050506] p-2 rounded-lg border border-[#1e2126] text-center">
                     <div className="text-[10px] text-slate-500">Membros</div>
                     <div className="font-bold text-blue-400 font-mono">{guild.members}</div>
                  </div>
               </div>
               
               <button className="w-full bg-[#1e2126] hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-sm transition-colors">Ver Membros</button>
            </div>
         ))}
      </div>
    </div>
  );
}

function SpotsView() {
  const [msbContent, setMsbContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     fetch('/api/files/read?filepath=Data/MonsterSetBase.txt')
        .then(r => r.json())
        .then(d => setMsbContent(d.content || ""))
        .catch(e => console.error(e));
  }, []);

  const handleSave = () => {
     setIsSaving(true);
     fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filepath: 'Data/MonsterSetBase.txt', content: msbContent })
     }).then(() => {
        setIsSaving(false);
        alert('MonsterSetBase salvo com sucesso na máquina!');
     }).catch(() => setIsSaving(false));
  };

  return (
    <div className="space-y-6">
       <header className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Map size={28} className="text-green-500" /> Spots & Monstros <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded tracking-widest uppercase">MonsterSetBase.txt</span>
           </h2>
           <p className="text-slate-400 mt-1 max-w-3xl">Edite os monstros de forma real.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50">
           {isSaving ? 'Salvando...' : 'Salvar MSB'}
        </button>
      </header>

      <div className="flex gap-6 h-[600px]">
         <div className="w-1/3 flex flex-col gap-4">
             <div className="flex-1 bg-[#111317] border border-[#1e2126] rounded-2xl p-4 overflow-y-auto">
                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest mb-4">Código MonsterSetBase.txt</h3>
                <textarea 
                   className="w-full h-[500px] bg-[#050506] border border-[#1e2126] p-3 text-slate-300 font-mono text-xs focus:outline-none focus:border-green-500 rounded resize-none"
                   value={msbContent}
                   onChange={e => setMsbContent(e.target.value)}
                />
             </div>
         </div>

         <div className="flex-1 bg-[#111317] border border-[#1e2126] rounded-2xl p-2 relative flex items-center justify-center overflow-hidden">
             {/* Fake map image representation */}
             <div className="absolute inset-0 bg-[#050506] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             
             {/* Grid */}
             <div className="absolute inset-0" style={{ backgroundSize: '50px 50px', backgroundImage: 'linear-gradient(to right, #1e2126 1px, transparent 1px), linear-gradient(to bottom, #1e2126 1px, transparent 1px)' }}></div>
             
             {/* Safezone Map center */}
             <div className="w-40 h-40 border-2 border-green-500/30 bg-green-500/10 rounded-full flex items-center justify-center relative z-10">
                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Safe Zone Bar</span>
             </div>

             {/* Fake markers */}
             <div className="absolute top-1/4 left-1/4 group cursor-pointer">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_red]"></div>
                <span className="absolute -top-6 -left-10 bg-[#0a0b0d] border border-red-500/30 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Spiders (135,120)</span>
             </div>
             
             <div className="absolute bottom-1/4 right-1/3 group cursor-pointer">
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_orange]"></div>
                <span className="absolute -top-6 -left-10 bg-[#0a0b0d] border border-orange-500/30 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Bull Fighter (180,200)</span>
             </div>

             <div className="absolute top-4 right-4 bg-[#0a0b0d] border border-[#1e2126] px-3 py-1.5 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400">Arraste os pontos para mover no MonsterSetBase</span>
             </div>
         </div>
      </div>
    </div>
  );
}

function ShopsView() {
  const [shopContent, setShopContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     fetch('/api/files/read?filepath=Data/Shop0.txt')
        .then(r => r.json())
        .then(d => setShopContent(d.content || ""))
        .catch(e => console.error(e));
  }, []);

  const handleSave = () => {
     setIsSaving(true);
     fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filepath: 'Data/Shop0.txt', content: shopContent })
     }).then(() => {
        setIsSaving(false);
        alert('Shop salvo com sucesso no servidor!');
     }).catch(() => setIsSaving(false));
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="mb-0">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Store size={28} className="text-yellow-500" /> Lojas NPCs <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-1 rounded tracking-widest uppercase">EventItemBag / Shops</span>
        </h2>
        <p className="text-slate-400 mt-1 max-w-3xl">Configure os itens vendidos pelos NPCs, como a Potion Girl, Ferreiro/Blacksmith, entre outros. Usando arquivos txt reais do servidor.</p>
      </header>

      <div className="flex gap-4">
        <select className="w-1/3 bg-[#111317] border border-[#1e2126] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500">
           <option>Shop 0 (Liaman the Barmaid)</option>
        </select>
        <button onClick={handleSave} disabled={isSaving} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50">
           {isSaving ? 'Salvando...' : 'Salvar Shop0.txt'}
        </button>
      </div>

      <div className="bg-[#111317] border border-[#1e2126] rounded-2xl flex-1 p-6 relative flex flex-col">
          <textarea 
             value={shopContent}
             onChange={(e) => setShopContent(e.target.value)}
             className="w-full h-full bg-[#050506] border border-[#1e2126] p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-yellow-500 rounded resize-none"
          />
          
          <div className="absolute top-6 right-6 w-72 bg-[#050506] border border-[#1e2126] rounded-xl p-4">
             <h4 className="font-bold text-white mb-2 text-sm">Adicionar Item Rápido</h4>
             <div className="space-y-3">
                <input type="text" placeholder="ID (Ex: 14 0)" className="w-full bg-[#111317] border border-[#1e2126] rounded px-3 py-2 text-xs text-white" />
                <button onClick={() => setShopContent(shopContent + '\n14 \t 0 \t 0 \t 0 \t 0 \t 0 \t 0 // Novo Item')} className="w-full bg-[#1e2126] hover:bg-yellow-600 hover:text-black text-white font-bold py-2 rounded text-xs transition-colors">ADICIONAR LINHA</button>
             </div>
          </div>
      </div>
    </div>
  );
}

function SetupView({ language }: { language: Language }) {
  const [muServerPath, setMuServerPath] = useState("");
  const [connectionMode, setConnectionMode] = useState<'local' | 'remote'>('local');
  const [sshConfig, setSshConfig] = useState({ host: '', port: 22, username: 'Administrator', password: '' });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [isInstalling, setIsInstalling] = useState(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [sqlQuery, setSqlQuery] = useState("CREATE TABLE Character (Name VARCHAR(50), Class INT, cLevel INT, MapNumber INT, MapPosX INT, MapPosY INT, CtlCode INT, AccountID VARCHAR(50));");
  const [isExecutingDb, setIsExecutingDb] = useState(false);
  const [dbResult, setDbResult] = useState<any>(null);

  const t = i18n[language];

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => {
         setMuServerPath(d.muServerPath || "");
         setConnectionMode(d.connectionMode || 'local');
         if(d.sshConfig) setSshConfig(d.sshConfig);
      })
      .catch(e => console.error(e));
  }, []);

  const saveConfig = async () => {
     setIsSavingConfig(true);
     try {
         await fetch('/api/config', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ muServerPath, mode: connectionMode, ssh: sshConfig })
         });
         alert("Configurações de conexão salvas! Se habilitou SSH remoto, todas as leituras de arquivo e executáveis agirão através dele.");
     } catch(e) {
         console.error(e);
     }
     setIsSavingConfig(false);
  };

  const handleInstallFolders = async () => {
     setIsInstalling(true);
     setInstallLogs(prev => [...prev, `[INFO] Iniciando criação das pastas em ${muServerPath}...`]);
     try {
         const res = await fetch('/api/install/folders', { method: 'POST' });
         const data = await res.json();
         if (data.success) {
            setInstallLogs(prev => [...prev, `[SUCCESS] Super estrutura de pastas do DataServer, JoinServer e GameServer criadas com sucesso!`]);
         } else {
            setInstallLogs(prev => [...prev, `[ERROR] ${data.error}`]);
         }
     } catch (e: any) {
         setInstallLogs(prev => [...prev, `[ERROR] Falha de rede: ${e.message}`]);
     }
     setIsInstalling(false);
  };

  const executeSqlQuery = async () => {
      setIsExecutingDb(true);
      setDbResult(null);
      try {
         const res = await fetch('/api/db/execute', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: sqlQuery })
         });
         const data = await res.json();
         if (data.success) {
            setDbResult({ success: true, message: `Query executada. Linhas afetadas: ${data.rowsAffected}`, data: data.result });
         } else {
            setDbResult({ success: false, error: data.error });
         }
      } catch (e: any) {
         setDbResult({ success: false, error: e.message });
      }
      setIsExecutingDb(false);
  };

  return (
    <div className="space-y-6">
      <header className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             {t.setup.title} <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-1 rounded tracking-widest uppercase">WSL/Windows DB</span>
           </h2>
           <p className="text-slate-400 mt-1 max-w-3xl">{t.setup.subtitle}</p>
        </div>
      </header>
      
      <div className="bg-[#111317] border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-white uppercase text-sm tracking-widest mb-4 flex items-center gap-2">{t.setup.envConfig}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 block">{t.setup.pathLabel}</label>
            <input 
               type="text" 
               className="w-full bg-[#050506] border border-[#1e2126] text-white text-sm font-mono p-3 rounded-lg focus:outline-none focus:border-blue-500" 
               value={muServerPath} 
               onChange={e => setMuServerPath(e.target.value)} 
               placeholder="C:\MuServer ou /home/pi/PaperMu"
            />
            <p className="text-[10px] text-slate-500 mt-2">{t.setup.pathHint}</p>
          </div>
          <div>
             <label className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 block">{t.setup.connMode}</label>
             <div className="flex gap-2">
                <button onClick={() => setConnectionMode('local')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-[11px] transition-all border ${connectionMode === 'local' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-[#050506] text-slate-400 border-[#1e2126]'}`}>
                   {t.setup.localNode}
                </button>
                <button onClick={() => setConnectionMode('remote')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-[11px] transition-all border ${connectionMode === 'remote' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-[#050506] text-slate-400 border-[#1e2126]'}`}>
                   {t.setup.remoteSsh}
                </button>
             </div>
             <div className="flex bg-green-500/10 border border-green-500/20 rounded p-2 mt-2 gap-2 text-xs text-green-400">
               <span>💡</span>
               <p dangerouslySetInnerHTML={{ __html: t.setup.armHint }}></p>
             </div>
          </div>
        </div>

        {connectionMode === 'remote' && (
          <div className="mt-4 p-4 bg-[#050506] border border-orange-500/30 rounded-xl grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="text-xs text-slate-500 block mb-1">{t.setup.vpsHost}</label><input type="text" value={sshConfig.host} onChange={e => setSshConfig({...sshConfig, host: e.target.value})} className="w-full bg-[#1e2126] border-none rounded p-2 text-white text-xs" /></div>
            <div><label className="text-xs text-slate-500 block mb-1">{t.setup.sshPort}</label><input type="number" value={sshConfig.port} onChange={e => setSshConfig({...sshConfig, port: Number(e.target.value)})} className="w-full bg-[#1e2126] border-none rounded p-2 text-white text-xs" /></div>
            <div><label className="text-xs text-slate-500 block mb-1">{t.setup.sshUser}</label><input type="text" value={sshConfig.username} onChange={e => setSshConfig({...sshConfig, username: e.target.value})} className="w-full bg-[#1e2126] border-none rounded p-2 text-white text-xs" /></div>
            <div><label className="text-xs text-slate-500 block mb-1">{t.setup.sshPass}</label><input type="password" value={sshConfig.password} onChange={e => setSshConfig({...sshConfig, password: e.target.value})} className="w-full bg-[#1e2126] border-none rounded p-2 text-white text-xs" placeholder="••••••••" /></div>
          </div>
        )}
        
        <button onClick={saveConfig} disabled={isSavingConfig} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {isSavingConfig ? t.setup.saving : t.setup.saveConfig}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Folder Structure */}
         <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-white uppercase text-sm tracking-widest mb-4 flex items-center gap-2">
               <span className="p-2 bg-[#1e2126] aspect-square rounded-md text-green-500"><TerminalSquare size={18} /></span>
               {t.setup.folders}
            </h3>
            <p className="text-sm text-slate-400 mb-6" dangerouslySetInnerHTML={{ __html: t.setup.foldersDesc.replace('{path}', `<code>${muServerPath}</code>`) }}></p>

            <div className="bg-[#050506] border border-[#1e2126] p-4 rounded-xl flex-1 mb-4 overflow-auto max-h-[150px] font-mono text-[10px] text-slate-400">
               {installLogs.length === 0 ? (
                  <span className="text-slate-600">{t.setup.waitInstall}</span>
               ) : (
                  installLogs.map((log, i) => <div key={i} className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-400'}>{log}</div>)
               )}
            </div>

            <button 
               onClick={handleInstallFolders}
               disabled={isInstalling}
               className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
               {isInstalling ? t.setup.creating : t.setup.createFolders}
            </button>
         </div>

         {/* SQL Executor */}
         <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-white uppercase text-sm tracking-widest mb-4 flex items-center gap-2">
               <span className="p-2 bg-[#1e2126] aspect-square rounded-md text-blue-500"><Database size={18} /></span>
               {t.setup.sqlScript}
            </h3>
            <p className="text-sm text-slate-400 mb-4">{t.setup.sqlDesc}</p>

            <textarea 
               value={sqlQuery}
               onChange={(e) => setSqlQuery(e.target.value)}
               className="w-full bg-[#050506] border border-[#1e2126] text-blue-400 font-mono text-[11px] p-4 rounded-xl focus:outline-none focus:border-blue-500 resize-none h-[150px] mb-4"
               spellCheck="false"
            />

            {dbResult && (
               <div className={`p-4 rounded-xl mb-4 text-xs font-mono overflow-auto max-h-[100px] border ${dbResult.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {dbResult.success ? dbResult.message : dbResult.error}
               </div>
            )}

            <button 
               onClick={executeSqlQuery}
               disabled={isExecutingDb}
               className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50 mt-auto"
            >
               {isExecutingDb ? t.setup.executing : t.setup.runSql}
            </button>
         </div>
      </div>
    </div>
  );
}

function DownloadsView() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleSearch = async (overrideFilter?: string) => {
    const filterToUse = overrideFilter || activeFilter;
    if (!query.trim() && filterToUse === 'all') return;
    setIsSearching(true);
    
    let baseSearch = query;
    if (filterToUse === 'mobile') baseSearch += " server files mobile origin awakening android";
    if (filterToUse === 'desktop') baseSearch += " server files desktop pc";
    if (filterToUse === 'source') baseSearch += " source code c++ c#";
    if (filterToUse === 'repack') baseSearch += " repack muserver pre-configured";
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é uma API de busca estrita especializada em emuladores e servidores de MuOnline e jogos derivados (Mu Origin, Mu Mobile).
        USE A FERRAMENTA GOOGLE SEARCH OBRIGATORIAMENTE para buscar: "site:forum.ragezone.com ${baseSearch.trim()}".
        
        REGRAS CRÍTICAS DE SEGURANÇA E PREVENÇÃO DE ALUCINAÇÃO:
        1. Você DEVE usar a ferramenta googleSearch para cada busca.
        2. NÃO invente URLs. A propriedade "link" no JSON DEVE ser EXATAMENTE a URL devolvida pela ferramenta de busca para um tópico válido do fórum (ex: https://forum.ragezone.com/threads/...).
        3. Se nenhum link do forum.ragezone.com for encontrado na busca com a ferramenta, retorne um array vazio [].
        4. Transcreva os títulos reais dos resultados. Extraia a plataforma (Mobile/PC/Source) nos campos apropriados.
        
        Retorne APENAS um JSON válido:
        {
           "results": [
              {
                "title": "Título exato extraído do resultado da busca Google",
                "emulator": "Base (ex: MuEmu, IGCN, Mobile Origin, Source) - tentar inferir do título ou snippet",
                "author": "Nome do autor ou fórum",
                "type": "Versão/Plataforma (ex: Season 6 Desktop, Mobile Android, WebHTML5)",
                "img": "blue",
                "link": "https://..." // OBRIGATORIAMENTE UM LINK REAL DEVOLVIDO PELA FERRAMENTA GOOGLE
              }
           ]
        }
        Não use markdown, devolva apenas a string JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
        }
      });
      let text = response.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(text);
      if (parsed.results) {
        setVersions(parsed.results);
      }
    } catch (e) {
      console.error(e);
      alert("Falha ao analisar os dados ou ao conectar com a IA. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const setFilterAndSearch = (filter: string) => {
    setActiveFilter(filter);
    if (query.trim() || filter !== 'all') {
      handleSearch(filter);
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-4 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Explorador Web 
              <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded font-bold uppercase tracking-widest border border-orange-500/20">Powered by RageZone & Google</span>
            </h2>
            <p className="text-slate-400 mt-1">Busque files reais, clientes mobile (Origin) e sources (C++) diretamente da comunidade.</p>
          </div>
          <div className="relative flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite o que procura..." 
              className="bg-[#1e2126] border border-[#2a2d33] rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500 w-64 disabled:opacity-50" 
              disabled={isSearching}
            />
            <button 
              onClick={() => handleSearch()}
              disabled={isSearching || (!query.trim() && activeFilter === 'all')}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center min-w-[150px]"
            >
              {isSearching ? <><Loader2 size={16} className="animate-spin mr-2" /> BUSCANDO...</> : "BUSCAR ARQUIVOS"}
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'mobile', label: 'Mobile (Origin/Android)' },
            { id: 'desktop', label: 'Desktop (Season 1-19)' },
            { id: 'source', label: 'Sources (C++/Java)' },
            { id: 'repack', label: 'Repacks Prontos' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterAndSearch(f.id)}
              disabled={isSearching}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                 activeFilter === f.id 
                 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' 
                 : 'bg-[#1e2126] text-slate-400 border-transparent hover:bg-[#2a2d33] hover:text-white'
              } disabled:opacity-50`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {versions.length === 0 && !isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#1e2126] rounded-2xl">
          <Database size={48} className="text-[#1e2126] mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Nenhum resultado local.</h3>
          <p className="text-slate-500 mt-2">Use a barra de busca acima para rastrear o fórum RageZone em tempo real.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions.map((v, i) => (
            <div key={i} className="bg-[#111317] border border-[#1e2126] rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all group">
              <div className={`h-32 bg-[#0a0b0d] relative flex items-center justify-center border-b border-[#1e2126]`}>
                 <Gamepad2 className={'text-'+(v.img || 'orange')+'-500/10 w-20 h-20 absolute'} />
                 <div className="relative z-10 text-center px-4">
                   <h3 className="font-bold text-xl text-white truncate max-w-[250px]" title={v.title}>{v.title}</h3>
                   <span className="text-xs bg-black/50 px-2 py-1 rounded text-slate-300 backdrop-blur-md mt-2 inline-block">{v.emulator}</span>
                 </div>
              </div>
              <div className="p-5 flex flex-col gap-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Autor:</span>
                   <span className="text-white font-medium max-w-[120px] truncate" title={v.author}>{v.author}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Detalhes:</span>
                   <span className="text-green-400 font-medium flex items-center gap-1"><Shield size={14}/> {v.type}</span>
                 </div>
                 <a href={v.link !== '#' ? v.link : undefined} target="_blank" rel="noreferrer" className="w-full mt-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                   <Download size={16} /> ACESSAR REPACK
                 </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServerManagerView({ serverState }: { serverState: string }) {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Gerenciador do Servidor</h2>
        <p className="text-slate-400 mt-1">Controle os processos, portas e serviços em execução.</p>
      </header>

      <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Processos Core</h3>
        <div className="space-y-3">
          {[
            { name: 'ConnectServer.exe', port: '44405', status: serverState, mem: '15 MB' },
            { name: 'JoinServer.exe', port: '55970', status: serverState, mem: '45 MB' },
            { name: 'DataServer.exe', port: '55960', status: serverState, mem: '120 MB' },
            { name: 'GameServer.exe', port: '55901', status: serverState, mem: '850 MB' },
            { name: 'GameServerCS.exe', port: '55919', status: 'offline', mem: '0 MB' },
          ].map((proc, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${proc.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : proc.status === 'starting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <h4 className="font-medium text-slate-200">{proc.name}</h4>
                  <p className="text-xs text-slate-500">Porta: {proc.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-slate-400">Uso de Ram</p>
                  <p className="text-sm font-mono text-slate-200">{proc.status === 'online' ? proc.mem : '0 MB'}</p>
                </div>
                <div className="flex gap-2">
                  <button disabled={proc.status === 'online'} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded border border-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
                    <Play size={16} />
                  </button>
                  <button disabled={proc.status === 'offline'} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
                    <Square size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Log Analyzer */}
      <div className="bg-[#111317] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.05)] mt-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
             <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><BrainCircuit size={20} className="text-blue-400" /> Analisador de Logs por IA (Gemini)</h3>
                <p className="text-sm text-slate-400">Cole o log de erro do GameServer ou JoinServer para o Gemini analisar e sugerir a correção.</p>
             </div>
             <div className="text-xs font-mono bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">Auto-Detect: Ativado</div>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea 
               placeholder="[GameServer] error-L1 : [LoginServer] Connection failed...&#10;[JoinServer] GetQueueCompletionStatus() failed..."
               className="w-full h-40 bg-[#050506] border border-[#1e2126] rounded-xl p-4 text-xs font-mono text-orange-200 focus:outline-none focus:border-blue-500 resize-none transition-colors shadow-inner"
            ></textarea>
            <div className="bg-[#050506] border border-blue-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 relative overflow-hidden group hover:border-blue-500/50 transition-all">
               <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
               <BrainCircuit size={32} className="text-blue-500/50 mb-3 group-hover:scale-110 group-hover:text-blue-400 transition-all" />
               <p className="text-sm relative z-10 w-3/4">Aguardando colagem de logs para realizar diagnóstico automático da arquitetura do Servidor. Detecta erros em WzAG.dll, DataServer binds, MSSQL ODBC, etc.</p>
               <button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm transition-transform z-10 shadow-lg shadow-blue-900/50 active:scale-95">Analisar Origem do Crash</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function ToolsView() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: 'item', name: 'Editor de Itens', desc: 'Item.bmd / Item.txt (Dano, Req, Classe)', icon: Box, color: 'text-blue-400' },
    { id: 'monstersetbase', name: 'MonsterSetBase', desc: 'Spots, Mapas e Coordenadas.', icon: Target, color: 'text-red-400' },
    { id: 'eventbag', name: 'EventBags / Drops', desc: 'Configurar Box of Kundun, Invasões.', icon: Gift, color: 'text-purple-400' },
    { id: 'shop', name: 'Shop Editor', desc: 'Lojas NPCs (Lorencia, Noria).', icon: Store, color: 'text-yellow-400' },
    { id: 'gate', name: 'Gate Editor', desc: 'Portais de Mapas (Warp).', icon: MapPin, color: 'text-green-400' }
  ];

  if (activeTool === 'monstersetbase') return <MonsterSetBaseEditor onBack={() => setActiveTool(null)} />;
  if (activeTool === 'item') return <ItemEditor onBack={() => setActiveTool(null)} />;
  if (activeTool === 'eventbag') return <EventBagEditor onBack={() => setActiveTool(null)} />;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Ferramentas de Edição Visual</h2>
        <p className="text-slate-400 mt-1">Ferramentas avançadas para personalizar o seu servidor sem precisar editar os arquivos Txt diretamente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button 
            key={tool.id} 
            onClick={() => setActiveTool(tool.id)}
            className="bg-[#111317] hover:bg-[#1e2126] border border-[#1e2126] hover:border-orange-500/50 p-5 rounded-2xl flex flex-col items-start gap-4 transition-all text-left group"
          >
            <div className={`p-3 bg-[#0a0b0d] rounded-xl ${tool.color} border border-[#1e2126] group-hover:scale-110 transition-transform`}>
              <tool.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">{tool.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MonsterSetBaseEditor({ onBack }: { onBack: () => void }) {
  const [selectedMap, setSelectedMap] = useState('0'); // 0 = Lorencia
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spots, setSpots] = useState([
    { id: 1, map: '0', x: 135, y: 125, mob: 'Budge Dragon', radius: 3, count: 5 },
    { id: 2, map: '0', x: 145, y: 110, mob: 'Lich', radius: 5, count: 8 },
  ]);

  const maps = [
    { id: '0', name: 'Lorencia' },
    { id: '1', name: 'Dungeon' },
    { id: '2', name: 'Devias' },
    { id: '3', name: 'Noria' },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex justify-between items-center bg-[#111317] p-4 rounded-xl border border-[#1e2126]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">MonsterSetBase Editor</h2>
            <p className="text-xs text-slate-400">Clique no grid para adicionar spots/mobs.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
             className="bg-[#1e2126] border border-[#2a2d33] text-sm text-white px-3 py-1.5 rounded outline-none"
             value={selectedMap}
             onChange={(e) => setSelectedMap(e.target.value)}
          >
            {maps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-1.5 rounded text-sm transition-colors shadow-lg">
            Salvar MonsterSetBase.txt
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Fake Minimap/Radar Interaction */}
        <div className="col-span-2 bg-[#050506] border border-[#1e2126] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          
          <div 
             className="w-[400px] h-[400px] bg-[#111317] border border-[#2a2d33] grid "
             style={{ gridTemplateColumns: 'repeat(20, 1fr)', gridTemplateRows: 'repeat(20, 1fr)' }}
             onMouseMove={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const mapX = Math.floor(((e.clientX - rect.left) / rect.width) * 255);
               const mapY = Math.floor(((e.clientY - rect.top) / rect.height) * 255);
               setMousePos({ x: mapX, y: mapY });
             }}
          >
             {/* Spot Markers Simulation */}
             {spots.filter(s => s.map === selectedMap).map((spot) => (
                <div 
                  key={spot.id} 
                  className="absolute w-4 h-4 bg-red-500 rounded-full border border-white shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
                  style={{ 
                    left: `${(spot.x / 255) * 100}%`, 
                    top: `${(spot.y / 255) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={spot.mob}
                >
                  <span className="absolute -top-6 text-[9px] bg-red-900/80 px-1 py-0.5 rounded text-white font-mono whitespace-nowrap border border-red-500/50">
                    {spot.mob} (x:{spot.x} y:{spot.y})
                  </span>
                </div>
             ))}
          </div>

          <div className="absolute bottom-4 left-4 bg-black/50 text-orange-400 font-mono text-xs px-2 py-1 rounded border border-orange-500/20 backdrop-blur">
             Coords: {mousePos.x}, {mousePos.y}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="col-span-1 border border-[#1e2126] bg-[#111317] rounded-2xl p-4 overflow-y-auto">
          <h3 className="font-bold text-white mb-4 text-sm border-b border-[#1e2126] pb-2">Adicionar Novo Spot</h3>
          
          <div className="space-y-4">
             <div>
               <label className="text-xs text-slate-400 block mb-1">Monstro (ID)</label>
               <input type="text" placeholder="Ex: 3 (Spider)" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-white" />
             </div>
             
             <div className="grid grid-cols-2 gap-2">
               <div>
                 <label className="text-xs text-slate-400 block mb-1">X Cord</label>
                 <input type="number" value={mousePos.x} readOnly className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-slate-500 font-mono" />
               </div>
               <div>
                 <label className="text-xs text-slate-400 block mb-1">Y Cord</label>
                 <input type="number" value={mousePos.y} readOnly className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-slate-500 font-mono" />
               </div>
             </div>

             <div>
               <label className="text-xs text-slate-400 block mb-1">Raio de Patrulha (Dir)</label>
               <input type="number" defaultValue={3} className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-white" />
             </div>

             <div>
               <label className="text-xs text-slate-400 block mb-1">Quantidade de Mobs</label>
               <input type="number" defaultValue={5} className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-white" />
             </div>

             <button className="w-full bg-red-900/50 hover:bg-red-600 text-white font-bold text-sm py-2 rounded transition-colors border border-red-500/30">
                + Adicionar ao Mapa
             </button>
          </div>
          
          <h3 className="font-bold text-white mt-8 mb-4 text-sm border-b border-[#1e2126] pb-2">Spots Atuais (Mapa {selectedMap})</h3>
          <div className="space-y-2">
             {spots.filter(s => s.map === selectedMap).map(spot => (
               <div key={spot.id} className="bg-[#0a0b0d] border border-[#1e2126] rounded p-2 flex justify-between items-center">
                 <div>
                   <p className="text-xs font-bold text-white">{spot.mob}</p>
                   <p className="text-[10px] text-slate-500 font-mono">X:{spot.x} Y:{spot.y} | Qtd:{spot.count}</p>
                 </div>
                 <button className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemEditor({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex justify-between items-center bg-[#111317] p-4 rounded-xl border border-[#1e2126]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Item.bmd / Item.txt Editor</h2>
            <p className="text-xs text-slate-400">Edite propriedades de items para o Client e Server.</p>
          </div>
        </div>
        <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-1.5 rounded text-sm transition-colors shadow-lg">
          Salvar Arquivos
        </button>
      </header>

      <div className="flex-1 grid grid-cols-4 gap-4">
        <div className="col-span-1 bg-[#111317] border border-[#1e2126] rounded-2xl flex flex-col p-2">
          <div className="p-2">
            <input type="text" placeholder="Buscar item..." className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-white" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             <div className="bg-[#1e2126] text-white p-2 rounded text-xs cursor-pointer font-bold border border-orange-500/50">0 0 - Kris</div>
             <div className="text-slate-400 hover:bg-[#1e2126] p-2 rounded text-xs cursor-pointer">0 1 - Short Sword</div>
             <div className="text-slate-400 hover:bg-[#1e2126] p-2 rounded text-xs cursor-pointer">0 2 - Rapier</div>
             <div className="text-slate-400 hover:bg-[#1e2126] p-2 rounded text-xs cursor-pointer">0 3 - Katana</div>
             <div className="text-slate-400 hover:bg-[#1e2126] p-2 rounded text-xs cursor-pointer">0 31 - Bone Blade</div>
             <div className="text-slate-400 hover:bg-[#1e2126] p-2 rounded text-xs cursor-pointer mt-4">12 15 - Jewel of Chaos</div>
             <div className="text-slate-400 hover:bg-[#1e2126] p-2 rounded text-xs cursor-pointer">13 14 - Loch's Feather</div>
          </div>
        </div>
        <div className="col-span-3 bg-[#111317] border border-[#1e2126] rounded-2xl p-6 overflow-y-auto">
          <div className="flex gap-6">
             <div className="w-24 h-24 bg-[#0a0b0d] border border-[#1e2126] rounded-xl flex flex-col justify-center items-center">
                 <Box size={32} className="text-blue-500 opacity-50 mb-2" />
                 <span className="text-[10px] text-slate-500 font-mono">icon.bmd</span>
             </div>
             <div className="flex-1">
                <input type="text" defaultValue="Kris" className="bg-transparent border-b border-[#2a2d33] focus:border-orange-500 outline-none text-2xl font-bold text-white w-full py-2 mb-4" />
                <div className="grid grid-cols-3 gap-6">
                   <div>
                     <label className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Index (Type, ID)</label>
                     <div className="flex gap-2">
                       <input type="number" defaultValue="0" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-1.5 text-sm text-white font-mono" />
                       <input type="number" defaultValue="0" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-1.5 text-sm text-white font-mono" />
                     </div>
                   </div>
                   <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Skill ID</label>
                      <input type="number" defaultValue="0" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-1.5 text-sm text-white font-mono" />
                   </div>
                   <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">Dimensão (X, Y)</label>
                      <div className="flex gap-2">
                        <input type="number" defaultValue="1" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-1.5 text-sm text-white font-mono" />
                        <input type="number" defaultValue="2" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-1.5 text-sm text-white font-mono" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <hr className="border-[#1e2126] my-6" />
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-orange-500 font-bold text-sm mb-3">Atributos Básicos</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <label className="text-xs text-slate-400">Durabilidade Base</label>
                   <input type="number" defaultValue="20" className="w-24 bg-[#0a0b0d] border border-[#1e2126] rounded px-2 py-1 text-xs text-white" />
                 </div>
                 <div className="flex justify-between items-center">
                   <label className="text-xs text-slate-400">Level Minimo Req</label>
                   <input type="number" defaultValue="0" className="w-24 bg-[#0a0b0d] border border-[#1e2126] rounded px-2 py-1 text-xs text-white" />
                 </div>
                 <div className="flex justify-between items-center">
                   <label className="text-xs text-slate-400">Dano Físico Mín-Máx</label>
                   <div className="flex gap-1 w-24">
                     <input type="number" defaultValue="6" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-2 py-1 text-xs text-white" />
                     <input type="number" defaultValue="11" className="w-full bg-[#0a0b0d] border border-[#1e2126] rounded px-2 py-1 text-xs text-white" />
                   </div>
                 </div>
                 <div className="flex justify-between items-center">
                   <label className="text-xs text-slate-400">Velocidade de Ataque</label>
                   <input type="number" defaultValue="50" className="w-24 bg-[#0a0b0d] border border-[#1e2126] rounded px-2 py-1 text-xs text-white" />
                 </div>
              </div>
            </div>

            <div>
              <h3 className="text-orange-500 font-bold text-sm mb-3">Classes Permitidas</h3>
              <div className="space-y-2">
                 <label className="flex items-center gap-2 cursor-pointer bg-[#0a0b0d] px-3 py-1.5 rounded border border-[#1e2126]">
                   <input type="checkbox" defaultChecked className="accent-orange-500" />
                   <span className="text-xs text-slate-300">Dark Knight (DK / BK / BM)</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer bg-[#0a0b0d] px-3 py-1.5 rounded border border-[#1e2126]">
                   <input type="checkbox" defaultChecked className="accent-orange-500" />
                   <span className="text-xs text-slate-300">Magic Gladiator (MG / DM)</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer bg-[#0a0b0d] px-3 py-1.5 rounded border border-[#1e2126] opacity-50">
                   <input type="checkbox" className="accent-orange-500" />
                   <span className="text-xs text-slate-300">Dark Wizard (DW / SM / GM)</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer bg-[#0a0b0d] px-3 py-1.5 rounded border border-[#1e2126] opacity-50">
                   <input type="checkbox" className="accent-orange-500" />
                   <span className="text-xs text-slate-300">Elf (FE / ME / HE)</span>
                 </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventBagEditor({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex justify-between items-center bg-[#111317] p-4 rounded-xl border border-[#1e2126]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Event Item Bag Editor</h2>
            <p className="text-xs text-slate-400">Configure Box of Kundun, Blood Castle, Chaos Castle drops.</p>
          </div>
        </div>
        <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-1.5 rounded text-sm transition-colors shadow-lg">
          Salvar IGC_Drop.xml / EventBag.txt
        </button>
      </header>

      <div className="grid grid-cols-4 gap-4 flex-1">
         <div className="col-span-1 bg-[#111317] border border-[#1e2126] rounded-2xl flex flex-col p-2 space-y-1 overflow-y-auto">
            <div className="bg-[#1e2126] text-white p-3 rounded text-xs cursor-pointer font-bold border-l-2 border-orange-500">Box of Kundun +1</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Box of Kundun +2</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Box of Kundun +3</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Box of Kundun +4</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Box of Kundun +5</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer mt-4">Chaos Castle 1</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Blood Castle 1 (Reward)</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Medal of Gold</div>
            <div className="text-slate-400 hover:bg-[#1e2126] p-3 rounded text-xs cursor-pointer">Heart of Love</div>
         </div>
         
         <div className="col-span-3 bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
            <div className="flex justify-between items-end mb-6">
               <div>
                  <h3 className="text-xl font-bold text-white mb-1">Box of Kundun +1.txt</h3>
                  <p className="text-sm text-slate-400 font-mono">Section: Drop Event Rate</p>
               </div>
               <button className="bg-[#1e2126] hover:bg-[#2a2d33] text-white border border-[#2a2d33] px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2">
                 + Adicionar Item ao Drop
               </button>
            </div>

            <div className="bg-[#050506] border border-[#1e2126] rounded-xl overflow-hidden">
               <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#1e2126] text-xs uppercase tracking-widest text-slate-400">
                     <tr>
                        <th className="px-4 py-3">Item Index</th>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Lvl Min</th>
                        <th className="px-4 py-3">Option</th>
                        <th className="px-4 py-3">Luck</th>
                        <th className="px-4 py-3">Skill</th>
                        <th className="px-4 py-3">Exc</th>
                        <th className="px-4 py-3 text-right">Ação</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2126] font-mono text-xs">
                     <tr className="hover:bg-[#111317]">
                        <td className="px-4 py-3 text-orange-400">0 0</td>
                        <td className="px-4 py-3 text-white">Kris</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3 text-green-400">0</td>
                        <td className="px-4 py-3 text-right"><button className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button></td>
                     </tr>
                     <tr className="hover:bg-[#111317]">
                        <td className="px-4 py-3 text-orange-400">0 1</td>
                        <td className="px-4 py-3 text-white">Short Sword</td>
                        <td className="px-4 py-3">2</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3 text-green-400">1</td>
                        <td className="px-4 py-3 text-right"><button className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button></td>
                     </tr>
                     <tr className="hover:bg-[#111317]">
                        <td className="px-4 py-3 text-orange-400">7 0</td>
                        <td className="px-4 py-3 text-white">Bronze Helm</td>
                        <td className="px-4 py-3">3</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3">1</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3 text-green-400">0</td>
                        <td className="px-4 py-3 text-right"><button className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button></td>
                     </tr>
                     <tr className="hover:bg-[#111317]">
                        <td className="px-4 py-3 text-orange-400">12 11</td>
                        <td className="px-4 py-3 text-purple-400 font-bold">Bless</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3 text-green-400">0</td>
                        <td className="px-4 py-3 text-right"><button className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button></td>
                     </tr>
                  </tbody>
               </table>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <label className="text-xs text-slate-400">Rate Config: % Chance de Drop Excellent dessa Box</label>
              <input type="number" defaultValue={20} className="w-32 bg-[#0a0b0d] border border-[#1e2126] rounded px-3 py-2 text-sm text-white" />
            </div>
         </div>
      </div>
    </div>
  );
}

function ConfigView() {
  const tabs = [
    { label: 'commonserver.cfg', file: 'GameServer/Data/commonserver.cfg' },
    { label: 'Message.txt', file: 'Data/Local/Message.txt' },
    { label: 'Events.ini', file: 'GameServer/Data/Events.ini' },
    { label: 'IGC_Common.ini', file: 'GameServer/IGC_Common.ini' },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     fetch(`/api/files/read?filepath=${encodeURIComponent(activeTab.file)}`)
       .then(r => r.json())
       .then(d => setCode(d.content || ""))
       .catch(e => console.error(e));
  }, [activeTab]);

  const saveFile = () => {
    setIsSaving(true);
    fetch('/api/files/write', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ filepath: activeTab.file, content: code })
    }).then(() => {
       setIsSaving(false);
       alert("Arquivo " + activeTab.label + " salvo na máquina!");
    }).catch(() => setIsSaving(false));
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Editor de Configurações (Arquivos Reais)</h2>
        <p className="text-slate-400 mt-1">Edite os arquivos do emulador diretamente na MUSERVER_PATH da sua máquina.</p>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab, i) => (
           <button 
             key={i} 
             onClick={() => setActiveTab(tab)}
             className={`${activeTab.file === tab.file ? 'bg-[#1e2126] text-white border-orange-500/50' : 'bg-[#1e2126]/50 text-slate-400 border-[#1e2126] hover:text-white'} border px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors`}
           >
             {tab.label}
           </button>
        ))}
      </div>

      <div className="flex-1 bg-[#050506] border border-[#1e2126] rounded-2xl overflow-hidden relative">
        <textarea 
          aria-label="Code Editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-transparent text-slate-300 font-mono text-xs p-6 focus:outline-none resize-none leading-relaxed"
          spellCheck="false"
        />
        <button onClick={saveFile} disabled={isSaving} className="absolute bottom-6 right-6 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 border-none rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50">
           <HardDrive size={16} /> {isSaving ? "SALVANDO..." : "SALVAR ARQUIVO"}
        </button>
      </div>
    </div>
  );
}

function DatabaseView() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Banco de Dados (SQL)</h2>
        <p className="text-slate-400 mt-1">Execute Queries, gerencie contas e limpe logs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Ações de Manutenção</h3>
          <div className="space-y-3">
             <button className="w-full bg-[#1e2126] hover:bg-[#2a2d33] text-left text-sm text-slate-300 p-4 rounded-lg transition-colors flex justify-between items-center group">
                MDB: Restaurar MuOnline.bak <Download size={16} className="text-slate-500 group-hover:text-orange-400" />
             </button>
             <button className="w-full bg-[#1e2126] hover:bg-[#2a2d33] text-left text-sm text-slate-300 p-4 rounded-lg transition-colors flex justify-between items-center group">
                Limpar Logs (Shrink Database) <TerminalSquare size={16} className="text-slate-500 group-hover:text-orange-400" />
             </button>
             <button className="w-full bg-red-900/20 hover:bg-red-900/40 text-left text-sm text-red-400 p-4 rounded-lg border border-red-900/30 transition-colors flex justify-between items-center group">
                Resetar Personagens (Geral) <Shield size={16} className="text-red-500/50 group-hover:text-red-500" />
             </button>
          </div>
        </div>

        <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Query Executor</h3>
          <textarea 
            aria-label="SQL Query"
            className="flex-1 w-full bg-[#0a0b0d] border border-[#1e2126] rounded-lg p-4 text-orange-400 font-mono text-xs focus:outline-none focus:border-orange-500"
            placeholder="UPDATE Character SET cLevel = 400 WHERE Name = 'Admin'"
            defaultValue="UPDATE Character SET cLevel = 400 WHERE Name = 'Admin'"
          />
          <button className="mt-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">
            <Play size={16} /> EXECUTAR QUERY
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayersView() {
  const [players, setPlayers] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any>({ status: 'disconnected', error: null });
  const [dbSettings, setDbSettings] = useState({ server: 'localhost', user: 'sa', password: '', database: 'MuOnline' });
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDbConfig = () => {
     fetch('/api/db-config')
       .then(r => r.json())
       .then(d => {
          setDbStatus({ status: d.status, error: d.error });
          setDbSettings(prev => ({ ...prev, server: d.server || prev.server, user: d.user || prev.user, database: d.database || prev.database }));
          if (d.status === 'connected') fetchPlayers();
          else setIsLoading(false);
       })
       .catch(e => {
          console.error(e);
          setIsLoading(false);
       });
  };

  const fetchPlayers = () => {
    setIsLoading(true);
    fetch('/api/players')
      .then(r => r.json())
      .then(d => {
         setIsLoading(false);
         if (d.players) setPlayers(d.players);
         else if (d.error) setDbStatus({ status: 'disconnected', error: d.error });
      })
      .catch(e => {
         setIsLoading(false);
         console.error(e);
      });
  };

  useEffect(() => {
     fetchDbConfig();
  }, []);

  const saveDbConfig = () => {
     setIsLoading(true);
     fetch('/api/db-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbSettings)
     }).then(r => r.json()).then(d => {
        setIsLoading(false);
        setDbStatus({ status: d.success ? 'connected' : 'disconnected', error: d.error });
        if (d.success) {
           setShowDbConfig(false);
           fetchPlayers();
        }
     });
  };

  const getClassName = (code: number) => {
      const classes: Record<number, string> = {
         0: 'Dark Wizard', 1: 'Soul Master', 2: 'Grand Master',
         16: 'Dark Knight', 17: 'Blade Knight', 18: 'Blade Master',
         32: 'Elf', 33: 'Muse Elf', 34: 'High Elf',
         48: 'Magic Gladiator', 50: 'Duel Master',
         64: 'Dark Lord', 66: 'Lord Emperor',
         80: 'Summoner', 81: 'Bloody Summoner', 82: 'Dimension Master'
      };
      return classes[code] || `Class ${code}`;
  };

  const getMapName = (code: number) => {
      const maps: Record<number, string> = {
         0: 'Lorencia', 1: 'Dungeon', 2: 'Devias', 3: 'Noria', 4: 'LostTower',
         6: 'Arena', 7: 'Atlans', 8: 'Tarkan', 9: 'Devil Square', 10: 'Icarus'
      };
      return maps[code] || `Map ${code}`;
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="mb-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Contas & Personagens <span className={`text-[10px] px-2 py-1 rounded tracking-widest uppercase ${dbStatus.status === 'connected' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{dbStatus.status === 'connected' ? 'DB Conectado' : 'Sem DB'}</span>
          </h2>
          <p className="text-slate-400 mt-1 max-w-3xl">Gerencie jogadores reais usando a conexão ODBC/MSSQL.</p>
        </div>
        <button onClick={() => setShowDbConfig(!showDbConfig)} className="bg-[#111317] hover:bg-[#1e2126] border border-[#1e2126] text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-lg">
           Configurar DB
        </button>
      </header>

      {showDbConfig && (
        <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6 flex gap-4">
           <input type="text" placeholder="Server (ex: localhost)" value={dbSettings.server} onChange={e => setDbSettings({...dbSettings, server: e.target.value})} className="flex-1 bg-[#050506] border border-[#1e2126] rounded px-3 text-sm text-white focus:border-orange-500" />
           <input type="text" placeholder="Usuário (sa)" value={dbSettings.user} onChange={e => setDbSettings({...dbSettings, user: e.target.value})} className="flex-1 bg-[#050506] border border-[#1e2126] rounded px-3 text-sm text-white focus:border-orange-500" />
           <input type="password" placeholder="Senha" value={dbSettings.password} onChange={e => setDbSettings({...dbSettings, password: e.target.value})} className="flex-1 bg-[#050506] border border-[#1e2126] rounded px-3 text-sm text-white focus:border-orange-500" />
           <input type="text" placeholder="Database (MuOnline)" value={dbSettings.database} onChange={e => setDbSettings({...dbSettings, database: e.target.value})} className="flex-1 bg-[#050506] border border-[#1e2126] rounded px-3 text-sm text-white focus:border-orange-500" />
           <button onClick={saveDbConfig} disabled={isLoading} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50">Conectar</button>
        </div>
      )}

      {dbStatus.error && (
         <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-mono">
            Erro de DB: {dbStatus.error}
         </div>
      )}

      <div className="flex gap-4">
        <input type="text" placeholder="Buscar personagem ou conta (Ex: Admin)..." className="flex-1 bg-[#111317] border border-[#1e2126] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" />
        <button onClick={fetchPlayers} disabled={isLoading} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50">Refresh DB</button>
      </div>

      <div className="bg-[#111317] border border-[#1e2126] rounded-2xl flex-1 flex flex-col relative overflow-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1e2126] text-xs uppercase tracking-widest text-slate-400 sticky top-0">
            <tr>
              <th className="px-4 py-3">Personagem</th>
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Level / Resets</th>
              <th className="px-4 py-3">Map / Pos</th>
              <th className="px-4 py-3">Conta / CtlCode</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2126]">
            {isLoading ? (
               <tr><td colSpan={6} className="text-center py-8 text-slate-500">Carregando dados do banco...</td></tr>
            ) : players.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-8 text-slate-500">Nenhum personagem encontrado no banco de dados.</td></tr>
            ) : players.map((p, i) => (
              <tr key={i} className="hover:bg-[#1e2126]/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-bold text-white flex items-center gap-2">
                    {p.Name} 
                    {p.CtlCode > 0 && <span className="bg-red-500/20 text-red-500 text-[9px] px-1 rounded uppercase border border-red-500/30">GM</span>}
                  </div>
                </td>
                <td className="px-4 py-4">{getClassName(p.Class)}</td>
                <td className="px-4 py-4 text-orange-400 font-mono">
                  {p.cLevel} <span className="text-slate-500">/</span> {p.ResetCount}
                </td>
                <td className="px-4 py-4 text-xs font-mono">{getMapName(p.MapNumber)} ({p.MapPosX}, {p.MapPosY})</td>
                <td className="px-4 py-4 text-xs font-mono text-slate-400">{p.AccountID} <span className="text-slate-600">[{p.CtlCode}]</span></td>
                <td className="px-4 py-4 text-right flex justify-end gap-2">
                  <button className="bg-[#0a0b0d] hover:bg-orange-500/20 text-orange-400 border border-[#2a2d33] hover:border-orange-500/50 p-1.5 rounded transition-colors" title="Visualizar Inventário">
                    <Box size={16} />
                  </button>
                  <button className="bg-[#0a0b0d] hover:bg-red-500/20 text-red-500 border border-[#2a2d33] hover:border-red-500/50 p-1.5 rounded transition-colors" title="Banir / Desconectar">
                    <Shield size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Placeholder for Character Editor Slide-over */}
        <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center opacity-0 pointer-events-none transition-opacity">
           {/* Modal goes here when a player is clicked */}
        </div>
      </div>
    </div>
  );
}

function SecurityView() {
  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Firewall & AntiHack <span className="text-red-500 border border-red-500/30 bg-red-500/10 px-2 py-1 rounded text-[10px] uppercase tracking-widest">Aviso de Segurança</span>
        </h2>
        <p className="text-slate-400 mt-1">Configure o LiveGuard/MHP e aplique proteções contra DDoS via Iptables ou Cloudflare.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* LiveGuard Bridge */}
         <div className="bg-[#111317] border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase text-sm tracking-widest">LiveGuard / MHP Server</h3>
                <p className="text-xs text-slate-500">Anti-Hack do Cliente (Integrado)</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="bg-[#0a0b0d] border border-blue-500/20 rounded-xl p-4 font-mono text-xs text-blue-300 h-40 overflow-y-auto">
                 <p>[LiveGuard] Server started on port 55999</p>
                 <p>[LiveGuard] Wait connection...</p>
                 <p className="text-slate-500">--- Aguardando clientes ---</p>
              </div>
              
              <div className="flex justify-between items-center bg-[#1e2126] p-3 rounded-lg border border-[#2a2d33]">
                 <span className="text-sm font-bold text-slate-300">Porta AntiHack Socket:</span>
                 <input type="text" defaultValue="55999" className="bg-[#0a0b0d] border border-[#2a2d33] w-20 text-center text-blue-400 font-mono rounded px-2 py-1 outline-none" />
              </div>

              <div className="space-y-2">
                 <label className="flex items-center gap-2 cursor-pointer bg-[#0a0b0d] px-3 py-2 rounded border border-[#1e2126]">
                   <input type="checkbox" defaultChecked className="accent-blue-500" />
                   <span className="text-xs text-slate-300">Bloquear SpeedHack (Auto Disconnect)</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer bg-[#0a0b0d] px-3 py-2 rounded border border-[#1e2126]">
                   <input type="checkbox" defaultChecked className="accent-blue-500" />
                   <span className="text-xs text-slate-300">Verificar CRC/Checksum do Main.exe</span>
                 </label>
              </div>
            </div>
            
            <button className="mt-6 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 font-bold w-full py-2 rounded transition-colors text-sm">
               Reiniciar MHP Server
            </button>
         </div>

         {/* IP Banning */}
         <div className="bg-[#111317] border border-red-500/20 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                <Target size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase text-sm tracking-widest">Painel de Banimento</h3>
                <p className="text-xs text-slate-500">Bloqueio de IP e HWID (Hardware ID)</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="192.168... ou HWID" className="basis-2/3 bg-[#0a0b0d] border border-[#1e2126] rounded px-3 text-sm text-white focus:outline-none focus:border-red-500" />
              <button className="basis-1/3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">BLOQUEAR</button>
            </div>

            <div className="bg-[#0a0b0d] border border-[#1e2126] rounded-xl flex-1 p-2">
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-2 pt-2">Lista de Bloqueados</div>
               <div className="space-y-1">
                  <div className="flex justify-between items-center bg-[#1e2126] p-2 rounded pb-1">
                     <span className="font-mono text-xs text-red-400">189.120.44.12</span>
                     <button className="text-slate-500 hover:text-white"><Trash2 size={14}/></button>
                  </div>
                  <div className="flex justify-between items-center bg-[#1e2126] p-2 rounded pb-1">
                     <span className="font-mono text-xs text-purple-400" title="HWID">A3F4-99B2-C11X</span>
                     <button className="text-slate-500 hover:text-white"><Trash2 size={14}/></button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function EventsView() {
  return (
    <div className="space-y-6">
      <header className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             Horários & Eventos <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-1 rounded tracking-widest uppercase">EventManagement.dat</span>
           </h2>
           <p className="text-slate-400 mt-1 max-w-3xl">Programe Invasion, Blood Castle, Chaos Castle e outros eventos do GameServer simultaneamente.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-purple-900/20">Salvar Eventos</button>
      </header>
      
      <div className="bg-[#111317] border border-[#1e2126] rounded-2xl overflow-hidden p-6 relative">
         <div className="absolute top-0 right-0 p-4">
           <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
             <Clock size={12}/> Horário do Servidor: <span className="text-white font-mono">14:05:00</span>
           </div>
         </div>

         <div className="space-y-8 mt-6">
            <EventTimeline title="Blood Castle" color="text-red-500" border="border-red-500" bg="bg-red-500" times={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']} />
            <EventTimeline title="Devil Square" color="text-yellow-500" border="border-yellow-500" bg="bg-yellow-500" times={['02:00', '06:00', '10:00', '14:00', '18:00', '22:00']} />
            <EventTimeline title="Chaos Castle" color="text-blue-500" border="border-blue-500" bg="bg-blue-500" times={['01:00', '05:00', '09:00', '13:00', '17:00', '21:00']} />
            <EventTimeline title="Golden Invasion" color="text-yellow-300" border="border-yellow-300" bg="bg-yellow-300" times={['19:00', '23:00']} />
         </div>
      </div>
    </div>
  );
}

function EventTimeline({ title, color, border, bg, times }: { title: string, color: string, border: string, bg: string, times: string[] }) {
  return (
     <div>
        <h3 className={`font-bold ${color} mb-2 flex items-center gap-2 text-sm`}>
          <div className={`w-2 h-2 rounded-full ${bg} shadow-[0_0_8px_currentColor]`}></div> {title}
        </h3>
        <div className="relative pt-4 pb-2">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1e2126] -translate-y-1/2"></div>
           <div className="flex justify-between relative z-10 px-2">
              {['00h', '04h', '08h', '12h', '16h', '20h', '23h'].map((t, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <div className="w-1 h-3 bg-[#2a2d33] mb-1"></div>
                    <span className="text-[10px] text-slate-500 font-mono">{t}</span>
                 </div>
              ))}
              
              {/* Event Markers Overlay */}
              <div className="absolute inset-0 flex">
                 {times.map((time, i) => {
                    const hours = parseInt(time.split(':')[0]);
                    const percent = (hours / 24) * 100;
                    return (
                       <div key={i} className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 group cursor-pointer" style={{ left: `${percent}%` }}>
                          <div className={`w-3 h-3 ${bg} rounded border-2 border-black rotate-45 transform group-hover:scale-150 transition-transform`}></div>
                          <div className={`absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#0a0b0d] border ${border} text-white text-[10px] px-1.5 py-0.5 rounded font-mono transition-opacity`}>
                            {time}
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
     </div>
  );
}

function CastleSiegeView() {
  return (
    <div className="space-y-6">
      <header className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             Gerenciador Castle Siege <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded tracking-widest uppercase">MuCastleData.dat</span>
           </h2>
           <p className="text-slate-400 mt-1 max-w-3xl">Controle o estado atual do castelo, modifique a guild dona e resete o evento.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-red-900/20">Forçar Mudança de Estado</button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
          <h3 className="font-bold text-white text-sm mb-4">Estado e Ciclo Atual</h3>
          <div className="flex flex-col gap-4">
             <div className="bg-[#050506] border border-[#1e2126] p-4 rounded-xl flex justify-between items-center">
                 <div>
                   <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Período Atual</p>
                   <p className="text-xl font-bold text-orange-500 mt-1">1 - Registro de Guilds</p>
                 </div>
                 <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400"><Flag size={20} /></div>
             </div>
             <div className="bg-[#050506] border border-[#1e2126] p-4 rounded-xl flex justify-between items-center">
                 <div>
                   <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Guild Dominante</p>
                   <p className="text-lg font-bold text-white mt-1">Illusion</p>
                 </div>
                 <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400"><Shield size={20} /></div>
             </div>
             
             <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Linha do Tempo (Dia da Semana)</p>
                <div className="space-y-2">
                   {['Segunda a Quarta: Registro de Guild', 'Quinta: Registro Start of Lord', 'Sexta: Anúncio de Guilds', 'Sábado: Preparação', 'Domingo: COMBATE!'].map((label, i) => (
                      <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${i === 0 ? 'bg-orange-500/10 border-orange-500/30 text-orange-300 font-bold' : 'bg-[#050506] border-[#1e2126] text-slate-400'} flex items-center`}>
                          <span className={`w-2 h-2 rounded-full mr-3 ${i === 0 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-slate-600'}`}></span>
                          {label}
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
        
        <div className="bg-[#111317] border border-[#1e2126] rounded-2xl p-6">
          <h3 className="font-bold text-white text-sm mb-4">Opções Avançadas</h3>
          <div className="space-y-3">
             <button className="w-full text-left bg-[#050506] hover:bg-[#1e2126] border border-[#1e2126] p-4 rounded-xl transition-colors group">
                 <div className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">Setar Winner / Owner via DB</div>
                 <div className="text-xs text-slate-500">Sobrescreve o dono do castelo sem precisar lutar.</div>
             </button>
             <button className="w-full text-left bg-[#050506] hover:bg-[#1e2126] border border-[#1e2126] p-4 rounded-xl transition-colors group">
                 <div className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">Mudar Taxa de Imposto (Tax)</div>
                 <div className="text-xs text-slate-500">Atualmente cobrando 3% nos NPCs do servidor.</div>
             </button>
             <button className="w-full text-left bg-[#050506] hover:bg-orange-500/10 border border-[#1e2126] hover:border-orange-500/30 p-4 rounded-xl transition-colors group">
                 <div className="text-sm font-bold text-orange-400 group-hover:text-orange-300 mb-1">Iniciar Mini-Siege (Teste)</div>
                 <div className="text-xs text-orange-500/50">Força o início do combate ignorando os dias da semana.</div>
             </button>
             <button className="w-full text-left bg-[#050506] hover:bg-red-500/10 border border-[#1e2126] hover:border-red-500/30 p-4 rounded-xl transition-colors group">
                 <div className="text-sm font-bold text-red-500 group-hover:text-red-400 mb-1">Zerar Guilds (Reset CS)</div>
                 <div className="text-xs text-red-500/50">Limpa MU_CASTLE_DATA e deleta todos os registros.</div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VipSystemView() {
  return (
    <div className="space-y-6">
      <header className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             Gerenciador VIP <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-1 rounded tracking-widest uppercase">Sistema de Bonificação</span>
           </h2>
           <p className="text-slate-400 mt-1 max-w-3xl">Configure os bônus de EXP, Drop e exclusividade de comandos para usuários VIP.</p>
        </div>
        <button className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-yellow-900/20 text-black">Adicionar Pacote</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { level: 'VIP Free (0)', exp: '0%', drop: '0%', color: 'slate' },
            { level: 'VIP Silver (1)', exp: '25%', drop: '10%', color: 'white' },
            { level: 'VIP Gold (2)', exp: '50%', drop: '20%', color: 'yellow' }
         ].map((vip, i) => (
            <div key={i} className={`bg-[#111317] border border-${vip.color}-500/30 rounded-2xl p-6 relative overflow-hidden group`}>
               <div className={`absolute -right-10 -top-10 text-${vip.color}-500/5 rotate-12 group-hover:scale-125 transition-transform`}>
                 <Crown size={150} />
               </div>
               <div className="relative z-10">
                  <h3 className={`text-xl font-bold text-${vip.color}-400 mb-4 flex items-center gap-2`}>
                    <Crown size={20} /> {vip.level}
                  </h3>
                  <div className="space-y-4">
                     <div className="bg-[#050506] p-3 rounded-lg border border-[#1e2126]">
                        <span className="text-xs text-slate-500 uppercase block mb-1">Bônus de EXP</span>
                        <span className="font-bold text-white">+{vip.exp}</span>
                     </div>
                     <div className="bg-[#050506] p-3 rounded-lg border border-[#1e2126]">
                        <span className="text-xs text-slate-500 uppercase block mb-1">Bônus de Drop</span>
                        <span className="font-bold text-white">+{vip.drop}</span>
                     </div>
                     <div className="bg-[#050506] p-3 rounded-lg border border-[#1e2126]">
                        <span className="text-xs text-slate-500 uppercase block mb-1">Comandos VIP</span>
                        <span className="text-xs text-slate-300 leading-relaxed font-mono">
                          {i === 0 ? '- Nenhum' : i === 1 ? '/reset /pkclear' : '/reset /pkclear /zen /dc'}
                        </span>
                     </div>
                  </div>
                  <button className={`w-full mt-4 border border-${vip.color}-500/50 text-${vip.color}-400 hover:bg-${vip.color}-500/10 py-2 rounded font-bold text-sm transition-colors`}>Editar Vantagens</button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}

function CashShopView() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="mb-0">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Cash Shop / XShop <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded tracking-widest uppercase">In-Game Store</span>
        </h2>
        <p className="text-slate-400 mt-1 max-w-3xl">Adicione, edite ou remova itens vendidos por WCoinC, WCoinP ou Goblin Points dentro do jogo teclando 'X'.</p>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 bg-[#111317] border border-[#1e2126] rounded-xl flex overflow-hidden">
           {['Todas', 'Pets', 'Buffs & Scrolls', 'Tickets (BC/DS)', 'Premium'].map((cat, i) => (
             <button key={i} className={`flex-1 py-3 text-sm font-bold border-r border-[#1e2126] last:border-0 ${i === 2 ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500' : 'text-slate-400 hover:bg-[#1e2126]'}`}>
               {cat}
             </button>
           ))}
        </div>
        <button className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg flex items-center gap-2">
           <ShoppingCart size={18} /> Adicionar Item
        </button>
      </div>

      <div className="bg-[#111317] border border-[#1e2126] rounded-2xl flex-1 p-6">
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: 'Seal of Healing', type: 'Buff', price: '500 WCoinC', img: 'box' },
              { name: 'Seal of Ascension', type: 'Buff', price: '750 WCoinC', img: 'box' },
              { name: 'Panda Pet (7 Days)', type: 'Pet', price: '1200 WCoinC', img: 'gift' },
              { name: 'Panda Ring (7 Days)', type: 'Premium', price: '800 WCoinC', img: 'gift' },
              { name: 'Talisman of Chaos', type: 'Misc', price: '200 WCoinC', img: 'box' },
              { name: 'Horn of Fenrir', type: 'Pet', price: '5000 WCoinC', img: 'gift' }
            ].map((item, i) => (
               <div key={i} className="bg-[#050506] border border-[#1e2126] hover:border-green-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-xs bg-[#1e2126] text-slate-400 px-1.5 py-0.5 rounded font-mono group-hover:bg-green-500 group-hover:text-black transition-colors">{item.type}</div>
                  
                  {item.img === 'box' ? <Box size={40} className="text-slate-600 group-hover:text-green-400 transition-colors my-4" /> : <Gift size={40} className="text-orange-900 group-hover:text-green-400 transition-colors my-4" />}
                  
                  <h4 className="font-bold text-slate-300 text-sm mb-1">{item.name}</h4>
                  <p className="text-xs font-bold text-yellow-500">{item.price}</p>
                  
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 flex transition-transform">
                     <button className="flex-1 bg-green-600 text-white text-xs font-bold py-2">Editar</button>
                     <button className="bg-red-600 text-white text-xs font-bold py-2 px-3"><Trash2 size={12} /></button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
