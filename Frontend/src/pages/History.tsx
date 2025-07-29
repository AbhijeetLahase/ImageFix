import React, { useEffect, useState } from 'react';
import { Download, Trash2, X, Calendar, Image as ImageIcon } from 'lucide-react';

interface ImageData {
  _id: string;
  cloudinaryUrl: string;
  createdAt: string;
}

const History: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = sessionStorage.getItem('smartphotofix_token');

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/image/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch image history');
      }

      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching image history:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'smartphotofix_image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = sessionStorage.getItem('smartphotofix_token');

      const response = await fetch(`http://localhost:5000/api/image/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response status:", response.status);
      setImages((prevImages) => prevImages.filter((img) => img._id !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (image: ImageData) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
      <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="flex gap-2">
        <div className="bg-gray-200 rounded h-8 w-20"></div>
        <div className="bg-gray-200 rounded h-8 w-20"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Image History</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            View and manage all your enhanced images in one beautiful gallery
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                <LoadingSkeleton />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Images Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Start enhancing your photos to see them appear in your history gallery
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image._id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.cloudinaryUrl}
                    alt="Enhanced"
                    className="w-full h-64 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => openModal(image)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 cursor-pointer flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <ImageIcon className="w-6 h-6 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(image.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(image.cloudinaryUrl)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      disabled={deletingId === image._id}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:cursor-not-allowed"
                    >
                      {deletingId === image._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div 
              className="relative max-w-4xl max-h-full bg-white rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full transition-all duration-200 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              
              <img
                src={selectedImage.cloudinaryUrl}
                alt="Enhanced - Full Size"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(selectedImage.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(selectedImage.cloudinaryUrl)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedImage._id);
                        closeModal();
                      }}
                      disabled={deletingId === selectedImage._id}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow disabled:cursor-not-allowed"
                    >
                      {deletingId === selectedImage._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;