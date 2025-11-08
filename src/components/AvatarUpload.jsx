import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Alert } from '@mantine/core';
import ActionButton from './ActionButton';
import defaultAvatar from '../assets/defaultAvatar.jpg';

const AvatarUpload = () => {
  const { profile, updateAvatar } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const avatar = profile?.avatarUrl || defaultAvatar;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');

    try {
      await updateAvatar(selectedFile);
      setIsModalOpen(false);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // 🧼 reset input
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; // 🔧 reset input
  };

  return (
    <>
      {/* Avatar Display */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer rounded-[16px] overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-transform hover:scale-105 w-24 h-24 md:w-48 md:h-48"
      >
        <img
          src={avatar}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar Upload Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload New Avatar"
        centered
        zIndex={2000}
        overlayProps={{ blur: 6, opacity: 0.5 }}
        radius="lg"
        classNames={{
          title: 'text-xl font-semibold text-gray-800 dark:text-gray-100',
          body: 'p-6 space-y-5',
        }}
      >
        <div className="flex flex-col items-center gap-5">
          {/* File Selector */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[16px] py-8 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition relative"
          >
            <span className="block">📁 Click to choose an image</span>
            <span className="text-sm text-gray-400 mt-1 block">Recommended size: 400×400px</span>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </button>

          {/* Image Preview */}
          {preview ? (
            <div className="relative w-40 h-40">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-[16px] border border-gray-200 dark:border-gray-700 shadow-sm"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="w-40 h-40 flex items-center justify-center rounded-[16px] border border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
              No image selected
            </div>
          )}

          {/* File Details */}
          {selectedFile && (
            <p className="text-gray-500 text-sm text-center">
              {selectedFile.name} • {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          )}

          {/* Error Message */}
          {error && <Alert color="red">{error}</Alert>}

          {/* Upload Button */}
          <ActionButton
            onClick={handleUpload}
            loading={loading}
            disabled={!selectedFile}
            className="w-full px-6 py-3 text-base"
          >
            Upload Avatar
          </ActionButton>
        </div>
      </Modal>
    </>
  );
};

export default AvatarUpload;
