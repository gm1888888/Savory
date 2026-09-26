"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_IMAGE_BYTES, RECIPE_IMAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/storage";
import { validateImageFile } from "@/lib/validation";

type ImageUploadProps = {
  userId: string;
  initialUrl?: string | null;
  initialPath?: string | null;
  bucket?: string;
  label?: string;
  /** Form field names for the resulting URL and storage path. */
  urlFieldName?: string;
  pathFieldName?: string;
};

/**
 * Uploads straight from the browser to Supabase Storage, then hands the
 * resulting URL and object path to the form via hidden inputs. Going direct
 * keeps large files out of the Server Action request body, and the storage
 * RLS policy still restricts writes to the user own folder.
 */
export function ImageUpload({
  userId,
  initialUrl = null,
  initialPath = null,
  bucket = RECIPE_IMAGE_BUCKET,
  label = "Recipe photo",
  urlFieldName = "imageUrl",
  pathFieldName = "imagePath",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [path, setPath] = useState<string | null>(initialPath);
  const [uploading, setUploading] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const result = await uploadImage(supabase, bucket, userId, file);
      setUrl(result.publicUrl);
      setPath(result.path);
      toast.success("Photo uploaded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload that image.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function clearImage() {
    setUrl(null);
    setPath(null);
  }

  const maxMb = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0);

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>

      <input type="hidden" name={urlFieldName} value={url ?? ""} />
      <input type="hidden" name={pathFieldName} value={path ?? ""} />

      {url ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted">
          <Image src={url} alt="Selected recipe photo" fill className="object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={clearImage}
            className="absolute right-2 top-2 size-8 bg-background/90 backdrop-blur-sm"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Remove photo</span>
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-warm-wash text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="size-7 animate-spin" aria-hidden="true" />
              <span className="text-sm font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <ImagePlus className="size-7" aria-hidden="true" />
              <span className="text-sm font-medium">Click to upload a photo</span>
              <span className="text-xs">JPG, PNG or WEBP, up to {maxMb} MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="sr-only"
        aria-label="Choose a photo to upload"
      />

      {url ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Replace photo"}
        </Button>
      ) : null}
    </div>
  );
}
