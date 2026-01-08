import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultDisplay from './components/ResultDisplay';
import { UserInput, FloralAnalysisResponse, LoadingState } from './types';
import { analyzeFloralRequest } from './services/geminiService';
import { Loader2, AlertCircle } from 'lucide-react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

const AppContent: React.FC = () => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<FloralAnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t, language } = useSettings();

  const handleSubmit = async (input: UserInput) => {
    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    setResult(null);

    try {
      // Pass the current language to the service
      const data = await analyzeFloralRequest(input.text, input.image, language);
      setResult(data);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMsg(t.errorGeneric);
      setStatus(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(LoadingState.IDLE);
    setResult(null);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 transition-colors duration-300">
      <Header />

      <main className="container mx-auto px-4">
        
        {status !== LoadingState.SUCCESS && (
          <div className={`transition-opacity duration-500 ${status === LoadingState.LOADING ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <InputSection onSubmit={handleSubmit} isLoading={status === LoadingState.LOADING} />
          </div>
        )}

        {/* Loading Indicator */}
        {status === LoadingState.LOADING && (
          <div className="flex flex-col items-center justify-center mt-12 animate-pulse">
            <Loader2 className="w-12 h-12 text-rose-400 animate-spin mb-4" />
            <p className="text-stone-500 dark:text-stone-400 font-serif text-lg">{t.designingArrangement}</p>
          </div>
        )}

        {/* Error State */}
        {status === LoadingState.ERROR && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Results */}
        {status === LoadingState.SUCCESS && result && (
          <div className="mt-8">
            <button 
              onClick={handleReset}
              className="mx-auto block mb-8 px-6 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-sm font-medium shadow-sm"
            >
              {t.startNewDesign}
            </button>
            <ResultDisplay data={result} />
          </div>
        )}

      </main>

      <footer className="mt-20 py-8 text-center text-stone-400 dark:text-stone-600 text-sm">
        <p>&copy; {new Date().getFullYear()} {t.footer}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;