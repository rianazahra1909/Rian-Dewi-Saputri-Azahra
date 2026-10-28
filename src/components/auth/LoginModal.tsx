import React from 'react';
import { LoginForm } from './LoginForm.tsx';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 shadow-lg border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
        <LoginForm
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
