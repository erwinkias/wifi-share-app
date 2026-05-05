import { NextRequest, NextResponse } from 'next/server';

// In-memory file registry (will be reset on server restart)
// In production, use Redis or database
const fileRegistry = new Map<string, {
  name: string;
  size: number;
  data: Buffer;
  uploadedAt: string;
}>();

export async function GET() {
  const files = Array.from(fileRegistry.entries()).map(([id, file]) => ({
    id,
    name: file.name,
    size: file.size,
    uploadedAt: file.uploadedAt,
  }));

  return NextResponse.json({ files });
}

// Helper to get registry (used by other routes)
export function getFileRegistry() {
  return fileRegistry;
}
