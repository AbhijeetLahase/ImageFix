import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Download,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface EnhancedImage {
  id: string;
  original: string;
  enhanced: string;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login'); // redirect if not logged in
    }
  }, [navigate]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setEnhancedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleEnhance = async () => {
    if (!selectedImage) return;

    setLoading(true);

    // Convert data URL to Blob
    const res = await fetch(selectedImage);
    const blob = await res.blob();
    const formData = new FormData();
    formData.append('file', blob, 'input.png');

    try {
      const response = await fetch('http://localhost:8001/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Enhancement failed');

      const enhancedBlob = await response.blob();
      const enhancedUrl = URL.createObjectURL(enhancedBlob);
      setEnhancedImage(enhancedUrl);

      // Save to history
      const enhancement: EnhancedImage = {
        id: Date.now().toString(),
        original: selectedImage,
        enhanced: enhancedUrl,
        timestamp: new Date(),
      };
      const history = JSON.parse(localStorage.getItem('enhancement_history') || '[]');
      history.unshift(enhancement);
      localStorage.setItem('enhancement_history', JSON.stringify(history));
    } catch (err) {
      alert('Failed to enhance image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setEnhancedImage(null);
    setLoading(false);
  };

  const handleDownload = () => {
    if (!enhancedImage) return;

    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-photo.jpg';
    link.click();
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enhance Your Photos
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your blurry, noisy, or low-quality photos and watch our AI transform them into crystal-clear images
            </p>
          </div>

          {/* Upload or Enhance */}
          {!selectedImage ? (
            <div className="max-w-2xl mx-auto">
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Upload className="h-12 w-12 text-blue-600" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your image here
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse from your device
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Choose File
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                <p className="text-sm text-gray-500 mt-4">
                  Supports JPG, PNG, and WEBP files up to 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5" />
                      <span>Original</span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-green-600" />
                      <span>Enhanced</span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {loading ? (
                        <div className="text-center">
                          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Enhancing your photo...</p>
                          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                        </div>
                      ) : enhancedImage ? (
                        <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Sparkles className="h-12 w-12 mx-auto mb-2" />
                          <p>Enhanced image will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!enhancedImage && !loading && (
                  <button
                    onClick={handleEnhance}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Enhance Photo</span>
                  </button>
                )}

                {enhancedImage && (
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Enhanced</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;