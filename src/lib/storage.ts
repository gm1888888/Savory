import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { ACCEPTED_IMAGE_EXTENSIONS } from "@/lib/constants";

export type UploadResult = { path: string; publicUrl: string };

/**
 * Uploads an image into `<bucket>/<userId>/<random>.<ext>`.
 *
 * The leading folder is the user's id because the storage RLS policies derive
 * ownership from it -- see `supabase/schema.sql`. Uploading anywhere else is
 * rejected by the database, not just by this function.
 */
export async function uploadImage(
  supabase: SupabaseClient<Database>,
  bucket: string,
  userId: string,
  file: File,
): Promise<UploadResult> {
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ext = ACCEPTED_IMAGE_EXTENSIONS.includes(rawExt) ? rawExt : "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { path, publicUrl };
}

/**
 * Best-effort removal of a stored object.
 *
 * Deleting the blob is secondary to deleting the row: if storage cleanup
 * fails we log it and carry on rather than leaving the user with a recipe
 * they cannot delete. The worst case is an orphaned file.
 */
export async function removeImage(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string | null | undefined,
): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`[storage] could not remove ${bucket}/${path}:`, error.message);
  }
}
