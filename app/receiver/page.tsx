'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

function ReceiverContent() {
  const searchParams = useSearchParams();
  const hostParam = searchParams.get('host');
  
  const [ipAddress, setIpAddress] = useState(hostParam || '');
  const [port, setPort] = useState('3000');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill IP from URL or detection
  useEffect(() => {
    if (hostParam) {
      setIpAddress(hostParam);
      // Auto-scan if host is provided
      setTimeout(() => discoverFiles(hostParam), 500);
    } else {
      const host = window.location.hostname;
      if (host !== 'localhost' && !host.includes('.local')) {
        setIpAddress(host);
      }
    }
  }, [hostParam]);

  const discoverFiles = async (overrideIp?: string) => {
    const targetIp = overrideIp || ipAddress;
    if (!targetIp) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Use full URL to avoid CORS issues if on different host
      const res = await fetch(`http://${targetIp}:${port}/api/discover`);
      if (!res.ok) throw new Error('Host tidak ditemukan');
      const data = await res.json();
      setFiles(data.files || []);
      if (data.files?.length === 0) {
        setError('Tidak ada file yang tersedia di host ini.');
      }
    } catch (err) {
      setError('Gagal terhubung ke host. Pastikan alamat IP dan port benar, serta kedua device di WiFi yang sama.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Kembali ke Radar
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Terima File</h1>
        <div className="w-20"></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Hubungkan ke Pengirim</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat IP Host</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.x"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="3000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => discoverFiles()}
          disabled={loading || !ipAddress}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? 'Mencari...' : 'Hubungkan Manual'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-medium">
            {files.length} file tersedia
          </div>
          <ul className="divide-y divide-slate-100">
            {files.map((file) => (
              <li key={file.id} className="px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-700">{file.name}</p>
                  <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
                </div>
                {/* Use <a> tag with download attribute for better mobile support */}
                <a
                  href={`http://${ipAddress}:${port}/api/files/${file.id}`}
                  download={file.name}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ReceiverPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <Suspense fallback={<div>Loading receiver...</div>}>
        <ReceiverContent />
      </Suspense>
    </main>
  );
}
