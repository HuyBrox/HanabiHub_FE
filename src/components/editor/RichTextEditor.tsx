"use client";

import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung...",
  height = 400 
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-md">
        <div className="h-16 bg-gray-100 rounded-t-md flex items-center px-4">
          <div className="flex space-x-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-b-md flex items-center justify-center">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      </div>
    );
  }

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="border border-gray-300 rounded-md">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | image | link | table',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
          placeholder: placeholder,
          branding: false,
          statusbar: false,
          resize: false,
          image_upload_handler: (blobInfo, success, failure) => {
            // Handle image upload
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            
            // Simulate upload - replace with actual API
            setTimeout(() => {
              success('data:image/jpeg;base64,' + btoa('fake-image-data'));
            }, 1000);
          },
          file_picker_types: 'image',
          file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();
              
              input.onchange = function() {
                const file = (this as any).files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = function() {
                    callback((reader as any).result, {
                      alt: file.name
                    });
                  };
                  reader.readAsDataURL(file);
                }
              };
            }
          }
        }}
      />
    </div>
  );
}
