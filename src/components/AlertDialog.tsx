import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { createPortal } from 'react-dom';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  variant?: 'info' | 'warning' | 'error' | 'success';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  showCancel = false,
  variant = 'info',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Handle escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // Prevent clicks outside from closing the dialog
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-400';
      case 'error':
        return 'border-red-500';
      case 'success':
        return 'border-green-500';
      default:
        return 'border-gray-200';
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
            onClick={onClose}
          >
            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`bg-background shadow-lg rounded-md border ${getVariantStyles()} max-w-md w-full mx-4 overflow-hidden relative z-[10000]`}
              onClick={handleOverlayClick}
            >
              <div className="p-4 sm:p-6">
                {/* Dialog Content */}
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium mb-2">{title}</p>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>

                {/* Dialog Actions */}
                <div className="mt-5 sm:mt-6 flex gap-2 justify-end">
                  {showCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClose}
                      className="text-sm"
                    >
                      {cancelLabel}
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConfirm}
                    className="text-sm"
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AlertDialog;
