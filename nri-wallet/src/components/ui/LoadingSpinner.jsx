import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Optimized Loading Spinner Component
 */
export const LoadingSpinner = React.memo(({ 
  size = 24, 
  className = '',
  fullScreen = false,
  message = 'Loading...'
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-blue-600" size={size} />
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
