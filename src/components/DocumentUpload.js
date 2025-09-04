import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './DocumentUpload.css';

const DocumentUpload = ({ onFileUpload, isProcessing }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF or image file (max 10MB)');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError('');
  };

  return (
    <div className="document-upload">
      <h2>Upload Insurance Claim Form</h2>
      <p className="upload-description">
        Upload a PDF or image file of your insurance claim form for AI-powered data extraction
      </p>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <div className="dropzone-content">
            <div className="upload-icon">📄</div>
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <>
                <p><strong>Click to select</strong> or drag and drop</p>
                <p className="file-types">PDF, PNG, JPG, JPEG (max 10MB)</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="uploaded-file">
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <h3>{uploadedFile.name}</h3>
              <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isProcessing && (
              <button className="remove-btn" onClick={handleRemoveFile}>
                ✕
              </button>
            )}
          </div>
          {isProcessing && (
            <div className="processing-status">
              <div className="processing-spinner"></div>
              <p>Processing document with AI...</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
