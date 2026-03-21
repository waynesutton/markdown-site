import { useState, useRef, useCallback, useEffect } from "react";
import { useConvex, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  X,
  Upload,
  CloudArrowUp,
  Warning,
  Image as ImageIcon,
  Images,
  ArrowsOut,
  Check,
} from "@phosphor-icons/react";

// Derive the .site URL from Convex URL for uploads
const getSiteUrl = () => {
  const explicitSiteUrl =
    (import.meta.env.VITE_CONVEX_SITE_URL as string | undefined) ||
    (import.meta.env.VITE_SITE_URL as string | undefined);
  if (explicitSiteUrl) {
    return explicitSiteUrl;
  }
  const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "";
  return convexUrl.replace(/\.cloud$/, ".site");
};

// Size presets for image insertion
const SIZE_PRESETS = [
  { id: "original", label: "Original", width: null, height: null },
  { id: "large", label: "Large", width: 1200, height: null },
  { id: "medium", label: "Medium", width: 800, height: null },
  { id: "small", label: "Small", width: 400, height: null },
  { id: "thumbnail", label: "Thumbnail", width: 200, height: null },
  { id: "custom", label: "Custom", width: null, height: null },
] as const;

type SizePreset = typeof SIZE_PRESETS[number]["id"];

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

interface ImageInfo {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export function ImageUploadModal({ isOpen, onClose, onInsert }: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [sizePreset, setSizePreset] = useState<SizePreset>("original");
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convex = useConvex();

  const uploadSettings = useQuery(api.media.getUploadSettings);
  const mediaProvider = uploadSettings?.provider ?? "convex";
  const commitFile = useMutation(api.files.commitFile);
  const generateDirectUploadUrl = useMutation(api.media.generateDirectUploadUrl);
  const generateR2UploadUrl = useMutation(api.r2.generateUploadUrl);
  const syncR2Metadata = useMutation(api.r2.syncMetadata);
  // Note: api.files.isConfigured checks Bunny CDN status but browsing only requires convexfs provider

  const { results: mediaFiles, status: mediaStatus, loadMore } = usePaginatedQuery(
    api.files.listFiles,
    { prefix: "/uploads/" },
    { initialNumItems: 12 }
  );

  const siteUrl = getSiteUrl();
  const cdnHostname = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;

  // Reset state when modal closes
  const handleClose = () => {
    setPreview(null);
    setAltText("");
    setSelectedImage(null);
    setError(null);
    setSizePreset("original");
    setCustomWidth(null);
    setCustomHeight(null);
    setActiveTab("upload");
    onClose();
  };

  // Get CDN URL for a file
  const getCdnUrl = useCallback(
    (path: string, blobId: string) => {
      if (cdnHostname) {
        return `https://${cdnHostname}${path}`;
      }
      return `${siteUrl}/fs/blobs/${blobId}`;
    },
    [cdnHostname, siteUrl],
  );

  // Get image dimensions from URL
  const getImageDimensionsFromUrl = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  // Get image dimensions from file
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Calculate display dimensions based on preset
  const getDisplayDimensions = useCallback(() => {
    if (!selectedImage) return { width: 0, height: 0 };

    const { width: origWidth, height: origHeight } = selectedImage;
    const aspectRatio = origWidth / origHeight;

    if (sizePreset === "original") {
      return { width: origWidth, height: origHeight };
    }

    if (sizePreset === "custom") {
      if (customWidth && customHeight) {
        return { width: customWidth, height: customHeight };
      }
      if (customWidth) {
        return { width: customWidth, height: Math.round(customWidth / aspectRatio) };
      }
      if (customHeight) {
        return { width: Math.round(customHeight * aspectRatio), height: customHeight };
      }
      return { width: origWidth, height: origHeight };
    }

    const preset = SIZE_PRESETS.find((p) => p.id === sizePreset);
    if (preset?.width) {
      const newWidth = Math.min(preset.width, origWidth);
      return { width: newWidth, height: Math.round(newWidth / aspectRatio) };
    }

    return { width: origWidth, height: origHeight };
  }, [selectedImage, sizePreset, customWidth, customHeight]);

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    setUploadProgress("Uploading...");

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File exceeds 10MB limit");
      }

      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      let url = "";

      if (mediaProvider === "convexfs") {
        // Upload blob to ConvexFS endpoint
        const res = await fetch(`${siteUrl}/fs/upload`, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Upload failed: ${res.status}`);
        }

        const { blobId } = await res.json();

        // Commit file to storage path
        const result = await commitFile({
          blobId,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          width: dimensions.width,
          height: dimensions.height,
        });
        url = getCdnUrl(result.path, blobId);
      } else if (mediaProvider === "r2") {
        // Upload file to R2 using signed URL flow.
        const { key, url: signedUploadUrl } = await generateR2UploadUrl({});
        const uploadRes = await fetch(signedUploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) {
          throw new Error(`R2 upload failed: ${uploadRes.status}`);
        }
        await syncR2Metadata({ key });
        const metadata = await convex.query(api.r2.getMetadata, { key });
        if (!metadata?.url) {
          throw new Error("R2 upload succeeded but URL is unavailable");
        }
        url = metadata.url;
      } else {
        // Default direct Convex storage upload path.
        const uploadUrl = await generateDirectUploadUrl({});
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.status}`);
        }
        const { storageId } = await uploadRes.json();
        const storageUrl = await convex.query(api.media.getDirectStorageUrl, { storageId });
        if (!storageUrl) {
          throw new Error("Upload succeeded but URL is unavailable");
        }
        url = storageUrl;
      }

      setSelectedImage({
        url,
        width: dimensions.width,
        height: dimensions.height,
        filename: file.name,
      });
      setUploadProgress(null);
    } catch (err) {
      console.error("[ImageUploadModal] Upload error:", err);
      setError((err as Error).message);
      setPreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [
    commitFile,
    convex,
    generateDirectUploadUrl,
    generateR2UploadUrl,
    getCdnUrl,
    mediaProvider,
    siteUrl,
    syncR2Metadata,
  ]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  // Handle selecting from media library
  const handleSelectFromLibrary = async (file: { path: string; blobId: string; size: number }) => {
    const url = getCdnUrl(file.path, file.blobId);
    const filename = file.path.split("/").pop() || "image";

    // Get dimensions from URL
    const dimensions = await getImageDimensionsFromUrl(url);

    setSelectedImage({
      url,
      width: dimensions.width,
      height: dimensions.height,
      filename,
    });
    setPreview(url);
    setAltText(filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  // Generate markdown with size
  const generateMarkdown = () => {
    if (!selectedImage) return "";

    const dims = getDisplayDimensions();
    const alt = altText || "image";

    // For original size, just use standard markdown
    if (sizePreset === "original") {
      return `![${alt}](${selectedImage.url})`;
    }

    // For other sizes, use HTML img tag with explicit dimensions
    return `<img src="${selectedImage.url}" alt="${alt}" width="${dims.width}" height="${dims.height}" />`;
  };

  // Insert markdown
  const handleInsert = () => {
    if (selectedImage) {
      const markdown = generateMarkdown();
      onInsert(markdown);
      handleClose();
    }
  };

  // Update custom dimensions when preset changes
  useEffect(() => {
    if (sizePreset !== "custom" && selectedImage) {
      const dims = getDisplayDimensions();
      setCustomWidth(dims.width);
      setCustomHeight(dims.height);
    }
  }, [sizePreset, selectedImage, getDisplayDimensions]);

  if (!isOpen) return null;

  const displayDims = getDisplayDimensions();

  return (
    <div className="image-upload-modal-backdrop" onClick={handleClose}>
      <div
        className="image-upload-modal image-upload-modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="image-upload-modal-header">
          <h3>
            <ImageIcon size={20} />
            Insert Image
          </h3>
          <button className="image-upload-modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="image-upload-tabs">
          <button
            className={`image-upload-tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload size={16} />
            Upload New
          </button>
          <button
            className={`image-upload-tab ${activeTab === "library" ? "active" : ""}`}
            onClick={() => setActiveTab("library")}
            disabled={mediaProvider !== "convexfs"}
          >
            <Images size={16} />
            Media Library
          </button>
        </div>

        <div className="image-upload-modal-content">
          {/* Error message */}
          {error && (
            <div className="image-upload-error">
              <Warning size={16} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "upload" && !selectedImage && (
            <div
              className={`image-upload-dropzone ${dragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {uploading ? (
                <>
                  <CloudArrowUp size={48} className="spinning" />
                  <p>{uploadProgress}</p>
                </>
              ) : (
                <>
                  <Upload size={48} />
                  <p>
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <span>PNG, JPG, GIF, WebP up to 10MB</span>
                </>
              )}
            </div>
          )}

          {activeTab === "library" && !selectedImage && (
            <div className="image-upload-library">
              {mediaProvider !== "convexfs" ? (
                <div className="image-upload-library-empty">
                  <Warning size={32} />
                  <p>Media library browsing requires convexfs provider</p>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="image-upload-library-empty">
                  <Images size={32} />
                  <p>No images in library</p>
                  <button onClick={() => setActiveTab("upload")}>Upload an image</button>
                </div>
              ) : (
                <>
                  <div className="image-upload-library-grid">
                    {mediaFiles.map((file) => (
                      <div
                        key={file.path}
                        className="image-upload-library-item"
                        onClick={() => handleSelectFromLibrary(file)}
                      >
                        <img
                          src={getCdnUrl(file.path, file.blobId)}
                          alt={file.path.split("/").pop()}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  {mediaStatus === "CanLoadMore" && (
                    <button
                      className="image-upload-library-loadmore"
                      onClick={() => loadMore(12)}
                    >
                      Load more
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Preview and settings when image is selected */}
          {selectedImage && (
            <div className="image-upload-selected">
              <div className="image-upload-preview-container">
                <div className="image-upload-preview">
                  <img src={preview || selectedImage.url} alt="Preview" />
                  {uploading && (
                    <div className="image-upload-preview-loading">
                      <CloudArrowUp size={32} className="spinning" />
                      <span>{uploadProgress}</span>
                    </div>
                  )}
                </div>
                <div className="image-upload-dimensions">
                  <ArrowsOut size={14} />
                  <span>
                    {selectedImage.width} x {selectedImage.height}px
                    {sizePreset !== "original" && (
                      <> → {displayDims.width} x {displayDims.height}px</>
                    )}
                  </span>
                </div>
              </div>

              <div className="image-upload-settings">
                {/* Alt text input */}
                <div className="image-upload-field">
                  <label htmlFor="alt-text">Alt text</label>
                  <input
                    id="alt-text"
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                  />
                </div>

                {/* Size presets */}
                <div className="image-upload-field">
                  <label>Size</label>
                  <div className="image-upload-size-presets">
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        className={`image-upload-size-btn ${sizePreset === preset.id ? "active" : ""}`}
                        onClick={() => setSizePreset(preset.id)}
                      >
                        {sizePreset === preset.id && <Check size={12} />}
                        {preset.label}
                        {preset.width && <span className="size-hint">{preset.width}px</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom dimensions */}
                {sizePreset === "custom" && (
                  <div className="image-upload-custom-size">
                    <div className="image-upload-field-inline">
                      <label>Width</label>
                      <input
                        type="number"
                        value={customWidth || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || null;
                          setCustomWidth(val);
                          if (val && selectedImage) {
                            const ratio = selectedImage.width / selectedImage.height;
                            setCustomHeight(Math.round(val / ratio));
                          }
                        }}
                        placeholder="Auto"
                      />
                      <span>px</span>
                    </div>
                    <div className="image-upload-field-inline">
                      <label>Height</label>
                      <input
                        type="number"
                        value={customHeight || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || null;
                          setCustomHeight(val);
                          if (val && selectedImage) {
                            const ratio = selectedImage.width / selectedImage.height;
                            setCustomWidth(Math.round(val * ratio));
                          }
                        }}
                        placeholder="Auto"
                      />
                      <span>px</span>
                    </div>
                  </div>
                )}

                {/* Change image button */}
                <button
                  className="image-upload-change"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreview(null);
                  }}
                >
                  Choose different image
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="image-upload-modal-footer">
          <button className="image-upload-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="image-upload-insert"
            onClick={handleInsert}
            disabled={!selectedImage || uploading}
          >
            {uploading ? "Uploading..." : "Insert"}
          </button>
        </div>
      </div>
    </div>
  );
}
