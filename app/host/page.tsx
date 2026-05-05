'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function HostPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{id: string, name: string, size: number}[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploaded: {id: string, name: string, size: number}[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          uploaded.push({ id: data.fileId, name: file.name, size: file.size });
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploadedFiles(uploaded);
    setIsUploading(false);
    
    // Generate share URL
    const host = window.location.host;
    setShareUrl(`http://${host}/receiver`);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Bagikan File</h1>
          <div className="w-20"></div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            multiple
            onChange={onFileSelect}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-700">Seret file ke sini atau klik untuk pilih</p>
            <p className="text-sm text-slate-500 mt-2">Bisa pilih banyak file sekaligus</p>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-medium text-slate-700">{files.length} file dipilih</span>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Hapus semua
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {files.map((file, idx) => (
                <li key={idx} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-700 truncate max-w-xs">{file.name}</p>
                      <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-slate-200">
              <button
                onClick={uploadFiles}
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mengupload...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload & Bagikan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Share Info */}
        {uploadedFiles.length > 0 && shareUrl && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-emerald-800">File siap dibagikan!</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-emerald-700 mb-2">Link untuk penerima (buka di browser device lain di WiFi yang sama):</p>
                <div className="flex space-x-2">
                  <code className="flex-1 bg-white border border-emerald-200 rounded-lg px-4 py-2 text-sm font-mono text-slate-700 break-all">
                    {shareUrl}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-emerald-700">File yang tersedia:</p>
                <ul className="mt-2 space-y-1">
                  {uploadedFiles.map((f) => (
                    <li key={f.id} className="text-sm text-emerald-600">
                      • {f.name} ({formatSize(f.size)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
