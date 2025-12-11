import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, success: (msg) => addToast(msg, 'success'), error: (msg) => addToast(msg, 'error') }}>
            {children}
            <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className={`flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' :
                                    toast.type === 'error' ? 'bg-white border-red-200 text-red-700' :
                                        'bg-white border-blue-200 text-blue-700'
                                }`}
                        >
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                            <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
                            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
