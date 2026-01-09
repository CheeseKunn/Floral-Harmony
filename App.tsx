import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultDisplay from './components/ResultDisplay';
import PetalBackground from './components/PetalBackground';
import { UserInput, FloralAnalysisResponse, LoadingState } from './types';
import { analyzeFloralRequest } from './services/geminiService';
import { Loader2, AlertCircle, Mail, ArrowLeft, Copy, Check } from 'lucide-react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

type ViewState = 'HOME' | 'CONTACT';

const ContactView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useSettings();
  const [copied, setCopied] = useState(false);
  const email = "AaronYouthSuki@outlook.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 border border-stone-100 dark:border-stone-800 text-center animate-fadeIn relative z-10">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-rose-500" />
      </div>
      
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-6">
        {t.contactUs}
      </h2>

      <div className="p-6 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 mb-10 relative group">
        <p className="text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-widest mb-3">
          {t.emailUs}
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <a 
            href={`mailto:${email}`} 
            className="text-xl md:text-2xl text-rose-600 dark:text-rose-400 font-serif font-medium hover:text-rose-700 dark:hover:text-rose-300 transition-colors break-all"
          >
            {email}
          </a>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-rose-500 hover:border-rose-300 transition-all shadow-sm"
            title={t.copyEmail}
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {copied && (
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-emerald-600 font-medium animate-fadeIn">
            {t.emailCopied}
          </span>
        )}
      </div>

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold hover:bg-stone-700 dark:hover:bg-stone-300 transition-all transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backHome}
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<FloralAnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<UserInput | null>(null);
  const { t, language } = useSettings();

  const handleSubmit = async (input: UserInput) => {
    setLastInput(input);
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

  const handleRegenerate = () => {
    if (lastInput) {
      handleSubmit(lastInput);
    }
  };

  const handleReset = () => {
    setStatus(LoadingState.IDLE);
    setResult(null);
    setErrorMsg(null);
    setLastInput(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContact = () => {
    setView('CONTACT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setView('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 transition-colors duration-300 flex flex-col relative overflow-x-hidden">
      <PetalBackground />
      <Header />

      <main className="container mx-auto px-4 flex-grow z-10 relative">
        
        {view === 'CONTACT' ? (
          <ContactView onBack={navigateToHome} />
        ) : (
          <>
            {status !== LoadingState.SUCCESS && (
              <div className={`mt-8 transition-opacity duration-500 ${status === LoadingState.LOADING ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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
              <div className="mt-2">
                <ResultDisplay 
                  data={result} 
                  onReset={handleReset} 
                  onRegenerate={handleRegenerate}
                />
              </div>
            )}
          </>
        )}

      </main>

      <footer className="mt-20 py-8 text-center text-stone-400 dark:text-stone-600 text-sm flex flex-col items-center gap-3 z-10 relative">
        {view !== 'CONTACT' && (
          <button 
            onClick={navigateToContact}
            className="flex items-center gap-1.5 text-stone-500 hover:text-rose-500 dark:text-stone-500 dark:hover:text-rose-400 transition-colors font-medium text-xs uppercase tracking-wide"
          >
            <Mail className="w-3.5 h-3.5" />
            {t.contactUs}
          </button>
        )}
        
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