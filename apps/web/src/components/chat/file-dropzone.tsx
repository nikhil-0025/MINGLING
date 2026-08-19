"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, File, Image, Music, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface FileDropzoneProps {
  roomId: string;
  onFileShared: (fileUrl: string, fileName: string, mimeType: string) => void;
}

export function FileDropzone({ roomId, onFileShared }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview?.url]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }, []);

  const handleFile = (file: File) => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", preview.file);
      formData.append("roomId", roomId);

      const { data } = await axios.post("/api/v1/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.data?.url) {
        onFileShared(data.data.url, data.data.originalName || preview.file.name, preview.file.type);
      } else {
        // Fallback: convert file to base64 DataURL
        const reader = new FileReader();
        reader.onloadend = () => {
          onFileShared(reader.result as string, preview.file.name, preview.file.type);
        };
        reader.readAsDataURL(preview.file);
      }
      setPreview(null);
    } catch {
      // Fallback base64 conversion on error
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileShared(reader.result as string, preview.file.name, preview.file.type);
        setPreview(null);
      };
      reader.readAsDataURL(preview.file);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-6 w-6 text-sky-400" />;
    if (type.startsWith("audio/")) return <Music className="h-6 w-6 text-purple-400" />;
    return <File className="h-6 w-6 text-zinc-400" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="mb-3 vercel-card p-4 rounded-xl border border-zinc-800 text-white relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {getFileIcon(preview.file.type)}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{preview.file.name}</p>
                <p className="text-[10px] font-mono text-zinc-400">
                  {(preview.file.size / 1024).toFixed(1)} KB • {preview.file.type || "file"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={uploadFile}
                disabled={uploading}
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold h-8 px-3 rounded-lg"
              >
                {uploading ? "Uploading..." : "Share File"}
              </Button>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Upload className="h-4 w-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Upload File Attachment</p>
                <p className="text-[10px] font-mono text-zinc-400">Drag file here or browse from device</p>
              </div>
            </div>

            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileInput} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors">
                <Paperclip className="h-3.5 w-3.5" /> Browse
              </span>
            </label>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
