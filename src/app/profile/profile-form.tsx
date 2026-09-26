"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfileAction, type ProfileFormState } from "@/app/actions/profile";
import { ImageUpload } from "@/components/recipes/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_IMAGE_BUCKET } from "@/lib/constants";

type ProfileFormProps = {
  userId: string;
  fullName: string;
  bio: string;
  avatarUrl: string | null;
  avatarPath: string | null;
};

export function ProfileForm({
  userId,
  fullName,
  bio,
  avatarUrl,
  avatarPath,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    {},
  );
  const errors = state.errors ?? {};
  const [editing, setEditing] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    if (state.success && !notified.current) {
      notified.current = true;
      toast.success(state.message ?? "Profile updated.");
      setEditing(false);
    }
    if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  if (!editing) {
    return (
      <Button type="button" variant="outline" onClick={() => setEditing(true)}>
        Edit profile
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="max-w-sm">
        <ImageUpload
          userId={userId}
          initialUrl={avatarUrl}
          initialPath={avatarPath}
          bucket={PROFILE_IMAGE_BUCKET}
          label="Profile photo"
          urlFieldName="avatarUrl"
          pathFieldName="avatarPath"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={fullName}
          maxLength={80}
          required
          aria-invalid={Boolean(errors.fullName)}
        />
        {errors.fullName ? (
          <p className="text-sm text-destructive">{errors.fullName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          rows={3}
          maxLength={300}
          placeholder="What do you like to cook?"
        />
        {errors.bio ? (
          <p className="text-sm text-destructive">{errors.bio}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="gap-2">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setEditing(false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
