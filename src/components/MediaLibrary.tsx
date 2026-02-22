import { useState, useRef, useCallback, useEffect } from "react";
import { useAction, usePaginatedQuery, useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Image as ImageIcon,
  Upload,
  Trash,
  CopySimple,
  Check,
  Link as LinkIcon,
  Code,
  X,
  Warning,
  CloudArrowUp,
  CheckSquare,
  Square,
  SelectionAll,
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

// File metadata type from ConvexFS
interface FileInfo {
  path: string;
  blobId: string;
  contentType: string;
  size: number;
}

// Copy format options
type CopyFormat = "markdown" | "html" | "url";

// Tracks uploads made via convex/r2 providers (no ConvexFS browsing)
interface RecentUpload {
  id: string;
  filename: string;
  url: string;
  size: number;
}

export function MediaLibrary() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<CopyFormat | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>(() => {
    try {
      const saved = sessionStorage.getItem("media_recent_uploads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist recent uploads to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("media_recent_uploads", JSON.stringify(recentUploads));
    } catch { /* ignore storage errors */ }
  }, [recentUploads]);

  const convex = useConvex();
  const uploadSettings = useQuery(api.media.getUploadSettings);
  const mediaProvider = uploadSettings?.provider ?? "convex";
  // Check if Bunny CDN is configured (server-side check)
  const configStatus = useQuery(api.files.isConfigured);
  const isBunnyConfigured = configStatus?.configured ?? false;

  // Convex hooks
  const commitFile = useAction(api.files.commitFile);
  const generateDirectUploadUrl = useMutation(api.media.generateDirectUploadUrl);
  const resolveDirectUpload = useAction(api.media.resolveDirectUpload);
  const generateR2UploadUrl = useMutation(api.r2.generateUploadUrl);
  const syncR2Metadata = useMutation(api.r2.syncMetadata);
  const deleteFile = useMutation(api.files.deleteFile);
  const deleteFiles = useMutation(api.files.deleteFiles);
  const { results, status, loadMore } = usePaginatedQuery(
    api.files.listFiles,
    { prefix: "/uploads/" },
    { initialNumItems: 20 }
  );

  const siteUrl = getSiteUrl();
  const cdnHostname = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;

  // Get CDN URL for a file
  const getCdnUrl = (file: FileInfo) => {
    // Use the Bunny CDN hostname if configured
    if (cdnHostname) {
      return `https://${cdnHostname}${file.path}`;
    }
    // Fallback to ConvexFS blob URL
    return `${siteUrl}/fs/blobs/${file.blobId}`;
  };

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`);

      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image`);
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 10MB limit`);
        }

        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        if (mediaProvider === "convexfs") {
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

          await commitFile({
            blobId,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            width: dimensions.width,
            height: dimensions.height,
          });
        } else if (mediaProvider === "r2") {
          const { key, url } = await generateR2UploadUrl({});
          const uploadRes = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!uploadRes.ok) {
            throw new Error(`R2 upload failed: ${uploadRes.status}`);
          }
          await syncR2Metadata({ key });
          const metadata = await convex.query(api.r2.getMetadata, { key });
          const resolvedUrl = metadata?.url ?? "";
          if (resolvedUrl) {
            setRecentUploads((prev) => [{
              id: key,
              filename: file.name,
              url: resolvedUrl,
              size: file.size,
            }, ...prev]);
          }
        } else {
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
          const resolvedUrl = await resolveDirectUpload({ storageId });
          if (resolvedUrl) {
            setRecentUploads((prev) => [{
              id: storageId,
              filename: file.name,
              url: resolvedUrl,
              size: file.size,
            }, ...prev]);
          }
        }
      } catch (err) {
        setError((err as Error).message);
        break;
      }
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [
    commitFile,
    convex,
    generateDirectUploadUrl,
    generateR2UploadUrl,
    mediaProvider,
    resolveDirectUpload,
    siteUrl,
    syncR2Metadata,
  ]);

  // Get image dimensions
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

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
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
    handleUpload(e.dataTransfer.files);
  };

  // Copy to clipboard
  const handleCopy = async (file: FileInfo, format: CopyFormat) => {
    const url = getCdnUrl(file);
    const filename = file.path.split("/").pop() || "image";

    let text = "";
    switch (format) {
      case "markdown":
        text = `![${filename}](${url})`;
        break;
      case "html":
        text = `<img src="${url}" alt="${filename}" />`;
        break;
      case "url":
        text = url;
        break;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(file.path);
      setCopiedFormat(format);
      setTimeout(() => {
        setCopiedPath(null);
        setCopiedFormat(null);
      }, 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  // Copy recent upload embed code to clipboard
  const handleCopyRecent = async (upload: RecentUpload, format: CopyFormat) => {
    let text = "";
    switch (format) {
      case "markdown":
        text = `![${upload.filename}](${upload.url})`;
        break;
      case "html":
        text = `<img src="${upload.url}" alt="${upload.filename}" />`;
        break;
      case "url":
        text = upload.url;
        break;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(upload.id);
      setCopiedFormat(format);
      setTimeout(() => {
        setCopiedPath(null);
        setCopiedFormat(null);
      }, 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  // Remove a recent upload from the list
  const dismissRecent = (id: string) => {
    setRecentUploads((prev) => prev.filter((u) => u.id !== id));
  };

  // Delete file
  const handleDelete = async (path: string) => {
    try {
      await deleteFile({ path });
      setDeleteConfirm(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Toggle file selection
  const toggleFileSelection = (path: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Select all files
  const selectAllFiles = () => {
    setSelectedFiles(new Set(results.map((f) => f.path)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFiles(new Set());
    setSelectMode(false);
  };

  // Bulk delete files
  const handleBulkDelete = async () => {
    try {
      await deleteFiles({ paths: Array.from(selectedFiles) });
      setSelectedFiles(new Set());
      setSelectMode(false);
      setBulkDeleteConfirm(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="media-library">
      <div className="media-library-header">
        <ImageIcon size={32} weight="light" />
        <h2>Media Library</h2>
        <p>Upload and manage images for your content</p>
      </div>

      {/* Configuration Status */}
      {mediaProvider === "convexfs" && !isBunnyConfigured && (
        <div className="media-config-warning">
          <Warning size={20} />
          <div>
            <strong>Bunny CDN not configured</strong>
            <p>
              Set BUNNY_API_KEY, BUNNY_STORAGE_ZONE, and BUNNY_CDN_HOSTNAME
              environment variables in Convex Dashboard.
              See <a href="/docs-media-setup">setup guide</a>.
            </p>
          </div>
        </div>
      )}
      {mediaProvider !== "convexfs" && (
        <div className="media-config-warning">
          <Warning size={20} />
          <div>
            <strong>Media library grid uses ConvexFS mode</strong>
            <p>
              Current provider is <code>{mediaProvider}</code>. Upload works, but
              file browsing and bulk delete are available in <code>convexfs</code> mode.
            </p>
          </div>
        </div>
      )}

      {/* Selection toolbar */}
      {results.length > 0 && (
        <div className="media-toolbar">
          <button
            className={`media-toolbar-btn ${selectMode ? "active" : ""}`}
            onClick={() => {
              if (selectMode) {
                clearSelection();
              } else {
                setSelectMode(true);
              }
            }}
          >
            <SelectionAll size={16} />
            <span>{selectMode ? "Cancel" : "Select"}</span>
          </button>
          {selectMode && (
            <>
              <button className="media-toolbar-btn" onClick={selectAllFiles}>
                <CheckSquare size={16} />
                <span>Select All</span>
              </button>
              {selectedFiles.size > 0 && (
                <button
                  className="media-toolbar-btn danger"
                  onClick={() => setBulkDeleteConfirm(true)}
                >
                  <Trash size={16} />
                  <span>Delete ({selectedFiles.size})</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Bulk delete confirmation */}
      {bulkDeleteConfirm && (
        <div className="media-bulk-delete-confirm">
          <Warning size={20} />
          <p>Delete {selectedFiles.size} selected images?</p>
          <div className="media-bulk-delete-actions">
            <button className="cancel" onClick={() => setBulkDeleteConfirm(false)}>
              Cancel
            </button>
            <button className="confirm" onClick={handleBulkDelete}>
              Delete All
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="media-error">
          <Warning size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload zone */}
      <div
        className={`media-upload-zone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {uploading ? (
          <>
            <CloudArrowUp size={48} className="upload-icon spinning" />
            <p>{uploadProgress}</p>
          </>
        ) : (
          <>
            <Upload size={48} className="upload-icon" />
            <p>
              <strong>Click to upload</strong> or drag and drop
            </p>
            <span>PNG, JPG, GIF, WebP up to 10MB</span>
          </>
        )}
      </div>

      {/* Recent uploads for non-convexfs providers */}
      {recentUploads.length > 0 && (
        <div className="media-recent-uploads">
          <h3>Recent uploads</h3>
          <div className="media-grid">
            {recentUploads.map((upload) => (
              <div key={upload.id} className="media-item">
                <div className="media-item-preview">
                  <img
                    src={upload.url}
                    alt={upload.filename}
                    loading="lazy"
                  />
                </div>
                <div className="media-item-info">
                  <span className="media-item-name" title={upload.filename}>
                    {upload.filename}
                  </span>
                  <span className="media-item-size">{formatSize(upload.size)}</span>
                </div>
                <div className="media-item-actions">
                  <button
                    className={`media-copy-btn ${copiedPath === upload.id && copiedFormat === "markdown" ? "copied" : ""}`}
                    onClick={() => handleCopyRecent(upload, "markdown")}
                    title="Copy as Markdown"
                  >
                    {copiedPath === upload.id && copiedFormat === "markdown" ? (
                      <Check size={14} />
                    ) : (
                      <CopySimple size={14} />
                    )}
                    <span>MD</span>
                  </button>
                  <button
                    className={`media-copy-btn ${copiedPath === upload.id && copiedFormat === "html" ? "copied" : ""}`}
                    onClick={() => handleCopyRecent(upload, "html")}
                    title="Copy as HTML"
                  >
                    {copiedPath === upload.id && copiedFormat === "html" ? (
                      <Check size={14} />
                    ) : (
                      <Code size={14} />
                    )}
                    <span>HTML</span>
                  </button>
                  <button
                    className={`media-copy-btn ${copiedPath === upload.id && copiedFormat === "url" ? "copied" : ""}`}
                    onClick={() => handleCopyRecent(upload, "url")}
                    title="Copy URL"
                  >
                    {copiedPath === upload.id && copiedFormat === "url" ? (
                      <Check size={14} />
                    ) : (
                      <LinkIcon size={14} />
                    )}
                    <span>URL</span>
                  </button>
                  <button
                    className="media-delete-btn"
                    onClick={() => dismissRecent(upload.id)}
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File grid */}
      <div className="media-grid">
        {results.map((file) => (
          <div
            key={file.path}
            className={`media-item ${selectMode ? "select-mode" : ""} ${selectedFiles.has(file.path) ? "selected" : ""}`}
            onClick={selectMode ? () => toggleFileSelection(file.path) : undefined}
          >
            {selectMode && (
              <div className="media-item-checkbox">
                {selectedFiles.has(file.path) ? (
                  <CheckSquare size={20} weight="fill" />
                ) : (
                  <Square size={20} />
                )}
              </div>
            )}
            <div className="media-item-preview">
              <img
                src={getCdnUrl(file)}
                alt={file.path.split("/").pop()}
                loading="lazy"
              />
            </div>
            <div className="media-item-info">
              <span className="media-item-name" title={file.path}>
                {file.path.split("/").pop()}
              </span>
              <span className="media-item-size">{formatSize(file.size)}</span>
            </div>
            <div className="media-item-actions">
              <button
                className={`media-copy-btn ${copiedPath === file.path && copiedFormat === "markdown" ? "copied" : ""}`}
                onClick={() => handleCopy(file, "markdown")}
                title="Copy as Markdown"
              >
                {copiedPath === file.path && copiedFormat === "markdown" ? (
                  <Check size={14} />
                ) : (
                  <CopySimple size={14} />
                )}
                <span>MD</span>
              </button>
              <button
                className={`media-copy-btn ${copiedPath === file.path && copiedFormat === "html" ? "copied" : ""}`}
                onClick={() => handleCopy(file, "html")}
                title="Copy as HTML"
              >
                {copiedPath === file.path && copiedFormat === "html" ? (
                  <Check size={14} />
                ) : (
                  <Code size={14} />
                )}
                <span>HTML</span>
              </button>
              <button
                className={`media-copy-btn ${copiedPath === file.path && copiedFormat === "url" ? "copied" : ""}`}
                onClick={() => handleCopy(file, "url")}
                title="Copy URL"
              >
                {copiedPath === file.path && copiedFormat === "url" ? (
                  <Check size={14} />
                ) : (
                  <LinkIcon size={14} />
                )}
                <span>URL</span>
              </button>
              <button
                className="media-delete-btn"
                onClick={() => setDeleteConfirm(file.path)}
                title="Delete"
              >
                <Trash size={14} />
              </button>
            </div>

            {/* Delete confirmation */}
            {deleteConfirm === file.path && (
              <div className="media-delete-confirm">
                <p>Delete this image?</p>
                <div className="media-delete-confirm-actions">
                  <button
                    className="cancel"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm"
                    onClick={() => handleDelete(file.path)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more */}
      {status === "CanLoadMore" && (
        <button className="media-load-more" onClick={() => loadMore(20)}>
          Load more
        </button>
      )}

      {status === "LoadingMore" && (
        <div className="media-loading">Loading...</div>
      )}

      {/* Empty state */}
      {results.length === 0 && recentUploads.length === 0 && status !== "LoadingFirstPage" && (
        <div className="media-empty">
          <ImageIcon size={64} weight="light" />
          <p>No images uploaded yet</p>
          <span>Upload your first image to get started</span>
        </div>
      )}

      {/* Usage info */}
      <div className="media-info">
        <h3>Usage</h3>
        <p>
          Click <strong>MD</strong> to copy markdown image syntax,{" "}
          <strong>HTML</strong> for img tag, or <strong>URL</strong> for direct link.{" "}
          {mediaProvider === "convexfs" && isBunnyConfigured && "Images are served via Bunny CDN for fast global delivery."}
          {mediaProvider === "convexfs" && !isBunnyConfigured && "Images are served via ConvexFS blob storage."}
          {mediaProvider === "r2" && "Images are served via Cloudflare R2 storage."}
          {mediaProvider === "convex" && "Images are served via Convex file storage."}
        </p>
      </div>
    </div>
  );
}
