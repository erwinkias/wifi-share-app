import { NextRequest, NextResponse } from 'next/server';
import { getFileRegistry } from '../../discover/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const fileId = params.id;
  const registry = getFileRegistry();
  const file = registry.get(fileId);

  if (!file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  // Return file as downloadable
  // Convert Buffer to Uint8Array for NextResponse compatibility
  const uint8Array = new Uint8Array(file.data);
  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Length': file.size.toString(),
    },
  });
}
