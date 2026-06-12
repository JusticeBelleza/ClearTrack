import { useState, useEffect } from "react";
import { Camera, QrCode, Keyboard, ArrowRight, CheckCircle } from "lucide-react";

export default function ScanQR() {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  // Mock function to simulate a successful scan
  const handleSimulateScan = () => {
    setIsScanning(false);
    setManualCode('DOC-2026-8894');
  };

  // Auto-generate a new system tracking number when switching to manual mode
  useEffect(() => {
    if (scanMode === 'manual' && !manualCode) {
      const year = new Date().getFullYear();
      const randomSequence = Math.floor(1000 + Math.random() * 9000);
      setManualCode(`DOC-${year}-${randomSequence}`);
    }
  }, [scanMode]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scan Document</h1>
        <p className="text-sm text-gray-500">Update the chain of custody.</p>
      </div>

      {/* Mode Toggle (Camera vs Manual) */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button 
          onClick={() => setScanMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
            scanMode === 'camera' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Camera className="w-4 h-4" /> Camera
        </button>
        <button 
          onClick={() => setScanMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
            scanMode === 'manual' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Keyboard className="w-4 h-4" /> Manual Entry
        </button>
      </div>

      {/* Camera Viewfinder Box */}
      {scanMode === 'camera' ? (
        <div className="relative aspect-[4/5] w-full bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          {/* This simulates where the live camera feed will go later */}
          {isScanning ? (
             <>
                <div className="absolute inset-0 bg-green-900/20 animate-pulse"></div>
                {/* Viewfinder Target */}
                <div className="relative w-64 h-64 border-2 border-white/50 rounded-xl flex items-center justify-center">
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl"></div>
                  
                  {/* Animated Scanning Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_8px_#4ade80] animate-[scan_2s_ease-in-out_infinite]"></div>
                  
                  <QrCode className="w-16 h-16 text-white/30" />
                </div>
                
                {/* Temporary button to simulate a scan for UI testing */}
                <button 
                  onClick={handleSimulateScan}
                  className="absolute bottom-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium border border-white/30"
                >
                  Simulate QR Scan
                </button>
             </>
          ) : (
            <div className="text-center space-y-3 p-6">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <CheckCircle className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-xl font-bold text-white">Document Detected</h3>
               <p className="text-green-300 font-mono bg-green-900/50 px-3 py-1 rounded border border-green-700">
                 {manualCode}
               </p>
               <button 
                 onClick={() => setIsScanning(true)} 
                 className="text-gray-400 text-sm underline mt-4"
               >
                 Scan another code
               </button>
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry Box */
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Tracking Number
            </label>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
              Auto-Generated
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <QrCode className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono uppercase"
              placeholder="e.g. DOC-2026-001"
            />
          </div>
          <p className="text-xs text-gray-500">
            A tracking number has been automatically generated. You can modify it to register an existing document.
          </p>
        </div>
      )}

      {/* Action Buttons (Disabled if no code is scanned/entered) */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button 
          disabled={!manualCode || isScanning && scanMode === 'camera'}
          className="flex flex-col items-center justify-center gap-2 bg-white border-2 border-blue-200 text-blue-700 p-4 rounded-xl font-semibold transition-all hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-6 h-6 mb-1" />
          Receive
        </button>
        <button 
          disabled={!manualCode || isScanning && scanMode === 'camera'}
          className="flex flex-col items-center justify-center gap-2 bg-primary border-2 border-primary text-white p-4 rounded-xl font-semibold transition-all hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400"
        >
          <ArrowRight className="w-6 h-6 mb-1" />
          Forward
        </button>
      </div>

    </div>
  );
}