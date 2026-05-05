import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

// Global WebSocket server instance
let wss: WebSocketServer | null = null;

// Device registry
const devices = new Map<string, {
  id: string;
  name: string;
  ip: string;
  isHost: boolean;
  socket: any;
}>();

export async function GET() {
  // Initialize WebSocket server if not exists
  if (!wss) {
    wss = new WebSocketServer({ port: 3001 });
    
    wss.on('connection', (ws, req) => {
      const ip = req.socket.remoteAddress || 'unknown';
      const deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          
          if (msg.type === 'register') {
            devices.set(deviceId, {
              id: deviceId,
              name: msg.name || 'Unknown Device',
              ip: ip,
              isHost: msg.isHost || false,
              socket: ws
            });
            
            // Broadcast to all clients
            broadcastDevices();
          }
          
          if (msg.type === 'ping') {
            const device = devices.get(deviceId);
            if (device) {
              device.lastSeen = Date.now();
            }
          }
        } catch (e) {
          console.error('WS message error:', e);
        }
      });
      
      ws.on('close', () => {
        devices.delete(deviceId);
        broadcastDevices();
      });
      
      // Send initial device list
      ws.send(JSON.stringify({
        type: 'devices',
        devices: Array.from(devices.values()).map(d => ({
          id: d.id,
          name: d.name,
          ip: d.ip,
          isHost: d.isHost
        }))
      }));
    });
  }
  
  return NextResponse.json({ 
    status: 'WebSocket server running',
    wsUrl: 'ws://localhost:3001'
  });
}

function broadcastDevices() {
  const deviceList = Array.from(devices.values()).map(d => ({
    id: d.id,
    name: d.name,
    ip: d.ip,
    isHost: d.isHost
  }));
  
  const msg = JSON.stringify({ type: 'devices', devices: deviceList });
  
  for (const device of devices.values()) {
    if (device.socket.readyState === 1) { // OPEN
      device.socket.send(msg);
    }
  }
}
