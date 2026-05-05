import { NextRequest, NextResponse } from 'next/server';
import { getFileRegistry } from '../discover/route';

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
  return new NextResponse(file.data, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Length': file.size.toString(),
    },
  });
}
