import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const ProcessingStatus = ({ 
  isLoading, 
  progress, 
  error, 
  onRetry, 
  className 
}) => {
  if (!isLoading && !error && !progress.status) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Card */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Processing Medical Form
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {progress.status || 'Starting...'}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: `${Math.max(0, Math.min(100, progress.progress || 0))}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-blue-600">
                {Math.round(progress.progress || 0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Status */}
      {!isLoading && progress.progress === 100 && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Processing Complete
              </p>
              <p className="text-xs text-green-700 mt-1">
                Document successfully processed and data extracted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Status */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Processing Failed
              </p>
              <p className="text-xs text-red-700 mt-1">
                {error.message || 'An unexpected error occurred during processing.'}
              </p>
              
              {/* Troubleshooting Tips */}
              <div className="mt-2 text-xs text-red-600">
                <p className="font-medium">Try these solutions:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Ensure the document is clear and readable</li>
                  <li>Check file size is under 20MB</li>
                  <li>Try a different file format (PDF or high-quality image)</li>
                  <li>Ensure the document is an insurance claim form</li>
                </ul>
              </div>
            </div>
          </div>
          
          {onRetry && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={onRetry}
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Steps */}
      {isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Processing Steps
          </h4>
          
          <div className="space-y-2">
            {[
              { step: 'File validation', completed: progress.progress > 10 },
              { step: 'Document conversion', completed: progress.progress > 30 },
              { step: 'OCR text extraction', completed: progress.progress > 60 },
              { step: 'Data parsing', completed: progress.progress > 90 },
              { step: 'Result formatting', completed: progress.progress >= 100 },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  item.completed ? 'bg-blue-500' : 'bg-gray-300'
                )} />
                <span className={cn(
                  'text-xs',
                  item.completed ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {item.step}
                </span>
                {item.completed && (
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
