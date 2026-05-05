import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm } from 'formidable';
import { Readable } from 'stream';
import { getFileRegistry } from '../discover/route';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to convert Web API Request to Node.js readable stream
function webToNodeStream(webStream: ReadableStream): Readable {
  const reader = webStream.getReader();
  return new Readable({
    read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      });
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const form = new IncomingForm({
      maxFileSize: 500 * 1024 * 1024, // 500MB limit
      keepExtensions: true,
    });

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique file ID
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store in registry
    const registry = getFileRegistry();
    registry.set(fileId, {
      name: file.name,
      size: file.size,
      data: buffer,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      fileId,
      name: file.name,
      size: file.size,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
