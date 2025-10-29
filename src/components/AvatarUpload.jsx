import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Alert } from '@mantine/core';
import defaultAvatar from '../assets/defaultAvatar.jpg';
import ActionButton from './ActionButton';

const AvatarUpload = () => {
  const { profile, updateAvatar } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avatar = profile?.avatarUrl || defaultAvatar;

  return (
    <>
      {/* Avatar Button */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-transform hover:scale-105 w-24 h-24 md:w-40 md:h-40"
      >
        <img
          src={avatar}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Avatar"
        centered
        overlayProps={{ opacity: 0.5, blur: 4 }}
      >
        <div className="flex flex-col items-center gap-4 p-4">

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

         
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Choose Image
          </button>

         
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 md:w-40 md:h-40 rounded-[8px] object-cover border border-gray-200 shadow"
            />
          )}

          {/* Upload Action */}
          <ActionButton
            onClick={handleUpload}
            loading={loading}
            disabled={!selectedFile}
            className="w-full"
          >
            Upload Avatar
          </ActionButton>

          {/* Error Message */}
          {error && <Alert color="red" className="w-full">{error}</Alert>}
        </div>
      </Modal>
    </>
  );
};

export default AvatarUpload;
