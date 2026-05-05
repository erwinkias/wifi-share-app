import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            WiFi Share
          </h1>
          <p className="text-lg text-slate-600">
            Kirim dan terima file secepat kilat di jaringan WiFi lokal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link 
            href="/host"
            className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="outbox" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Mulai Berbagi (Host)</h2>
            <p className="text-sm text-slate-500 text-center mt-2">
              Jadikan device ini sebagai pengirim file. Orang lain bisa akses via link atau QR.
            </p>
          </Link>

          <Link 
            href="/receiver"
            className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all duration-200"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Terima File (Receiver)</h2>
            <p className="text-sm text-slate-500 text-center mt-2">
              Cari pengirim di sekitar jaringan WiFi atau scan QR code untuk download.
            </p>
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center space-x-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Privat & Aman — File tidak pernah keluar dari jaringan lokal Anda.</span>
        </div>
      </div>
    </main>
  );
}
