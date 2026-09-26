"use server";

import { revalidatePath } from "next/cache";

import { PROFILE_IMAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { removeImage } from "@/lib/storage";
import { fieldErrors, profileSchema } from "@/lib/validation";

export type ProfileFormState = {
  errors?: Record<string, string>;
  message?: string | null;
  success?: boolean;
};

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    bio: formData.get("bio") ?? "",
    avatarUrl: formData.get("avatarUrl") || null,
    avatarPath: formData.get("avatarPath") || null,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You need to be signed in." };
  }

  // The PREVIOUS avatar path has to come from the database -- the form only
  // knows about the newly chosen image.
  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  const newAvatarUrl = parsed.data.avatarUrl || null;
  const newAvatarPath = parsed.data.avatarPath || null;
  const oldAvatarPath = existing?.avatar_path ?? null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      bio: parsed.data.bio ? parsed.data.bio : null,
      avatar_url: newAvatarUrl,
      avatar_path: newAvatarPath,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[profile] update failed:", error.message);
    return { message: error.message };
  }

  // Only once the row points at the new image is the old one safe to delete.
  if (oldAvatarPath && oldAvatarPath !== newAvatarPath) {
    await removeImage(supabase, PROFILE_IMAGE_BUCKET, oldAvatarPath);
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true, message: "Profile updated." };
}
