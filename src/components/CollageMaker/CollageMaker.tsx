"use client";
import React, { useState, useEffect, useRef } from 'react';
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

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (file.size < 800 * 1024) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
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
  const [internalPositions, setInternalPositions] = useState<string[]>(
    positions.length >= 3 ? positions : DEFAULT_POSITIONS
  );

  // Dragging state for direct pan positioning on collage preview
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; posX: number; posY: number } | null>(null);

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

  const parsePercent = (posStr?: string) => {
    if (!posStr) return { x: 50, y: 50 };
    const parts = posStr.split(' ');
    const x = parseInt(parts[0]) || 50;
    const y = parseInt(parts[1]) || 50;
    return { x, y };
  };

  // Mouse & Touch Drag Handlers
  const handleDragStart = (slotIdx: number, clientX: number, clientY: number) => {
    const curr = parsePercent(internalPositions[slotIdx]);
    setDraggingSlot(slotIdx);
    dragStartRef.current = {
      clientX,
      clientY,
      posX: curr.x,
      posY: curr.y,
    };
  };

  const handleDragMove = (slotIdx: number, clientX: number, clientY: number, containerRect: DOMRect) => {
    if (draggingSlot !== slotIdx || !dragStartRef.current) return;
    const deltaX = clientX - dragStartRef.current.clientX;
    const deltaY = clientY - dragStartRef.current.clientY;

    const deltaXPercent = (deltaX / containerRect.width) * 100;
    const deltaYPercent = (deltaY / containerRect.height) * 100;

    let newX = Math.round(dragStartRef.current.posX - deltaXPercent);
    let newY = Math.round(dragStartRef.current.posY - deltaYPercent);

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    updatePosition(slotIdx, `${newX}% ${newY}%`);
  };

  const handleDragEnd = () => {
    setDraggingSlot(null);
    dragStartRef.current = null;
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

    const nextFiles = [...files];
    const tempFile = nextFiles[fromIdx];
    nextFiles[fromIdx] = nextFiles[toIdx];
    nextFiles[toIdx] = tempFile;
    onFilesChange(nextFiles);

    if (onUrlsChange && urls.length > 0) {
      const nextUrls = [...urls];
      const tempUrl = nextUrls[fromIdx] || '';
      nextUrls[fromIdx] = nextUrls[toIdx] || '';
      nextUrls[toIdx] = tempUrl;
      onUrlsChange(nextUrls);
    }

    const nextPos = [...internalPositions];
    const tempPos = nextPos[fromIdx] || '50% 50%';
    nextPos[fromIdx] = nextPos[toIdx] || '50% 50%';
    nextPos[toIdx] = tempPos;
    setInternalPositions(nextPos);
    if (onPositionsChange) onPositionsChange(nextPos);
  };

  const activeCount = previews.filter(Boolean).length;

  const renderDraggableItem = (slotIdx: number, className: string, alt: string) => {
    const imgSrc = previews[slotIdx];
    if (!imgSrc) return null;
    const isDragging = draggingSlot === slotIdx;
    const pos = parsePercent(internalPositions[slotIdx]);

    return (
      <div
        className={`draggable-preview-item ${className} ${isDragging ? 'is-dragging' : ''}`}
        onMouseDown={(e) => handleDragStart(slotIdx, e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (draggingSlot === slotIdx) {
            handleDragMove(slotIdx, e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
          }
        }}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(slotIdx, e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => {
          if (draggingSlot === slotIdx) {
            handleDragMove(slotIdx, e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.getBoundingClientRect());
          }
        }}
        onTouchEnd={handleDragEnd}
        title="Click & Drag to Reposition Image Inside Frame"
      >
        <span className="drag-hint-badge">
          <i className="bi bi-arrows-move" /> X: {pos.x}% Y: {pos.y}%
        </span>
        <img
          src={imgSrc}
          alt={alt}
          style={{ objectFit: 'cover', objectPosition: internalPositions[slotIdx] || '50% 50%' }}
        />
      </div>
    );
  };

  return (
    <div className="collage-maker-root">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label collage-label mb-0">
          <i className="bi bi-arrows-move me-2" style={{ color: '#d4af37' }} />
          Campaign Banner Collage Maker (3 Image Positions)
        </label>
        <div className="d-flex align-items-center gap-2">
          {compressing && <span className="spinner-border spinner-border-sm text-warning" role="status" />}
          <span className="badge bg-gold text-dark font-weight-bold" style={{ borderRadius: '50px' }}>
            {activeCount}/3 Images Selected
          </span>
        </div>
      </div>

      <p className="collage-subtext mb-3">
        Upload up to 3 images. You can <strong>click and drag directly on any image in the preview box</strong> to pan and position it perfectly!
      </p>

      {/* THREE IMAGE UPLOAD SLOTS WITH INDIVIDUAL CONTROLS */}
      <div className="row g-2 mb-3">
        {[0, 1, 2].map((slotIdx) => {
          const slotLabel = slotIdx === 0 ? 'Image 1 (Main Hero)' : slotIdx === 1 ? 'Image 2 (Top Stack)' : 'Image 3 (Bottom Stack)';
          const hasImage = Boolean(previews[slotIdx]);
          const currentPos = parsePercent(internalPositions[slotIdx]);

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

                    {/* Swap Arrows */}
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
                    <i className="bi bi-cloud-arrow-up fs-3 text-warning mb-1" />
                    <span className="collage-slot-placeholder-text">{slotLabel}</span>
                    <span className="collage-subtext" style={{ fontSize: '0.7rem' }}>
                      Click or drop
                    </span>
                  </label>
                )}
              </div>

              {/* 9-Point Alignment Grid & Slider Controls */}
              {hasImage && (
                <div className="focal-control-panel">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="collage-subtext font-weight-bold">Focal Point Alignment</span>
                    <span className="badge bg-dark text-warning border border-secondary" style={{ fontSize: '0.65rem' }}>
                      {currentPos.x}% / {currentPos.y}%
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {/* 9-Point Presets Grid */}
                    <div className="focal-grid-9point">
                      {[
                        { label: '↖', x: 0, y: 0 },
                        { label: '⬆', x: 50, y: 0 },
                        { label: '↗', x: 100, y: 0 },
                        { label: '⬅', x: 0, y: 50 },
                        { label: '⏺', x: 50, y: 50 },
                        { label: '➡', x: 100, y: 50 },
                        { label: '↙', x: 0, y: 100 },
                        { label: '⬇', x: 50, y: 100 },
                        { label: '↘', x: 100, y: 100 },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`focal-grid-btn ${currentPos.x === preset.x && currentPos.y === preset.y ? 'active' : ''}`}
                          onClick={() => updatePosition(slotIdx, `${preset.x}% ${preset.y}%`)}
                          title={`Align ${preset.x}% ${preset.y}%`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Fine-Tuning Sliders */}
                    <div className="flex-grow-1 d-flex flex-direction-column gap-1">
                      <div>
                        <div className="d-flex justify-content-between text-secondary" style={{ fontSize: '0.65rem' }}>
                          <span>Horizontal (X)</span>
                          <span>{currentPos.x}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={currentPos.x}
                          className="form-range"
                          style={{ height: '4px' }}
                          onChange={(e) => updatePosition(slotIdx, `${e.target.value}% ${currentPos.y}%`)}
                        />
                      </div>
                      <div>
                        <div className="d-flex justify-content-between text-secondary" style={{ fontSize: '0.65rem' }}>
                          <span>Vertical (Y)</span>
                          <span>{currentPos.y}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={currentPos.y}
                          className="form-range"
                          style={{ height: '4px' }}
                          onChange={(e) => updatePosition(slotIdx, `${currentPos.x}% ${e.target.value}%`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LIVE COLLAGE PREVIEW BOX WITH DIRECT DRAG-TO-PAN */}
      <div className="collage-live-preview-box">
        <span className="preview-heading">
          <i className="bi bi-arrows-move me-1" /> Real-time Interactive Collage Preview (Drag Any Image To Reposition)
        </span>

        <div className="collage-preview-grid">
          {activeCount >= 3 ? (
            <div className="collage-mosaic-preview three-grid">
              {renderDraggableItem(0, 'mosaic-main', 'Main Preview')}
              <div className="mosaic-stack">
                {renderDraggableItem(1, 'mosaic-sub', 'Sub 1 Preview')}
                {renderDraggableItem(2, 'mosaic-sub', 'Sub 2 Preview')}
              </div>
            </div>
          ) : activeCount === 2 ? (
            <div className="collage-mosaic-preview two-grid">
              {renderDraggableItem(0, 'mosaic-main', 'Main Preview')}
              {renderDraggableItem(1, 'mosaic-sub', 'Sub Preview')}
            </div>
          ) : activeCount === 1 ? (
            <div className="collage-mosaic-preview single-grid">
              {renderDraggableItem(previews.findIndex(Boolean), 'single-grid', 'Single Preview')}
            </div>
          ) : (
            <div className="collage-empty-placeholder">
              <i className="bi bi-grid-3x3-gap text-warning fs-2 mb-2" />
              <span className="collage-subtext" style={{ fontSize: '0.85rem' }}>
                Upload images above to see live collage rendering
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
