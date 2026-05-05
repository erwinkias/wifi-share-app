import { NextRequest, NextResponse } from 'next/server';

// Global device registry
const activeDevices = new Map<string, {
  id: string;
  name: string;
  ip: string;
  lastSeen: number;
  isHost: boolean;
}>();

// File registry (shared across API routes)
const fileRegistry = new Map<string, {
  name: string;
  size: number;
  data: Buffer;
  uploadedAt: string;
}>();

// Clean up stale devices (15 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [id, device] of activeDevices.entries()) {
    if (now - device.lastSeen > 15000) {
      activeDevices.delete(id);
    }
  }
}, 10000);

export async function GET(request: NextRequest) {
  // Return both devices and files
  const devices = Array.from(activeDevices.values());
  const files = Array.from(fileRegistry.entries()).map(([id, file]) => ({
    id,
    name: file.name,
    size: file.size,
    uploadedAt: file.uploadedAt,
  }));

  return NextResponse.json({ devices, files }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  const deviceData = await request.json();
  const deviceId = deviceData.id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  activeDevices.set(deviceId, {
    ...deviceData,
    id: deviceId,
    lastSeen: Date.now()
  });

  return NextResponse.json({ success: true, id: deviceId }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Export file registry for other routes
export function getFileRegistry() {
  return fileRegistry;
}

export function getActiveDevices() {
  return activeDevices;
}
