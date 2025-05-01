import { useState, useCallback } from 'react';

interface AlertDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  variant?: 'info' | 'warning' | 'error' | 'success';
  onConfirm?: () => void;
}

export function useAlertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions>({
    title: '',
    message: '',
    confirmLabel: 'OK',
    cancelLabel: 'Cancel',
    showCancel: false,
    variant: 'info',
    onConfirm: undefined,
  });

  const openAlert = useCallback((newOptions: AlertDialogOptions) => {
    setOptions({
      title: newOptions.title || 'Alert',
      message: newOptions.message,
      confirmLabel: newOptions.confirmLabel || 'OK',
      cancelLabel: newOptions.cancelLabel || 'Cancel',
      showCancel: newOptions.showCancel !== undefined ? newOptions.showCancel : false,
      variant: newOptions.variant || 'info',
      onConfirm: newOptions.onConfirm,
    });
    setIsOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback((message: string, onConfirm?: () => void) => {
    openAlert({
      title: 'Confirm',
      message,
      confirmLabel: 'OK',
      cancelLabel: 'Cancel',
      showCancel: true,
      variant: 'warning',
      onConfirm
    });
  }, [openAlert]);

  const alert = useCallback((message: string, title?: string) => {
    openAlert({
      title: title || 'Alert',
      message,
      confirmLabel: 'OK',
      showCancel: false,
      variant: 'info'
    });
  }, [openAlert]);

  return {
    isOpen,
    options,
    openAlert,
    closeAlert,
    confirm,
    alert
  };
}
