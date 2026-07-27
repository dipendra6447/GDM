"use client";
import React, { useState, useEffect } from 'react';
import './CollageMaker.css';

interface CollageMakerProps {
  files: (File | null)[];
  onFilesChange: (files: (File | null)[]) => void;
  urls?: string[];
  onUrlsChange?: (urls: string[]) => void;
  positions?: string[];
  onPositionsChange?: (positions: string[]) => void;
}

const EMPTY_URLS: string[] = [];
const DEFAULT_POSITIONS: string[] = ['50% 50%', '50% 50%', '50% 50%'];

// Client-side image compression helper to optimize high-res uploads
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // If file is already small (< 800KB), return as is
    if (file.size < 800 * 1024) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1200; // max dimension for web promotional cards
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/webp',
        0.82
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
};

export default function CollageMaker({
  files,
  onFilesChange,
  urls = EMPTY_URLS,
  onUrlsChange,
  positions = DEFAULT_POSITIONS,
  onPositionsChange,
}: CollageMakerProps) {
  const [objectUrls, setObjectUrls] = useState<string[]>(['', '', '']);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [internalPositions, setInternalPositions] = useState<string[]>(positions.length >= 3 ? positions : DEFAULT_POSITIONS);

  useEffect(() => {
    if (positions && positions.length >= 3) {
      setInternalPositions(positions);
    }
  }, [positions]);

  useEffect(() => {
    const newUrls = files.map((file) => (file ? URL.createObjectURL(file) : ''));
    setObjectUrls(newUrls);

    return () => {
      newUrls.forEach((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const updatePosition = (index: number, newPos: string) => {
    const next = [...internalPositions];
    next[index] = newPos;
    setInternalPositions(next);
    if (onPositionsChange) onPositionsChange(next);
  };

  const formatUrl = (u?: string) => {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')) return u;
    return `/${u}`;
  };

  const previews = [
    objectUrls[0] || formatUrl(urls[0]),
    objectUrls[1] || formatUrl(urls[1]),
    objectUrls[2] || formatUrl(urls[2]),
  ];

  const handleFileSelect = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (!selected) return;

    try {
      setCompressing(true);
      const compressed = await compressImage(selected);
      const nextFiles = [...files];
      nextFiles[index] = compressed;
      onFilesChange(nextFiles);
    } catch (err) {
      console.error('Image compression failed, using original', err);
      const nextFiles = [...files];
      nextFiles[index] = selected;
      onFilesChange(nextFiles);
    } finally {
      setCompressing(false);
    }
  };

  const handleClearSlot = (index: number) => {
    const nextFiles = [...files];
    nextFiles[index] = null;
    onFilesChange(nextFiles);

    if (onUrlsChange && urls.length > index) {
      const nextUrls = [...urls];
      nextUrls[index] = '';
      onUrlsChange(nextUrls);
    }
  };

  const swapSlots = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || fromIdx >= 3 || toIdx < 0 || toIdx >= 3 || fromIdx === toIdx) return;
    
    // Swap files array
    const nextFiles = [...files];
    const tempFile = nextFiles[fromIdx];
    nextFiles[fromIdx] = nextFiles[toIdx];
    nextFiles[toIdx] = tempFile;
    onFilesChange(nextFiles);

    // Swap URLs array if present
    if (onUrlsChange && urls.length > 0) {
      const nextUrls = [...urls];
      const tempUrl = nextUrls[fromIdx] || '';
      nextUrls[fromIdx] = nextUrls[toIdx] || '';
      nextUrls[toIdx] = tempUrl;
      onUrlsChange(nextUrls);
    }

    // Swap positions array
    const nextPos = [...internalPositions];
    const tempPos = nextPos[fromIdx] || '50% 50%';
    nextPos[fromIdx] = nextPos[toIdx] || '50% 50%';
    nextPos[toIdx] = tempPos;
    setInternalPositions(nextPos);
    if (onPositionsChange) onPositionsChange(nextPos);
  };

  const activeCount = previews.filter(Boolean).length;

  return (
    <div className="collage-maker-root">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>
          <i className="bi bi-arrows-move text-primary me-2" />
          Campaign Banner Collage Maker (3 Image Positions)
        </label>
        <div className="d-flex align-items-center gap-2">
          {compressing && (
            <span className="spinner-border spinner-border-sm text-primary" role="status" />
          )}
          <span className="badge bg-primary-subtle text-primary fw-semibold" style={{ borderRadius: '50px' }}>
            {activeCount}/3 Images Selected
          </span>
        </div>
      </div>

      <p className="text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
        Upload up to 3 images and use the position adjustment arrows (<i className="bi bi-arrow-left" /> / <i className="bi bi-arrow-right" />) to move or swap images between the Main Hero and Side positions. High-res photos are automatically web-optimized.
      </p>

      {/* THREE IMAGE UPLOAD SLOTS WITH INDIVIDUAL POSITION CONTROLS */}
      <div className="row g-2 mb-3">
        {[0, 1, 2].map((slotIdx) => {
          const slotLabel = slotIdx === 0 ? 'Image 1 (Main Hero)' : slotIdx === 1 ? 'Image 2 (Top Stack)' : 'Image 3 (Bottom Stack)';
          const hasImage = Boolean(previews[slotIdx]);

          return (
            <div className="col-md-4" key={slotIdx}>
              <div className={`collage-upload-slot ${hasImage ? 'has-img' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  id={`collage-slot-${slotIdx}`}
                  className="collage-file-input"
                  onChange={(e) => handleFileSelect(slotIdx, e)}
                  disabled={compressing}
                />
                
                {hasImage ? (
                  <div className="collage-slot-preview">
                    <img 
                      src={previews[slotIdx]} 
                      alt={`Slot ${slotIdx + 1}`} 
                      style={{ objectFit: 'cover', objectPosition: internalPositions[slotIdx] || '50% 50%' }}
                    />

                    {/* Quick Move / Position Adjustment Bar */}
                    <div className="collage-position-controls">
                      {slotIdx > 0 && (
                        <button
                          type="button"
                          className="collage-pos-btn"
                          onClick={() => swapSlots(slotIdx, slotIdx - 1)}
                          title={`Move to ${slotIdx - 1 === 0 ? 'Main Hero' : `Side ${slotIdx - 1}`}`}
                        >
                          <i className="bi bi-arrow-left-short" />
                        </button>
                      )}
                      
                      {slotIdx < 2 && (
                        <button
                          type="button"
                          className="collage-pos-btn"
                          onClick={() => swapSlots(slotIdx, slotIdx + 1)}
                          title={`Move to Side ${slotIdx + 1}`}
                        >
                          <i className="bi bi-arrow-right-short" />
                        </button>
                      )}
                    </div>

                    {/* In-Frame Focal Point Alignment Toolbar */}
                    <div className="collage-focal-toolbar">
                      <button
                        type="button"
                        className={`collage-focal-btn ${internalPositions[slotIdx] === '50% 0%' ? 'active' : ''}`}
                        onClick={() => updatePosition(slotIdx, '50% 0%')}
                        title="Align Top"
                      >
                        <i className="bi bi-arrow-up" />
                      </button>
                      <button
                        type="button"
                        className={`collage-focal-btn ${internalPositions[slotIdx] === '50% 50%' ? 'active' : ''}`}
                        onClick={() => updatePosition(slotIdx, '50% 50%')}
                        title="Align Center"
                      >
                        <i className="bi bi-crosshair" />
                      </button>
                      <button
                        type="button"
                        className={`collage-focal-btn ${internalPositions[slotIdx] === '50% 100%' ? 'active' : ''}`}
                        onClick={() => updatePosition(slotIdx, '50% 100%')}
                        title="Align Bottom"
                      >
                        <i className="bi bi-arrow-down" />
                      </button>
                      <button
                        type="button"
                        className={`collage-focal-btn ${internalPositions[slotIdx] === '0% 50%' ? 'active' : ''}`}
                        onClick={() => updatePosition(slotIdx, '0% 50%')}
                        title="Align Left"
                      >
                        <i className="bi bi-arrow-left" />
                      </button>
                      <button
                        type="button"
                        className={`collage-focal-btn ${internalPositions[slotIdx] === '100% 50%' ? 'active' : ''}`}
                        onClick={() => updatePosition(slotIdx, '100% 50%')}
                        title="Align Right"
                      >
                        <i className="bi bi-arrow-right" />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      className="collage-slot-remove"
                      onClick={() => handleClearSlot(slotIdx)}
                      title="Remove image"
                    >
                      <i className="bi bi-x-lg" />
                    </button>

                    <span className="collage-slot-tag">{slotIdx === 0 ? 'Main Hero' : `Side ${slotIdx}`}</span>
                  </div>
                ) : (
                  <label htmlFor={`collage-slot-${slotIdx}`} className="collage-slot-placeholder">
                    <i className="bi bi-cloud-arrow-up fs-3 text-secondary mb-1" />
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.78rem' }}>{slotLabel}</span>
                    <span className="text-secondary" style={{ fontSize: '0.7rem' }}>Click or drop</span>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE COLLAGE PREVIEW BOX */}
      <div className="collage-live-preview-box">
        <span className="preview-heading">
          <i className="bi bi-eye-fill me-1" /> Real-time Collage Grid Preview
        </span>

        <div className="collage-preview-grid">
          {activeCount >= 3 ? (
            <div className="collage-mosaic-preview three-grid">
              <div className="mosaic-main">
                <img src={previews[0]} alt="Main Preview" style={{ objectFit: 'cover', objectPosition: internalPositions[0] || '50% 50%' }} />
              </div>
              <div className="mosaic-stack">
                <div className="mosaic-sub">
                  <img src={previews[1]} alt="Sub 1 Preview" style={{ objectFit: 'cover', objectPosition: internalPositions[1] || '50% 50%' }} />
                </div>
                <div className="mosaic-sub">
                  <img src={previews[2]} alt="Sub 2 Preview" style={{ objectFit: 'cover', objectPosition: internalPositions[2] || '50% 50%' }} />
                </div>
              </div>
            </div>
          ) : activeCount === 2 ? (
            <div className="collage-mosaic-preview two-grid">
              <div className="mosaic-main">
                <img src={previews[0] || previews[1]} alt="Main Preview" style={{ objectFit: 'cover', objectPosition: internalPositions[0] || '50% 50%' }} />
              </div>
              <div className="mosaic-sub">
                <img src={previews[1] || previews[0]} alt="Sub Preview" style={{ objectFit: 'cover', objectPosition: internalPositions[1] || '50% 50%' }} />
              </div>
            </div>
          ) : activeCount === 1 ? (
            <div className="collage-mosaic-preview single-grid">
              <img src={previews.find(Boolean)} alt="Single Preview" style={{ objectFit: 'cover', objectPosition: internalPositions[0] || '50% 50%' }} />
            </div>
          ) : (
            <div className="collage-empty-placeholder">
              <i className="bi bi-grid-3x3-gap text-secondary fs-2 mb-2" />
              <span className="text-secondary fw-medium" style={{ fontSize: '0.85rem' }}>Upload images above to see live collage rendering</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
