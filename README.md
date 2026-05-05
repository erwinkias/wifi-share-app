# WiFi Share App 📡

Aplikasi web untuk berbagi file antar device melalui jaringan WiFi lokal. Tidak perlu install aplikasi, cukup buka browser!

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-cyan?style=flat&logo=tailwindcss)

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 📤 **Upload File** | Drag & drop atau pilih file untuk di-share |
| 🔍 **Auto Discovery** | Receiver bisa scan host di jaringan yang sama |
| 📱 **Cross-Platform** | Buka di browser apapun (HP, laptop, tablet) |
| 🔒 **Privat & Aman** | File tidak pernah keluar dari jaringan lokal WiFi |
| ⚡ **Tanpa Install** | Pure web app, zero install di semua device |
| 📊 **Progress Upload** | Real-time status upload file |
| 🔗 **Share Link** | Copy link untuk dibagikan ke penerima |

---

## 🚀 Cara Installasi

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (direkomendasikan: v20 LTS)
- npm atau yarn

### Langkah-langkah

#### 1. Clone Repository
```bash
git clone https://github.com/erwinkias/wifi-share-app.git
cd wifi-share-app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

#### 4. Build untuk Production (Opsional)
```bash
npm run build
npm start
```

---

## 📖 Cara Penggunaan

### Mode Host (Pengirim File)

1. **Buka browser** di device pengirim (laptop/HP yang punya file)
2. **Akses:** `http://localhost:3000/host`
3. **Drag & drop** file ke area upload, atau klik untuk pilih file
4. Klik tombol **"Upload & Bagikan"**
5. **Copy link** yang muncul (contoh: `http://192.168.1.10:3000/receiver`)
6. **Sebutkan IP address** ke penerima, atau scan QR (jika tersedia)

### Mode Receiver (Penerima File)

1. **Pastikan** berada di WiFi yang **sama** dengan pengirim
2. **Buka browser** di device penerima
3. **Akses:** `http://[IP-PENGIRIM]:3000/receiver`
   - Contoh: Jika IP pengirim `192.168.1.10`, buka `http://192.168.1.10:3000/receiver`
4. **Masukkan IP dan Port** pengirim di form
5. Klik **"Cari File"**
6. **Download** file yang tersedia

---

## 🏗️ Arsitektur

```
┌─────────────────┐     WiFi LAN (192.168.x.x)      ┌─────────────────┐
│   Device A      │◄────────────────────────────────►│   Device B      │
│  (Sender/Host)  │                                  │   (Receiver)    │
│                 │                                  │                 │
│ ┌─────────────┐ │                                  │ ┌─────────────┐ │
│ │  Browser    │ │      ┌─────────────┐            │ │  Browser    │ │
│ │  (Next.js)  │ │◄────►│  HTTP Server│◄──────────►│ │  (Next.js)  │ │
│ │             │ │      │  (Embedded) │            │ │             │ │
│ │ ┌─────────┐ │ │      └─────────────┘            │ │ └─────────┘ │ │
│ │ │File API │ │ │                                  │ │             │ │
│ │ │(Upload) │◄┼─┼──────────────────────────────────┼─┼►│  Fetch    │ │
│ │ └─────────┘ │ │                                  │ │  (Download)│ │
│ └─────────────┘ │                                  │ └─────────────┘ │
└─────────────────┘                                  └─────────────────┘
```

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **File Upload** | Native File API + Formidable |
| **Storage** | In-Memory (development) |
| **State** | React Hooks (useState, useEffect) |

---

## ⚠️ Limitations & Catatan

> **Penting:** Aplikasi ini dirancang untuk **jaringan lokal (WiFi)** dan **development**.

### Current Limitations:
- **In-Memory Storage:** File akan hilang jika server restart
- **No Persistence:** Tidak ada database atau permanent storage
- **Single Server:** Tidak bisa scale ke multiple instance
- **WiFi Only:** Harus di jaringan yang sama

### Rekomendasi Production:
Untuk production deployment, pertimbangkan:
- Ganti in-memory storage dengan **Redis** atau **Database** (PostgreSQL, MongoDB)
- Tambahkan **Cloud Storage** (AWS S3, Vercel Blob) untuk file
- Implementasi **WebSocket** untuk real-time progress
- Tambahkan **QR Code** generator untuk mudah sharing

---

## 📝 Changelog

### v1.0.0 - Initial Release
- ✅ Basic Host/Receiver UI
- ✅ File upload via drag-drop
- ✅ File download via HTTP
- ✅ Auto-discovery via IP input
- ✅ Responsive design

---

## 🤝 Contributing

Pull request dipersilakan! Untuk perubahan besar, silakan buka issue dulu untuk diskusi.

---

## 📄 License

[MIT](LICENSE) - Bebas digunakan dan dimodifikasi.

---

## 🙏 Credits

Dibuat dengan ❤️ menggunakan [Next.js](https://nextjs.org/) dan [Tailwind CSS](https://tailwindcss.com/)
