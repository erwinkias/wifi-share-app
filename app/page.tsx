'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Device {
  id: string;
  name: string;
  ip: string;
  isHost: boolean;
  distance?: number;
  angle?: number;
}

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(true);
  const [myDevice, setMyDevice] = useState({ name: '', isHost: false });
  const [showRegister, setShowRegister] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const scanAngleRef = useRef(0);
  const [scanAngle, setScanAngle] = useState(0);
  const [myIp, setMyIp] = useState<string>('');
  const [ipCopied, setIpCopied] = useState(false);

  // Generate random position for devices on radar
  const positionDevices = useCallback((deviceList: Device[]) => {
    return deviceList.map((device, index) => {
      // Distribute devices in a circle, avoiding center
      const angle = (index / Math.max(deviceList.length, 1)) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 30 + Math.random() * 40; // 30-70% from center
      return { ...device, angle, distance };
    });
  }, []);

  // Scan animation
  useEffect(() => {
    if (!scanning) return;
    
    const interval = setInterval(() => {
      scanAngleRef.current = (scanAngleRef.current + 2) % 360;
      setScanAngle(scanAngleRef.current);
    }, 30);
    
    return () => clearInterval(interval);
  }, [scanning]);

  // Polling-based discovery (fallback for browsers without WebSocket support to external port)
  useEffect(() => {
    const pollDevices = async () => {
      try {
        // Scan local network IPs
        const baseIp = await getLocalIpPrefix();
        if (!baseIp) return;

        const foundDevices: Device[] = [];
        
        // Check common ports on same subnet
        for (let i = 2; i < 20; i++) {
          const ip = `${baseIp}.${i}`;
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 500);
            
            const res = await fetch(`http://${ip}:3000/api/discover`, {
              signal: controller.signal
            });
            clearTimeout(timeout);
            
            if (res.ok) {
              const data = await res.json();
              if (data.devices?.length > 0) {
                foundDevices.push(...data.devices.map((d: any) => ({
                  ...d,
                  ip
                })));
              }
            }
          } catch {
            // Timeout or no response, continue scanning
          }
        }
        
        setDevices(positionDevices(foundDevices));
      } catch (e) {
        console.error('Discovery error:', e);
      }
    };

    // Poll every 3 seconds
    pollDevices();
    const interval = setInterval(pollDevices, 3000);
    
    return () => clearInterval(interval);
  }, [positionDevices]);

  // Get local IP prefix (192.168.1.x -> 192.168.1)
  const getLocalIpPrefix = async (): Promise<string | null> => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const candidate = pc.localDescription?.sdp.match(/candidate:.*\s+([\d.]+)\s+/);
          pc.close();
          
          if (candidate) {
            const ip = candidate[1];
            setMyIp(ip); // Store full IP
            const parts = ip.split('.');
            resolve(`${parts[0]}.${parts[1]}.${parts[2]}`);
          } else {
            // Fallback: try common subnets
            resolve('192.168.1');
          }
        }, 500);
      });
    } catch {
      return '192.168.1';
    }
  };

  // Copy IP to clipboard
  const copyMyIp = async () => {
    if (!myIp) return;
    try {
      await navigator.clipboard.writeText(myIp);
      setIpCopied(true);
      setTimeout(() => setIpCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy IP:', e);
    }
  };

  // Register this device
  const registerDevice = async () => {
    if (!myDevice.name) return;
    
    try {
      await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: myDevice.name,
          isHost: myDevice.isHost
        })
      });
      
      setShowRegister(false);
    } catch (e) {
      console.error('Register error:', e);
    }
  };

  // Calculate position on radar
  const getPosition = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    const x = 50 + distance * Math.cos(rad) * 0.8;
    const y = 50 + distance * Math.sin(rad) * 0.8;
    return { x, y };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,128,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,128,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WiFi Radar</h1>
            <p className="text-emerald-400 text-sm">Scanning local network...</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {myIp && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex items-center shadow-lg">
              <div className="px-3 py-2 text-xs font-mono text-slate-400 border-r border-slate-700">
                MY IP: <span className="text-emerald-400">{myIp}</span>
              </div>
              <button
                onClick={copyMyIp}
                className={`px-3 py-2 text-xs font-bold transition-colors ${
                  ipCopied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {ipCopied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowRegister(true)}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 shadow-lg"
          >
            {myDevice.name || 'Set Device Name'}
          </button>
        </div>
      </header>

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-2xl max-w-md w-full mx-4 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">Join Network</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Device Name</label>
                <input
                  type="text"
                  value={myDevice.name}
                  onChange={(e) => setMyDevice({ ...myDevice, name: e.target.value })}
                  placeholder="e.g., Laptop Erwin"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMyDevice({ ...myDevice, isHost: true })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      myDevice.isHost 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">📤</div>
                    <div className="font-medium">Sender</div>
                    <div className="text-xs text-slate-400">Share files</div>
                  </button>
                  
                  <button
                    onClick={() => setMyDevice({ ...myDevice, isHost: false })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !myDevice.isHost 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">📥</div>
                    <div className="font-medium">Receiver</div>
                    <div className="text-xs text-slate-400">Download files</div>
                  </button>
                </div>
              </div>
              
              <button
                onClick={registerDevice}
                disabled={!myDevice.name}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-lg transition-colors"
              >
                Enter Radar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Radar Display */}
      <div className="relative flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="relative w-96 h-96">
          {/* Radar Circles */}
          {[25, 50, 75].map((r, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-emerald-500/30"
              style={{
                width: `${r * 2}%`,
                height: `${r * 2}%`,
                left: `${50 - r}%`,
                top: `${50 - r}%`
              }}
            />
          ))}
          
          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-emerald-500/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px bg-emerald-500/20" />
          </div>
          
          {/* Center (My Device) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-emerald-400 whitespace-nowrap">
              {myDevice.name || 'You'}
            </div>
          </div>
          
          {/* Scanning Line */}
          <div
            className="absolute left-1/2 top-1/2 w-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent origin-left"
            style={{
              transform: `rotate(${scanAngle}deg)`,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
            }}
          />
          
          {/* Detected Devices */}
          {devices.map((device, index) => {
            const pos = getPosition(device.angle || 0, device.distance || 50);
            const isInScan = Math.abs((scanAngle % 360) - (device.angle || 0)) < 30;
            
            return (
              <Link
                key={device.id}
                href={device.isHost ? `/receiver?host=${device.ip}` : '#'}
                className={`absolute transition-all duration-500 ${
                  isInScan ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
                }`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className={`w-4 h-4 rounded-full ${
                  device.isHost ? 'bg-blue-400' : 'bg-purple-400'
                } animate-ping`} />
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  device.isHost 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {device.name}
                  {device.isHost && ' 📤'}
                </div>
              </Link>
            );
          })}
          
          {/* Scan Effect */}
          <div
            className="absolute left-1/2 top-1/2 w-1/2 pointer-events-none"
            style={{
              transform: `rotate(${scanAngle}deg)`,
              transformOrigin: 'left center'
            }}
          >
            <div className="w-full h-32 bg-gradient-to-r from-emerald-500/20 to-transparent blur-xl" />
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <span>Detected Devices</span>
            {scanning && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </h3>
          
          {devices.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📡</div>
              <p className="text-slate-400">No devices detected yet</p>
              <p className="text-slate-500 text-sm mt-2">Make sure other devices are on the same WiFi network</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      device.isHost ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}>
                      <span className="text-xl">{device.isHost ? '📤' : '📱'}</span>
                    </div>
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-slate-500">{device.ip}</div>
                    </div>
                  </div>
                  
                  {device.isHost ? (
                    <Link
                      href={`/receiver?host=${device.ip}`}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Connect
                    </Link>
                  ) : (
                    <span className="text-slate-500 text-sm">Receiver</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manual Mode Toggle */}
      <div className="relative z-10 p-6 border-t border-slate-800">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-500 text-sm mb-3">Auto-detection not working?</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/host"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            >
              Manual Sender Mode →
            </Link>
            <Link
              href="/receiver"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Manual Receiver Mode →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
