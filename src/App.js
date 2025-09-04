import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UploadDropzone from './components/UploadDropzone';
import ProcessingStatus from './components/ProcessingStatus';
import ResultsTabs from './components/ResultsTabs';
import { useExtraction } from './hooks/useExtraction';
import { Shield, FileText, Zap, Settings } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    useService: true,
    serviceEndpoint: '/api/extract',
  });

  const {
    extract,
    isLoading,
    isError,
    error,
    data,
    progress,
    retry,
    reset,
  } = useExtraction();

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
    reset(); // Clear previous results
  };

  const handleExtract = () => {
    if (selectedFiles.length === 0) return;
    
    const file = selectedFiles[0].file;
    extract({ 
      file, 
      options: {
        useService: settings.useService,
        serviceEndpoint: settings.serviceEndpoint,
      }
    });
  };

  const handleNewFile = () => {
    setSelectedFiles([]);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Insurance Processor
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Specialized AI extraction for medical forms
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Settings</h3>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.useService}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    useService: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Use API Service</span>
              </label>
              
              {settings.useService && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <label className="text-sm text-gray-700">Endpoint:</label>
                  <input
                    type="text"
                    value={settings.serviceEndpoint}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      serviceEndpoint: e.target.value 
                    }))}
                    className="w-full sm:w-auto px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/api/extract"
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {settings.useService ? 'Service extraction with Tesseract fallback' : 'Local Tesseract OCR only'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-4 sm:space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Upload Korean Medical Form
                </h2>
              </div>
              
              <UploadDropzone
                onFilesSelected={handleFilesSelected}
                disabled={isLoading}
              />
              
              {selectedFiles.length > 0 && !data && !isLoading && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleExtract}
                    className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Extract Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* Processing Status */}
            <ProcessingStatus
              isLoading={isLoading}
              progress={progress}
              error={isError ? error : null}
              onRetry={retry}
            />

            {/* Instructions */}
            {!selectedFiles.length && !data && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-medium text-blue-900 mb-3">
                  How to use this tool
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Upload your insurance claim form (PDF, PNG, or JPEG)</li>
                  <li>Click "Extract Data" to process the document</li>
                  <li>Review the extracted information in the results panel</li>
                  <li>Copy, download, or export the data as needed</li>
                </ol>
                
                <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Supported formats:</strong> PDF (up to 10 pages), PNG, JPEG<br />
                    <strong>Max file size:</strong> 20MB<br />
                    <strong>Processing:</strong> Uses AI service with local OCR fallback
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4 sm:space-y-6">
            {data && (
              <>
                <ResultsTabs data={data} />
                
                <div className="flex justify-center">
                  <button
                    onClick={handleNewFile}
                    className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Process New File</span>
                  </button>
                </div>
              </>
            )}
            
            {!data && !isLoading && selectedFiles.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-full inline-block mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No document uploaded
                </h3>
                <p className="text-sm text-gray-500">
                  Upload an insurance claim form to see extracted data here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2025 Insurance Claim Extractor. Built with React + AI.
            </div>
            <div className="flex items-center space-x-4">
              <span className="hover:text-gray-700 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray-700 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
