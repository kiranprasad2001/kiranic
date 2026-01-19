import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Database, LayoutTemplate, Printer, Mail, Smartphone, ArrowRight, PenTool, Cloud } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function DocumentWorkflow() {
    const [activeStep, setActiveStep] = useState(0);
    const constraintsRef = useRef(null);

    const steps = [
        { id: 0, title: "Design", icon: PenTool, description: "Blueprint & Requirements" },
        { id: 1, title: "Data Integration", icon: Database, description: "Connecting Systems of Record" },
        { id: 2, title: "Composition", icon: LayoutTemplate, description: "Dynamic Layout & Logic" },
        { id: 3, title: "Omni-Channel", icon: Mail, description: "Delivery to Customer" },
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto my-32">
            <CloudBackground />

            {/* Inner Content - Positioned relative to sit on top of the cloud background */}
            <div className="relative z-10 px-8 py-12 md:px-16 md:py-16">

                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3 ring-4 ring-white dark:ring-slate-800">
                        <Cloud className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">ELI5 - what i do</h2>
                    {/*<p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase tracking-wider font-semibold"></p>*/}
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between items-center mb-12 relative px-2 md:px-8">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-400 rounded-full -z-0 transition-all duration-500"
                        style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const isActive = index <= activeStep;
                        const isCurrent = index === activeStep;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => setActiveStep(index)}>
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm bg-white dark:bg-slate-800",
                                    isActive
                                        ? "border-blue-500 text-blue-500"
                                        : "border-slate-100 dark:border-slate-700 text-slate-300",
                                    isCurrent && "border-blue-600 bg-blue-50 dark:bg-blue-900/20 scale-110"
                                )}>
                                    <step.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-300")} />
                                </div>
                                <span className={cn(
                                    "absolute top-14 text-xs font-bold whitespace-nowrap transition-colors bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-full backdrop-blur-sm",
                                    isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Content Area - Glassmorphic Card inside the Cloud */}
                <div className="min-h-[420px] bg-slate-50/80 dark:bg-slate-950/50 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm shadow-inner">
                    <AnimatePresence mode='wait'>

                        {/* Step 0: Design */}
                        {activeStep === 0 && (
                            <motion.div
                                key="design"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center"
                            >
                                <div className="inline-block p-6 bg-blue-100/50 dark:bg-blue-900/20 rounded-full mb-6">
                                    <PenTool className="w-16 h-16 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Design Phase</h3>
                                <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                                    Blueprint your document architecture. Define templates, reusable fragments, and the business logic that drives dynamic personalization.
                                </p>
                            </motion.div>
                        )}

                        {/* Step 1: Data */}
                        {activeStep === 1 && (
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center w-full max-w-lg"
                            >
                                <div className="flex items-center justify-center gap-4 md:gap-12 mb-10 w-full">
                                    <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <Database className="w-10 h-10 text-slate-400" />
                                        <span className="text-xs font-bold mt-2 text-slate-500 uppercase">Legacy</span>
                                    </div>

                                    <div className="flex-grow flex flex-col gap-1 items-center relative">
                                        <div className="h-1 bg-slate-200 dark:bg-slate-700 w-full rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full w-1/2 bg-blue-500 rounded-full"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">TRANSFORM</span>
                                    </div>

                                    <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <FileText className="w-10 h-10 text-blue-500" />
                                        <span className="text-xs font-bold mt-2 text-blue-600 dark:text-blue-400 uppercase">Payload</span>
                                    </div>
                                </div>
                                <p className="text-center text-slate-600 dark:text-slate-300 px-4">
                                    The <span className="font-semibold text-blue-600 dark:text-blue-400">Integration Layer</span> ingests raw mainframe streams and standardizes them into structured JSON/XML schemas ready for modern processing.
                                </p>
                            </motion.div>
                        )}

                        {/* Step 2: Composition (Interactive) */}
                        {activeStep === 2 && (
                            <motion.div
                                key="composition"
                                ref={constraintsRef}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full flex flex-col md:flex-row gap-8 items-start"
                            >
                                {/* Palette */}
                                <div className="w-full md:w-1/3 flex flex-col gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Toolkit</h4>
                                    {['Header Component', 'Address Block', 'Dynamic Body', 'Footer Component'].map((item) => (
                                        <motion.div
                                            key={item}
                                            drag
                                            dragConstraints={constraintsRef}
                                            dragMomentum={false}
                                            whileHover={{ scale: 1.02, cursor: 'grab', backgroundColor: '#f8fafc' }}
                                            whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-semibold text-slate-600 dark:text-slate-300 touch-none select-none flex items-center justify-between group"
                                        >
                                            {item}
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
                                        </motion.div>
                                    ))}
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-300 text-center font-medium">
                                        Try dragging components!
                                    </div>
                                </div>

                                {/* Canvas */}
                                <div className="flex-grow w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center p-6 md:p-10 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <LayoutTemplate className="w-32 h-32 text-slate-200 dark:text-slate-700/50" />
                                    </div>

                                    <div className="w-[210px] h-[297px] bg-white shadow-2xl flex flex-col p-6 space-y-6 scale-95 md:scale-100 transition-transform border border-slate-100 relative z-0">
                                        <div className="h-4 w-1/3 bg-slate-100 rounded" />
                                        <div className="h-24 w-full bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center justify-center gap-2">
                                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Drop Zone</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-2 w-full bg-slate-50 rounded" />
                                            <div className="h-2 w-5/6 bg-slate-50 rounded" />
                                            <div className="h-2 w-4/6 bg-slate-50 rounded" />
                                            <div className="h-2 w-full bg-slate-50 rounded" />
                                        </div>
                                        <div className="mt-auto h-12 w-full bg-slate-50 rounded border border-slate-100" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Omni-Channel */}
                        {activeStep === 3 && (
                            <motion.div
                                key="delivery"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-center gap-6 md:gap-12 w-full flex-wrap"
                            >
                                {[
                                    { icon: Printer, label: 'Print Stream', desc: 'AFP / PDF', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', delay: 0 },
                                    { icon: Mail, label: 'Email', desc: 'HTML5 / Text', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', delay: 0.2 },
                                    { icon: Smartphone, label: 'Mobile', desc: 'SMS / Push', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', delay: 0.4 },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: item.delay, type: "spring", stiffness: 200 }}
                                        className="flex flex-col items-center group"
                                    >
                                        <div className={cn("p-6 md:p-8 rounded-[2rem] shadow-lg mb-4 transition-transform group-hover:scale-110 duration-300", item.bg)}>
                                            <item.icon className={cn("w-10 h-10 md:w-14 md:h-14", item.color)} />
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                                        <span className="text-xs font-semibold text-slate-400 mt-1">{item.desc}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 right-10 md:right-20">
                    <button
                        onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                        className="group flex items-center gap-3 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        {activeStep === steps.length - 1 ? 'Replay' : 'Next'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function CloudBackground() {
    return (
        <motion.div
            className="absolute -inset-12 z-0 filter drop-shadow-2xl opacity-90"
            initial={{ y: 5 }}
            animate={{ y: -5 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 6, ease: "easeInOut" }}
        >
            {/* Main Body */}
            <div className="absolute inset-12 bg-white dark:bg-slate-900 rounded-[4rem]" />

            {/* Top Puffs */}
            <div className="absolute top-0 left-20 w-40 h-40 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute -top-8 left-1/4 w-52 h-52 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute top-0 right-1/4 w-44 h-44 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute top-8 right-10 w-32 h-32 bg-white dark:bg-slate-900 rounded-full" />

            {/* Bottom Puffs */}
            <div className="absolute bottom-4 left-16 w-36 h-36 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute -bottom-8 left-1/3 w-48 h-48 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute bottom-0 right-32 w-40 h-40 bg-white dark:bg-slate-900 rounded-full" />
        </motion.div>
    );
}
