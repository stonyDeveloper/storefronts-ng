"use client";

import { useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Link as LinkIcon } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "storefronts";
const cloudinaryReady = !!cloudName && cloudName !== "placeholder";

export function ImageUploader({ images, onChange, error }: Props) {
  const [urlInput, setUrlInput] = useState("");
  const [urlMode, setUrlMode] = useState(false);

  function addImage(url: string) {
    if (!url.trim() || images.includes(url.trim())) return;
    onChange([...images, url.trim()]);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveToFront(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  function handleUrlAdd() {
    if (!urlInput.trim()) return;
    addImage(urlInput.trim());
    setUrlInput("");
    setUrlMode(false);
  }

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={url + i}
              className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200"
            >
              <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-zinc-900/80 text-white px-1.5 py-0.5 rounded-md font-medium">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-zinc-700" />
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => moveToFront(i)}
                  className="absolute bottom-1 right-1 text-[9px] bg-white/90 text-zinc-700 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                >
                  Set cover
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload controls */}
      {images.length < 8 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {cloudinaryReady ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                options={{ multiple: true, maxFiles: 8 - images.length, resourceType: "image" }}
                onSuccess={(results) => {
                  const info = results.info as Record<string, unknown> | undefined;
                  const url = info?.secure_url as string | undefined;
                  if (url) addImage(url);
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Upload images
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-zinc-200 rounded-xl text-sm text-zinc-400">
                <ImagePlus className="w-4 h-4" />
                Add Cloudinary keys to enable upload
              </div>
            )}

            <button
              type="button"
              onClick={() => setUrlMode((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Add by URL
            </button>
          </div>

          {urlMode && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlAdd())}
                placeholder="https://..."
                autoFocus
                className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
              />
              <button
                type="button"
                onClick={handleUrlAdd}
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-zinc-800 transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {images.length === 0 && (
        <p className="text-xs text-zinc-400">
          Add at least one image. The first image is the cover shown in your store.
        </p>
      )}
    </div>
  );
}
