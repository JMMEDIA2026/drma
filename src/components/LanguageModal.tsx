import React from 'react';
import { X, Check, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n/translations';

export const LanguageModal: React.FC = () => {
  const { languageModalOpen, setLanguageModalOpen, language, setLanguage, t } = useApp();

  if (!languageModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#161620] rounded-3xl border border-white/10 p-5 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
        <button
          onClick={() => setLanguageModalOpen(false)}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-rose-400" />
          <h3 className="text-base font-bold text-white">{t('lang_select_title')}</h3>
        </div>

        <div className="overflow-y-auto space-y-1.5 pr-1">
          {LANGUAGES.map(lng => {
            const isActive = language === lng.code;
            return (
              <button
                id={`btn-lang-${lng.code}`}
                key={lng.code}
                onClick={() => {
                  setLanguage(lng.code);
                  setLanguageModalOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-[#1C1C24] text-zinc-300 hover:bg-[#23232D] border border-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <img
                    src={`https://flagcdn.com/${lng.flag}.svg`}
                    alt=""
                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0"
                  />
                  <span>{lng.native}</span>
                </span>
                {isActive && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
