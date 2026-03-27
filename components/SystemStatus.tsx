
import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

const SystemStatus: React.FC = () => {
  // These are injected by Vite define block
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.API_KEY);
  const hasHF = !!process.env.HUGGINGFACE_API_KEY;
  const hasMuapi = !!process.env.MUAPI_API_KEY;

  const allSystemsGo = hasGemini;

  return (
    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AI Engine Status</span>
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${allSystemsGo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
      </div>

      <div className="space-y-1.5">
        <StatusItem label="Gemini AI" active={hasGemini} />
        <StatusItem label="Hugging Face" active={hasHF} />
        <StatusItem label="Muapi MJ" active={hasMuapi} />
      </div>

      {!allSystemsGo && (
        <div className="pt-2 border-t border-zinc-800/50">
          <p className="text-[8px] text-red-400 font-bold leading-tight">
            CRITICAL: Gemini API Key missing. Check environment variables.
          </p>
        </div>
      )}
    </div>
  );
};

const StatusItem: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between">
    <span className="text-[9px] font-bold text-zinc-400">{label}</span>
    {active ? (
      <ShieldCheck className="w-2.5 h-2.5 text-green-500/50" />
    ) : (
      <ShieldAlert className="w-2.5 h-2.5 text-zinc-700" />
    )}
  </div>
);

export default SystemStatus;
