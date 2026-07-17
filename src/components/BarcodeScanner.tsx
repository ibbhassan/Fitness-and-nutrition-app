import React, { useEffect, useState, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X, Loader2, Camera } from 'lucide-react';
import type { FoodItem } from '../types';

interface BarcodeScannerProps {
  onClose: () => void;
  onScanSuccess: (food: Partial<FoodItem>) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onScanSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    let isCleanedUp = false;
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length > 0) {
          // Try to find the back camera
          let selectedDeviceId = videoInputDevices[0].deviceId;
          for (const device of videoInputDevices) {
            if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')) {
              selectedDeviceId = device.deviceId;
              break;
            }
          }

          if (!isCleanedUp && videoRef.current) {
            codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, async (result, err) => {
              if (result) {
                // Successfully decoded
                if (codeReaderRef.current) {
                  codeReaderRef.current.reset(); // Stop scanning
                }
                await handleBarcodeMatch(result.getText());
              }
              if (err && !(err instanceof NotFoundException)) {
                console.error(err);
              }
            });
          }
        } else {
          setError('No cameras found.');
        }
      } catch (err) {
        if (!isCleanedUp) {
          setError("Failed to start camera. Please check permissions.");
        }
      }
    };

    startScanner();

    return () => {
      isCleanedUp = true;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const handleBarcodeMatch = async (barcode: string) => {
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

        onScanSuccess(foodItem);
      } else {
        setError('Product not found. Please try again or enter manually.');
        setIsLoading(false);
        // Restart scanner if product not found
        if (codeReaderRef.current) {
             // Let user try again manually instead of auto restarting to avoid loop
        }
      }
    } catch (err) {
      setError('Network error checking database.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    onClose();
  };

  const submitManualBarcode = async () => {
    if (!manualBarcode.trim()) return;
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    await handleBarcodeMatch(manualBarcode.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setIsLoading(true);
        if (codeReaderRef.current) {
           codeReaderRef.current.reset(); // stop video
        }
        const imgUrl = URL.createObjectURL(file);
        
        const tempReader = new BrowserMultiFormatReader();
        const result = await tempReader.decodeFromImageUrl(imgUrl);
        await handleBarcodeMatch(result.getText());
      } catch (err) {
        setError("Could not find a barcode in that image. Make sure it's clear and well-lit.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[60] px-4 fade-in">
      <div className="absolute top-6 right-6">
        <button onClick={handleClose} className="text-white hover:text-gray-300">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="w-full max-w-md bg-tactical-800 p-4 rounded-xl border border-tactical-600 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <h3 className="esports-heading text-xl text-white mb-4 text-center">Scan Barcode</h3>
        
        <div className="w-full bg-black rounded-lg overflow-hidden min-h-[250px] relative border-2 border-tactical-700">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            style={{ minHeight: '250px' }} 
            muted 
            playsInline
          />
          {/* Targeting Box Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[80%] h-[150px] border-2 border-neon-blue rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 flex flex-col items-center text-neon-blue">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="font-rajdhani uppercase tracking-wider">Looking up product...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-neon-red rounded-lg text-red-200 text-sm text-center font-inter">
            {error}
          </div>
        )}

        <div className="mt-4">
          <label className="w-full bg-tactical-700 hover:bg-tactical-600 border border-tactical-500 text-white rounded-lg p-3 flex justify-center items-center gap-2 cursor-pointer transition-colors">
            <Camera className="w-5 h-5" />
            <span className="font-rajdhani uppercase tracking-wider text-sm sm:text-base">Take Photo of Barcode</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-tactical-700">
          <p className="text-gray-400 text-xs font-rajdhani uppercase tracking-wider mb-2 text-center">Camera not reading it? Type Barcode:</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1 bg-tactical-900 border border-tactical-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue font-inter"
              placeholder="e.g. 01234567890"
              onKeyDown={(e) => e.key === 'Enter' && submitManualBarcode()}
            />
            <button 
              onClick={submitManualBarcode}
              className="bg-neon-blue text-black px-4 py-2 rounded-lg font-rajdhani uppercase tracking-wider font-bold hover:bg-blue-400 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
