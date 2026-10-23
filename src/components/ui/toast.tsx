'use client'

import { Toaster, toast, ExternalToast } from 'sonner'

interface ToastConfig {
  success: (message: string, options?: ExternalToast) => string | number
  error: (message: string, options?: ExternalToast) => string | number
  info: (message: string, options?: ExternalToast) => string | number
  warning: (message: string, options?: ExternalToast) => string | number
  promise: <T>(promise: Promise<T>, messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: Error) => string)
  }) => Promise<T> | { unwrap: () => Promise<T> }
  dismiss: (id: string | number) => void
}

export const useToast = (): ToastConfig => {
  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    info: (message, options) => toast.info(message, options),
    warning: (message, options) => toast.warning(message, options),
    promise: toast.promise,
    dismiss: toast.dismiss,
  }
}

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      className="toaster-group"
      toastOptions={{
        classNames: {
          toast: 'bg-white border border-gray-200 shadow-lg rounded-xl p-4',
          description: 'text-gray-600',
          actionButton: 'bg-primary-600 text-white hover:bg-primary-700',
          cancelButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        },
        style: {
          minWidth: '320px',
          maxWidth: '480px',
        },
        duration: 4000,
      }}
    />
  )
}