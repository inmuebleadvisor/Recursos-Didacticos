import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, Download, Sparkles } from 'lucide-react';
import { INITIAL_DATA, FormData, Zone, CollabCount, Semestre } from './types';
import { ZONES, SUBJECTS, ROLES, RESOURCE_TYPES, CATEGORIES } from './constants';
import { ValidatedInput, SelectInput } from './components/InputFields';
import { Confetti } from './components/Confetti';
import { handleExports } from './services/exportService';

const LOGO_URL = "https://picsum.photos/300/120"; // Placeholder, not used in Word anymore

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Trigger celebration on step change if forward
  const nextStep = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: keyof FormData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePlantel = (plantelName: string) => {
    setData(prev => {
        const exists = prev.planteles.includes(plantelName);
        if (exists) return { ...prev, planteles: prev.planteles.filter(p => p !== plantelName) };
        return { ...prev, planteles: [...prev.planteles, plantelName] };
    });
  };

  // Validation Check before proceeding
  const canProceed = () => {
    switch(step) {
        case 0: return data.zona !== "" && data.planteles.length > 0;
        case 1: return data.titulo.length > 3 && data.tipoRecurso !== "" && data.descripcion.length > 10;
        case 2: 
            if (data.numColaboradores === CollabCount.ONE) return data.nombre1.length > 3;
            return data.rol1 && data.nombre1.length > 3 && data.rol2 && data.nombre2.length > 3;
        case 3: return data.tipoRecursoEducativo && data.categoria && data.objetivo.length > 10;
        case 4: return data.semestre && data.asignatura && data.tema.length > 3;
        default: return false;
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    await handleExports(data, LOGO_URL);
    setIsExporting(false);
  };

  const stepTitles = ["Ubicación", "El Recurso", "Autoría", "Clasificación", "Contexto"];

  const renderStepContent = () => {
    switch (step) {
      case 0: // Zona & Plantel
        const plantelesOptions = data.zona ? ZONES[data.zona].map(p => ({ value: p.name, label: p.name })) : [];
        return (
          <div className="space-y-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectInput 
                    label="1. Zona Educativa" 
                    value={data.zona} 
                    options={Object.values(Zone).map(z => ({ value: z, label: z }))}
                    onChange={(val) => {
                        updateField("zona", val);
                        updateField("planteles", []); 
                    }}
                />
             </div>
            {data.zona && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <SelectInput 
                        label="2. Selecciona tu(s) Plantel(es)" 
                        subLabel="Puedes seleccionar más de uno"
                        multiple
                        options={plantelesOptions}
                        value=""
                        selectedValues={data.planteles}
                        onChange={() => {}} 
                        onToggle={togglePlantel}
                    />
                </motion.div>
            )}
          </div>
        );
      case 1: // Resource Info
        return (
          <div className="space-y-2">
            <ValidatedInput 
                label="3. Título del Recurso Didáctico Digital" 
                value={data.titulo} 
                onChange={(val) => updateField("titulo", val)} 
            />
            <ValidatedInput 
                label="4. Link o tipo de recurso" 
                subLabel="Ej: audio, app, imagen, video, web, pdf, presentación"
                value={data.tipoRecurso} 
                onChange={(val) => updateField("tipoRecurso", val)} 
            />
            <ValidatedInput 
                label="5. Descripción breve" 
                subLabel="Cuéntanos de qué trata (mínimo 10 caracteres)"
                multiline
                value={data.descripcion} 
                onChange={(val) => updateField("descripcion", val)} 
            />
          </div>
        );
      case 2: // Collaborators
        return (
          <div className="space-y-6">
            <SelectInput 
                label="6. Número de personas que colaboran" 
                value={data.numColaboradores}
                options={[{ value: "1", label: "1 persona (Solo yo)" }, { value: "2", label: "2 personas (Equipo)" }]}
                onChange={(val) => updateField("numColaboradores", val as CollabCount)}
            />
            
            <div className="grid grid-cols-1 gap-6">
                <motion.div 
                    className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-cobaes-burgundy text-white flex items-center justify-center font-bold mr-3">1</div>
                        <h3 className="font-bold text-gray-800">Colaborador Principal</h3>
                    </div>
                    {data.numColaboradores === "1" ? (
                        <div className="mb-4 inline-block px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                            Rol: Autor
                        </div>
                    ) : (
                        <SelectInput 
                            label="7. Mención de responsabilidad" 
                            value={data.rol1}
                            options={ROLES.map(r => ({ value: r, label: r }))}
                            onChange={(val) => updateField("rol1", val)}
                        />
                    )}
                    <ValidatedInput 
                        label={data.numColaboradores === "1" ? "9. Nombre Completo" : "8. Nombre Completo"}
                        value={data.nombre1}
                        onChange={(val) => updateField("nombre1", val)}
                    />
                </motion.div>

                {data.numColaboradores === "2" && (
                    <motion.div 
                        className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-cobaes-green text-white flex items-center justify-center font-bold mr-3">2</div>
                            <h3 className="font-bold text-gray-800">Segundo Colaborador</h3>
                        </div>
                        <SelectInput 
                            label="7. Mención de responsabilidad" 
                            value={data.rol2}
                            options={ROLES.map(r => ({ value: r, label: r }))}
                            onChange={(val) => updateField("rol2", val)}
                        />
                        <ValidatedInput 
                            label="8. Nombre Completo" 
                            value={data.nombre2}
                            onChange={(val) => updateField("nombre2", val)}
                        />
                    </motion.div>
                )}
            </div>
          </div>
        );
      case 3: // Classification
        return (
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectInput 
                        label="10. Tipo de recurso educativo"
                        value={data.tipoRecursoEducativo}
                        options={RESOURCE_TYPES.map(t => ({ value: t, label: t }))}
                        onChange={(val) => updateField("tipoRecursoEducativo", val)}
                    />
                    <SelectInput 
                        label="11. Categoría"
                        value={data.categoria}
                        options={CATEGORIES.map(c => ({ value: c, label: c }))}
                        onChange={(val) => updateField("categoria", val)}
                    />
                </div>
                <ValidatedInput 
                    label="12. Descripción del uso educativo (objetivo)"
                    subLabel="¿Cuál es el propósito pedagógico?"
                    multiline
                    value={data.objetivo}
                    onChange={(val) => updateField("objetivo", val)}
                />
             </div>
        );
      case 4: // Academic Context
         const subjectsOptions = data.semestre ? SUBJECTS[data.semestre].map(s => ({ value: s, label: s })) : [];
         return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectInput 
                        label="13. Semestre"
                        value={data.semestre}
                        options={Object.values(Semestre).map(s => ({ value: s, label: s }))}
                        onChange={(val) => {
                            updateField("semestre", val);
                            updateField("asignatura", ""); 
                        }}
                    />
                    {data.semestre && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <SelectInput 
                                label="14. Asignatura"
                                value={data.asignatura}
                                options={subjectsOptions}
                                onChange={(val) => updateField("asignatura", val)}
                            />
                        </motion.div>
                    )}
                </div>
                <ValidatedInput 
                    label="15. Tema(s) central(es)"
                    value={data.tema}
                    onChange={(val) => updateField("tema", val)}
                />
            </div>
         );
      case 5: // Finished
         return (
            <div className="text-center py-12">
                <motion.div 
                    initial={{ scale: 0, rotate: -180 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <CheckCircle size={100} className="text-cobaes-green relative z-10" />
                    </div>
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">¡Excelente Trabajo!</h2>
                <p className="text-gray-500 mb-10 text-lg">Tu recurso ha sido registrado correctamente.</p>

                <div className="flex flex-col gap-6 justify-center items-center">
                    <button 
                        onClick={handleDownload}
                        disabled={isExporting}
                        className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-cobaes-burgundy to-red-900 text-white px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full max-w-md disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer"></div>
                        
                        {isExporting ? (
                             <span className="animate-pulse font-medium">Generando archivos...</span>
                        ) : (
                            <>
                                <Download size={28} className="text-white/90" />
                                <span className="text-xl font-bold tracking-wide">Descargar Documentos</span>
                            </>
                        )}
                    </button>
                    
                    <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto flex items-center justify-center">
                        <Sparkles size={14} className="mr-2 text-cobaes-gold" />
                        Incluye palabras clave generadas por IA
                    </p>
                </div>
            </div>
         );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 selection:bg-cobaes-green selection:text-white pb-20 overflow-x-hidden">
      {showConfetti && <Confetti />}

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-green-100 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Header */}
      <header className="relative z-40 pt-8 pb-4 px-6 max-w-5xl mx-auto flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registro <span className="text-cobaes-green">Digital</span></h1>
            <p className="text-gray-500 font-medium mt-1">Recursos Didácticos COBAES</p>
        </div>
        <div className="hidden md:block">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-cobaes-green shadow-sm">
                Ciclo Escolar 2025-2026
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 mt-6">
        
        {/* Progress Stepper */}
        {step < 5 && (
            <div className="mb-8 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between">
                {stepTitles.map((title, idx) => (
                    <div key={idx} className={`flex-1 flex flex-col items-center relative ${idx <= step ? 'text-cobaes-green' : 'text-gray-300'}`}>
                        <div className={`w-3 h-3 rounded-full mb-2 transition-all ${idx <= step ? 'bg-cobaes-green scale-125' : 'bg-gray-300'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{title}</span>
                        {/* Connecting line */}
                        {idx < stepTitles.length - 1 && (
                            <div className={`absolute top-1.5 left-[50%] w-full h-[2px] -z-10 ${idx < step ? 'bg-cobaes-green' : 'bg-gray-200'}`}></div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Dynamic Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-white relative overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {step < 5 && (
                         <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            {stepTitles[step]}
                         </h2>
                    )}
                    {renderStepContent()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Navigation Actions */}
        {step < 5 && (
            <div className="mt-8 flex justify-between items-center px-4">
                <button 
                    onClick={prevStep}
                    disabled={step === 0}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                        step === 0 ? "opacity-0 pointer-events-none" : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
                    }`}
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Regresar
                </button>

                <button 
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`group flex items-center px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${
                        canProceed() 
                            ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {step === 4 ? "Finalizar Registro" : "Continuar"}
                    <ArrowRight size={18} className={`ml-2 transition-transform ${canProceed() ? 'group-hover:translate-x-1' : ''}`} />
                </button>
            </div>
        )}
      </main>
    </div>
  );
}