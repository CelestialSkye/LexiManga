import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import Cropper from 'react-easy-crop';
import { useCallback, useState } from 'react';

const BannerCropModal = ({ opened, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropChange = useCallback((newCrop) => {
    setCrop(newCrop);
  }, []);

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsProcessing(true);
    try {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          onCropComplete(blob);
          onClose();
          setIsProcessing(false);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
        }, 'image/jpeg', 0.95);
      };
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsProcessing(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Crop Banner" centered size="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Drag to move • Scroll to zoom • Select the area you want for your banner
        </Text>

        <div style={{ position: 'relative', width: '100%', height: 300, backgroundColor: '#f0f0f0' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9} // Wide banner aspect ratio
            cropShape="rect"
            showGrid={true}
            onCropChange={handleCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={handleZoomChange}
            onMediaLoaded={() => {}}
          />
        </div>

        <div>
          <Text size="xs" fw={500} mb="xs">
            Zoom: {(zoom * 100).toFixed(0)}%
          </Text>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleSaveCrop} loading={isProcessing} color="violet">
            Crop & Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default BannerCropModal;
