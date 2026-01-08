import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Send } from 'lucide-react';
import { UserInput } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface InputSectionProps {
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
  const { t } = useSettings();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && !file) return;
    onSubmit({ text, image: file });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 overflow-hidden border border-stone-100 dark:border-stone-800 transition-all duration-300">
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Text Input */}
        <div className="relative">
          <label className="block text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">
            {t.yourRequirement}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholderText}
            className="w-full h-32 p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border-2 border-stone-100 dark:border-stone-800 focus:border-rose-300 dark:focus:border-rose-700 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 transition-all resize-none text-stone-700 dark:text-stone-200 placeholder-stone-400 text-lg"
            disabled={isLoading}
          />
        </div>

        {/* File Upload Area */}
        <div>
           <label className="block text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">
            {t.referenceImage}
          </label>
          
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`group relative h-40 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'border-stone-200 dark:border-stone-700 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/30 dark:hover:bg-rose-900/10'}`}
            >
              <div className="p-4 rounded-full bg-stone-50 dark:bg-stone-800 group-hover:bg-white dark:group-hover:bg-stone-700 group-hover:shadow-md transition-all duration-300">
                <Upload className="w-6 h-6 text-stone-400 group-hover:text-rose-400" />
              </div>
              <p className="mt-3 text-sm text-stone-500 font-medium">{t.clickToUpload}</p>
            </div>
          ) : (
            <div className="relative h-64 w-full rounded-xl overflow-hidden group">
              <img src={preview} alt={t.uploadPreview} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />
              <button 
                onClick={handleRemoveFile}
                disabled={isLoading}
                title={t.removeImage}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black rounded-full text-stone-700 dark:text-stone-200 shadow-sm backdrop-blur-sm transition-all transform hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white font-medium text-sm drop-shadow-md">
                <ImageIcon className="w-4 h-4" />
                <span>{t.imageAdded}</span>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || (!text && !file)}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg tracking-wide transition-all transform ${
            isLoading || (!text && !file)
              ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
              : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-rose-500 dark:hover:bg-rose-400 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {isLoading ? (
            <>{t.processing}</>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t.getRecommendations}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;