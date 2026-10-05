import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React render tree:', error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCacheAndReload = () => {
    try {
      localStorage.removeItem('cv_builder_active_cv');
    } catch (_) {}
    window.location.reload();
  };

  render() {
    const currentState = (this as any).state as State;
    const currentProps = (this as any).props as Props;

    if (currentState?.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold mb-2">Une interruption temporaire est survenue</h1>
            <p className="text-sm text-slate-400 mb-6">
              L'application a rencontré une erreur d'affichage inattendue. Vous pouvez la recharger immédiatement.
            </p>

            {currentState.error && (
              <div className="text-left text-xs bg-slate-950 p-3 rounded-lg text-red-300 font-mono mb-6 overflow-x-auto max-h-32 border border-red-900/40">
                {currentState.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Recharger la page
              </button>
              <button
                type="button"
                onClick={this.handleResetCacheAndReload}
                className="w-full text-xs text-slate-400 hover:text-white py-1.5 transition-colors"
              >
                Réinitialiser le brouillon local et recharger
              </button>
            </div>
          </div>
        </div>
      );
    }

    return currentProps?.children || null;
  }
}
