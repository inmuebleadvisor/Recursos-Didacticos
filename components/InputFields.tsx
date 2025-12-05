import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Type, SpellCheck } from 'lucide-react';
import { validateText } from '../services/geminiService';

interface BaseProps {
  label: string;
  error?: string;
  subLabel?: string;
}

interface TextInputProps extends BaseProps {
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
}

export const ValidatedInput: React.FC<TextInputProps> = ({ label, value, onChange, error, multiline, subLabel }) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounce validation effect
  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (!value || value.length < 3) {
        setWarning(null);
        return;
      }

      // 1. Immediate Local Check: Uppercase
      if (value.length > 5 && value === value.toUpperCase() && /[A-Z]/.test(value)) {
        setWarning("No uses solo mayúsculas.");
        return;
      }

      // 2. AI/Heuristic Check: Spelling
      setIsValidating(true);
      
      // We try to use the AI service first if available
      try {
        const aiValidation = await validateText(value, label);
        if (aiValidation) {
            setWarning(aiValidation); // Should return "¡Ojo! Revisa la ortografía" if issues found
        } else {
            // Fallback heuristic if AI returns null (meaning OK) or fails silently
            // Check for repeated characters like "Hoooolaaaa"
            if (/(.)\1{2,}/.test(value)) {
                setWarning("¡Ojo! Revisa la ortografía (caracteres repetidos).");
            } else {
                setWarning(null);
            }
        }
      } catch (e) {
          // Fallback to purely local if AI fails
          if (/(.)\1{2,}/.test(value)) {
              setWarning("¡Ojo! Revisa la ortografía (caracteres repetidos).");
          } else {
              setWarning(null);
          }
      } finally {
        setIsValidating(false);
      }

    }, 1000); // 1 second debounce

    return () => clearTimeout(timeOutId);
  }, [value, label]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Clear warning immediately on type to reset state, wait for debounce to re-warn
    if (warning) setWarning(null); 
  };

  const isFocused = React.useRef(false);

  return (
    <div className="mb-6 group">
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-600 mb-2 transition-colors group-focus-within:text-cobaes-green">
            {label}
        </label>
        
        {multiline ? (
            <textarea 
                rows={4}
                className={`w-full p-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none resize-none ${
                    warning 
                    ? "border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100" 
                    : "border-transparent hover:border-gray-200 focus:border-cobaes-greenLight focus:ring-4 focus:ring-green-50"
                }`}
                value={value} 
                onChange={handleChange}
                spellCheck={true}
                placeholder="Escribe aquí..."
            />
        ) : (
            <input 
                type="text" 
                className={`w-full p-4 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none ${
                    warning 
                    ? "border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100" 
                    : "border-transparent hover:border-gray-200 focus:border-cobaes-greenLight focus:ring-4 focus:ring-green-50"
                }`}
                value={value} 
                onChange={handleChange} 
                spellCheck={true}
                placeholder="Escribe aquí..."
            />
        )}
        
        {/* Status Icons */}
        <div className="absolute right-4 top-10 pointer-events-none">
            {isValidating && <span className="block w-4 h-4 border-2 border-cobaes-green border-t-transparent rounded-full animate-spin opacity-50"></span>}
        </div>
      </div>

      {subLabel && !warning && <p className="text-xs text-gray-400 mt-2 pl-1">{subLabel}</p>}

      {warning && (
        <div className="flex items-start mt-2 text-amber-600 text-sm animate-in slide-in-from-top-1 bg-amber-50 p-2 rounded-lg border border-amber-100">
            <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{warning}</span>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface SelectProps extends BaseProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (val: string) => void;
    multiple?: boolean;
    selectedValues?: string[]; 
    onToggle?: (val: string) => void; 
}

export const SelectInput: React.FC<SelectProps> = ({ label, options, value, onChange, multiple, selectedValues, onToggle, subLabel }) => {
    return (
        <div className="mb-6 group">
            <label className="block text-sm font-semibold text-gray-600 mb-2 transition-colors group-focus-within:text-cobaes-green">
                {label}
            </label>
            {subLabel && <p className="text-xs text-gray-400 mb-2">{subLabel}</p>}
            
            {multiple ? (
                <div className="max-h-60 overflow-y-auto border-2 border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 rounded-xl p-2 transition-all shadow-inner custom-scrollbar">
                    {options.map((opt) => (
                        <label key={opt.value} className="flex items-center p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selectedValues?.includes(opt.value) ? 'bg-cobaes-green border-cobaes-green' : 'border-gray-300 bg-white'}`}>
                                {selectedValues?.includes(opt.value) && <Check size={14} className="text-white" />}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={selectedValues?.includes(opt.value)} 
                                onChange={() => onToggle && onToggle(opt.value)}
                                className="hidden"
                            />
                            <span className={`${selectedValues?.includes(opt.value) ? 'text-cobaes-green font-medium' : 'text-gray-700'}`}>{opt.label}</span>
                        </label>
                    ))}
                    {options.length === 0 && <p className="text-gray-400 text-sm p-4 text-center italic">Selecciona una zona primero</p>}
                </div>
            ) : (
                <div className="relative">
                    <select 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-4 pr-10 rounded-xl border-2 border-transparent bg-gray-50 focus:bg-white hover:border-gray-200 focus:border-cobaes-greenLight focus:ring-4 focus:ring-green-50 transition-all outline-none appearance-none cursor-pointer text-gray-700"
                    >
                        <option value="">Selecciona una opción</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};