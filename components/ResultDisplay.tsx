import React, { useState, useEffect } from 'react';
import { FloralAnalysisResponse, Suggestion } from '../types';
import { Check, Palette, Sparkles, Leaf, Loader2, Image as ImageIcon, Heart, Quote, X, Maximize2 } from 'lucide-react';
import { generateFloralImage } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';

interface ResultDisplayProps {
  data: FloralAnalysisResponse;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
  onZoom: (url: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, index, onZoom }) => {
  const { t } = useSettings();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      setLoadingImage(true);
      try {
        const url = await generateFloralImage(suggestion);
        if (isMounted && url) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Failed to load image for suggestion", index, error);
      } finally {
        if (isMounted) {
          setLoadingImage(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [suggestion, index]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-lg shadow-stone-200/50 dark:shadow-stone-950/50 flex flex-col h-full transform transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-stone-950/80">
      {/* Visual Header */}
      <div 
        className={`h-48 w-full bg-stone-100 dark:bg-stone-800 relative overflow-hidden group ${imageUrl ? 'cursor-zoom-in' : ''}`}
        onClick={() => imageUrl && onZoom(imageUrl)}
      >
         {loadingImage ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
             <Loader2 className="w-8 h-8 animate-spin mb-2 text-rose-300" />
             <span className="text-xs font-medium uppercase tracking-wider">{t.generating3D}</span>
           </div>
         ) : imageUrl ? (
           <>
             <img 
              src={imageUrl} 
              alt={suggestion.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 dark:bg-black/80 p-2 rounded-full shadow-lg backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <Maximize2 className="w-5 h-5 text-stone-700 dark:text-stone-200" />
                </div>
             </div>
           </>
         ) : (
           <div className="absolute inset-0 flex items-center justify-center bg-stone-50 dark:bg-stone-800 text-stone-300 dark:text-stone-600">
              <ImageIcon className="w-12 h-12" />
           </div>
         )}
         {/* Color strip overlay */}
         <div className="absolute bottom-0 left-0 right-0 h-1.5 flex pointer-events-none">
            {suggestion.colorPalette.map((color, idx) => (
              <div key={idx} style={{ backgroundColor: color }} className="flex-1" />
            ))}
         </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {t.option} {index + 1}
          </span>
          <span className="text-sm font-serif italic text-rose-500 dark:text-rose-400">{suggestion.vibe}</span>
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-3 leading-tight">
          {suggestion.title}
        </h3>
        
        <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm leading-relaxed">
          {suggestion.description}
        </p>

        {/* Flower Language & Blessing Section */}
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl space-y-3 border border-rose-100 dark:border-rose-900/20">
          <div className="flex gap-2">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold text-rose-700 dark:text-rose-300 uppercase text-xs tracking-wider block mb-0.5">
                {t.flowerLanguageLabel}
              </span>
              <p className="text-stone-700 dark:text-stone-300 italic">{suggestion.flowerLanguage}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Quote className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
             <div className="text-sm">
              <span className="font-bold text-rose-700 dark:text-rose-300 uppercase text-xs tracking-wider block mb-0.5">
                {t.blessingLabel}
              </span>
              <p className="text-stone-700 dark:text-stone-300 font-serif">“{suggestion.blessing}”</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-auto">
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-stone-400 dark:text-stone-500 tracking-wider mb-2">
              <Leaf className="w-3 h-3" />
              {t.flowerSelection}
            </h4>
            <ul className="space-y-1">
              {suggestion.flowerList.map((flower, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{flower}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
             <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-stone-400 dark:text-stone-500 tracking-wider mb-2">
              <Palette className="w-3 h-3" />
              {t.palette}
            </h4>
            <div className="flex gap-2">
              {suggestion.colorPalette.map((color, idx) => (
                <div 
                  key={idx} 
                  className="w-8 h-8 rounded-full border border-stone-100 dark:border-stone-700 shadow-sm ring-1 ring-stone-900/5 dark:ring-stone-100/10"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageModal: React.FC<{ url: string | null; onClose: () => void }> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-sm animate-fadeIn p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-12 right-0 p-2 text-stone-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={url} 
          alt="Zoomed Arrangement" 
          className="w-auto h-auto max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain border border-white/10"
        />
      </div>
    </div>
  );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data }) => {
  const { t } = useSettings();
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);
  
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      
      {/* Analysis Section */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          {t.aiAnalysisLabel}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-6">
          {t.analysisTitle}
        </h2>
        
        <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
          {data.analysis}
        </p>

        {data.identifiedFlowers.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {data.identifiedFlowers.map((flower, idx) => (
              <span key={idx} className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 text-sm shadow-sm">
                {t.detected}: <strong>{flower}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.suggestions.map((suggestion, index) => (
          <SuggestionCard 
            key={index} 
            suggestion={suggestion} 
            index={index} 
            onZoom={setZoomedUrl}
          />
        ))}
      </div>

      {/* Zoom Modal */}
      <ImageModal url={zoomedUrl} onClose={() => setZoomedUrl(null)} />
    </div>
  );
};

export default ResultDisplay;