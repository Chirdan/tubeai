
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Terminal, Bug } from 'lucide-react';
import { analyzeError, DebugReport } from '../services/debuggerService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  debugReport: DebugReport | null;
  isAnalyzing: boolean;
}

class DebugErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    debugReport: null,
    isAnalyzing: false
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleAnalyze = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    this.setState({ isAnalyzing: true });
    try {
      const report = await analyzeError(error, errorInfo?.componentStack || undefined);
      this.setState({ debugReport: report, isAnalyzing: false });
    } catch (e) {
      console.error("Analysis failed:", e);
      this.setState({ isAnalyzing: false });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      debugReport: null,
      isAnalyzing: false
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center p-8 font-inter">
          <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-widest">System Failure</h1>
                <p className="text-zinc-500 text-sm font-medium">An unexpected error has occurred in the Studio.</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Terminal className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Error Log</span>
                </div>
                <button 
                  onClick={this.handleReset}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Restart Studio
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-black/50 rounded-xl border border-zinc-800/50 font-mono text-xs text-red-400 overflow-x-auto">
                  {this.state.error?.toString()}
                </div>
                
                {!this.state.debugReport ? (
                  <button
                    onClick={this.handleAnalyze}
                    disabled={this.state.isAnalyzing}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {this.state.isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Bug className="w-4 h-4" />
                        Debug with AI
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Analysis</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">{this.state.debugReport.analysis}</p>
                    </div>
                    <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-green-400">Suggested Fix</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">{this.state.debugReport.suggestion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">TubeAI Studio Debugger v1.0</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;
