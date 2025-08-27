import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const SuccessFailureModal = ({
  isOpen,
  onClose,
  type = 'success', // 'success' or 'error'
  title,
  message,
  actionLabel = 'OK',
  onAction,
}) => {
  const isSuccess = type === 'success';
  
  const getIcon = () => {
    if (isSuccess) {
      return <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />;
    }
    return <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />;
  };

  const getDefaultTitle = () => {
    if (title) return title;
    return isSuccess ? 'Success!' : 'Error';
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center">
          {getIcon()}
          <AlertDialogTitle className={`text-xl font-semibold text-center ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {getDefaultTitle()}
          </AlertDialogTitle>
          {message && (
            <AlertDialogDescription className="text-center text-gray-600 mt-2">
              {message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={handleAction}
            className={`px-8 ${isSuccess 
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuccessFailureModal;