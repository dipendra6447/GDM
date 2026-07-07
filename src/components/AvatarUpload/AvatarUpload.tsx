"use client";
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import imageCompression from 'browser-image-compression';
import 'react-image-crop/dist/ReactCrop.css';
import './AvatarUpload.css';

interface Props {
  currentAvatarUrl?: string;
  onCropComplete: (blob: Blob) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function AvatarUpload({ currentAvatarUrl, onCropComplete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 1;

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    let imageToProcess = file;

    try {
      // Compress automatically if the file is greater than MAX_SIZE_MB
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        const options = {
          maxSizeMB: MAX_SIZE_MB,
          maxWidthOrHeight: 1024, // Reasonable size for an avatar cropper
          useWebWorker: true,
        };
        imageToProcess = await imageCompression(file, options);
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result as string);
        setModalOpen(true);
      };
      reader.readAsDataURL(imageToProcess);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setError('Failed to process image. Please try a different one.');
    } finally {
      // Reset input so same file can be re-selected if they cancel
      e.target.value = '';
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setCrop(centerAspectCrop(naturalWidth, naturalHeight, 1));
  };

  const handleCropConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY,
    };

    const OUTPUT_SIZE = 300;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, OUTPUT_SIZE, OUTPUT_SIZE
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      onCropComplete(blob);
      setModalOpen(false);
      setImgSrc('');
    }, 'image/jpeg', 0.92);
  }, [completedCrop, onCropComplete]);

  return (
    <>
      {/* Avatar Display + Trigger */}
      <div className="avatar-upload-wrapper">
        <div className="avatar-preview-ring">
          {currentAvatarUrl ? (
            <img src={currentAvatarUrl} alt="Profile" className="avatar-preview-img" />
          ) : (
            <div className="avatar-preview-placeholder">
              <i className="bi bi-person-fill"></i>
            </div>
          )}
          <button
            type="button"
            className="avatar-edit-badge"
            onClick={() => inputRef.current?.click()}
            aria-label="Upload profile photo"
          >
            <i className="bi bi-camera-fill"></i>
          </button>
        </div>
        <div className="avatar-upload-meta">
          <p className="avatar-upload-hint">JPG, PNG (Auto-compressed if large)</p>
          {error && <p className="avatar-upload-error">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Crop Modal */}
      {modalOpen && (
        <div className="avatar-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="avatar-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h4>Crop Your Photo</h4>
              <button type="button" className="avatar-modal-close" onClick={() => setModalOpen(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="avatar-modal-body">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                minWidth={50}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '60vh', maxWidth: '100%', borderRadius: '8px' }}
                />
              </ReactCrop>
            </div>
            <div className="avatar-modal-footer">
              <button type="button" className="avatar-modal-cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="avatar-modal-confirm" onClick={handleCropConfirm} disabled={!completedCrop}>
                <i className="bi bi-check2 me-2"></i>Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
