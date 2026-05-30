import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from '@/components/ui/Modal';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      return;
    }

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // on success
            if (scannerRef.current) {
              scannerRef.current.stop().catch(console.error);
              scannerRef.current.clear();
              scannerRef.current = null;
            }
            onScan(decodedText);
            onClose();
          },
          () => {
            // parse errors are normal (no barcode found yet)
          }
        );
      } catch (err: any) {
        setError('Could not start camera. Please ensure you have granted camera permissions.');
        console.error(err);
      }
    };

    // Small delay to ensure modal DOM is ready
    setTimeout(startScanner, 100);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScan]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode" size="md">
      <div className="relative">
        <div id="reader" className="w-full min-h-[300px] bg-black rounded-xl overflow-hidden shadow-inner"></div>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center rounded-xl">
            {error}
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-[var(--text-secondary)] text-center">
        Position the barcode within the frame to scan automatically.
      </div>
    </Modal>
  );
}
