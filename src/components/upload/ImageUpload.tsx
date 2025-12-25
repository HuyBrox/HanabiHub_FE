"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function ImageUpload({ 
  onUpload, 
  maxFiles = 5, 
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: ImageUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, maxFiles);
        setUploadedFiles(newFiles);
        onUpload(newFiles);
        setUploading(false);
      }, 1000);
    }
  }, [uploadedFiles, onUpload, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploading
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading 
                ? 'Đang tải lên...' 
                : isDragActive 
                  ? 'Thả ảnh vào đây' 
                  : 'Kéo thả ảnh hoặc click để chọn'
              }
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, WEBP tối đa {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Ảnh đã tải lên:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  <p className="truncate">{file.name}</p>
                  <p>{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">Đang xử lý ảnh...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

