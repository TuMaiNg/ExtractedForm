import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, AlertCircle, X } from 'lucide-react';
import { fileSchema } from '../lib/validators';
import { createPdfThumbnail } from '../lib/pdf';
import { cn } from '../lib/utils';

const UploadDropzone = ({ onFilesSelected, disabled = false, className }) => {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Clear previous errors
    setErrors([]);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        file: file.name,
        errors: errors.map(err => err.message),
      }));
      setErrors(newErrors);
    }

    // Validate accepted files
    const validFiles = [];
    const validationErrors = [];

    for (const file of acceptedFiles) {
      try {
        fileSchema.parse({ file });
        
        // Create file object with metadata
        const fileWithMetadata = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          preview: null,
          id: `${file.name}-${file.lastModified}`,
        };

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          fileWithMetadata.preview = URL.createObjectURL(file);
        }
        
        // Generate thumbnail for PDFs
        if (file.type === 'application/pdf') {
          try {
            fileWithMetadata.preview = await createPdfThumbnail(file);
          } catch (error) {
            console.warn('Failed to create PDF thumbnail:', error);
          }
        }

        validFiles.push(fileWithMetadata);
      } catch (error) {
        validationErrors.push({
          file: file.name,
          errors: error.errors?.map(err => err.message) || [error.message],
        });
      }
    }

    if (validationErrors.length > 0) {
      setErrors(prev => [...prev, ...validationErrors]);
    }

    if (validFiles.length > 0) {
      setFiles(validFiles);
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 1,
    disabled,
  });

  const removeFile = (fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      onFilesSelected(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setErrors([]);
    onFilesSelected([]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'dropzone',
          isDragActive && 'active',
          isDragReject && 'error',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-full">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          
          <div className="text-center">
            <p className="text-base sm:text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload Medical Insurance Form'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports medical forms • PDF, PNG, JPEG • Max 20MB
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          {files.map((fileObj) => (
            <FileCard
              key={fileObj.id}
              file={fileObj}
              onRemove={() => removeFile(fileObj.id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error.file}</p>
                <ul className="text-xs text-red-600 mt-1 space-y-1">
                  {error.errors.map((err, errIndex) => (
                    <li key={errIndex}>• {err}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FileCard = ({ file, onRemove, disabled }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
    }
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
      {/* Preview */}
      <div className="flex-shrink-0">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-50 rounded border">
            {getFileIcon(file.type)}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        disabled={disabled}
        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export default UploadDropzone;
