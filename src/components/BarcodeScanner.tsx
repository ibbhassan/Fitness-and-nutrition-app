import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Loader2 } from 'lucide-react';
import type { FoodItem } from '../types';

interface BarcodeScannerProps {
  onClose: () => void;
  onScanSuccess: (food: Partial<FoodItem>) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onScanSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isCleanedUp = false;
    const qrCode = new Html5Qrcode("reader", {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39
      ]
    });
    scannerRef.current = qrCode;

    const timeoutId = setTimeout(() => {
      if (isCleanedUp) return;
      qrCode.start(
        { facingMode: "environment" },
        { fps: 10 },
        async (decodedText) => {
          if (qrCode.isScanning) {
            qrCode.pause(true);
          }
          await handleBarcodeMatch(decodedText, qrCode);
        },
        () => {
          // ignore continuous scan errors
        }
      ).catch(() => {
        if (!isCleanedUp) {
          setError("Failed to start camera. Please ensure you have granted camera permissions.");
        }
      });
    }, 50);

    return () => {
      isCleanedUp = true;
      clearTimeout(timeoutId);
      if (qrCode.isScanning) {
        qrCode.stop().then(() => qrCode.clear()).catch(console.error);
      } else {
        qrCode.clear();
      }
    };
  }, []);

  const handleBarcodeMatch = async (barcode: string, qrCode: Html5Qrcode) => {
    setIsLoading(true);
    try {
      let res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      let data = await res.json();

      // If not found and it's a 12-digit UPC, try adding a leading zero (EAN-13 format)
      if (data.status !== 1 && barcode.length === 12) {
        res = await fetch(`https://world.openfoodfacts.org/api/v0/product/0${barcode}.json`);
        data = await res.json();
      }

      if (data.status === 1 && data.product) {
        const product = data.product;
        const nut = product.nutriments || {};
        
        let unit = '100g';
        let cal = nut['energy-kcal_100g'] || 0;
        let pro = nut['proteins_100g'] || 0;
        let car = nut['carbohydrates_100g'] || 0;
        let fat = nut['fat_100g'] || 0;

        if (nut['energy-kcal_serving']) {
          unit = 'serving';
          cal = nut['energy-kcal_serving'] || 0;
          pro = nut['proteins_serving'] || 0;
          car = nut['carbohydrates_serving'] || 0;
          fat = nut['fat_serving'] || 0;
        }

        const foodItem: Partial<FoodItem> = {
          barcode,
          name: product.product_name || 'Unknown Product',
          amount: 1,
          unit,
          macrosPerUnit: {
            calories: cal,
            protein: pro,
            carbs: car,
            fat: fat,
          }
        };

        if (qrCode.isScanning) await qrCode.stop();
        onScanSuccess(foodItem);
      } else {
        setError('Product not found in database. Please enter manually.');
        setTimeout(async () => {
          if (qrCode.isScanning) await qrCode.stop();
          onScanSuccess({ barcode, name: '' });
        }, 2000);
      }
    } catch (err) {
      setError('Network error checking database.');
      if (qrCode.isScanning) qrCode.resume();
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    onClose();
  };

  const submitManualBarcode = async () => {
    if (!manualBarcode.trim()) return;
    if (scannerRef.current?.isScanning) {
      scannerRef.current.pause(true);
    }
    await handleBarcodeMatch(manualBarcode.trim(), scannerRef.current!);
  };

  const handleManual = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    onScanSuccess({});
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[60] px-4 fade-in">
      <div className="absolute top-6 right-6">
        <button onClick={handleClose} className="text-white hover:text-gray-300">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="w-full max-w-md bg-tactical-800 p-4 rounded-xl border border-tactical-600">
        <h3 className="esports-heading text-xl text-white mb-4 text-center">Scan Barcode</h3>
        
        <div id="reader" className="w-full bg-black rounded-lg overflow-hidden min-h-[250px] relative">
          {/* html5-qrcode mounts here */}
        </div>

        {isLoading && (
          <div className="mt-4 flex flex-col items-center text-neon-blue">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="font-rajdhani uppercase tracking-wider">Looking up product...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-neon-red rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-tactical-700">
          <p className="text-gray-400 text-xs font-rajdhani uppercase tracking-wider mb-2 text-center">Camera not reading it? Type Barcode:</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={manualBarcode}
              onChange={e => setManualBarcode(e.target.value)}
              placeholder="e.g. 0635985500049"
              className="flex-1 bg-tactical-900 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none text-sm"
            />
            <button 
              onClick={submitManualBarcode}
              disabled={!manualBarcode.trim() || isLoading}
              className="bg-neon-blue text-tactical-900 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
            >
              Lookup
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={handleManual}
            className="text-neon-blue text-sm hover:underline"
          >
            Enter manually instead
          </button>
        </div>
      </div>
    </div>
  );
};
