"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { addCommentAction, deleteCommentAction } from "@/app/actions/interactions";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentWithAuthor } from "@/lib/database.types";
import { formatDate, initialsOf } from "@/lib/format";

type CommentSectionProps = {
  recipeId: string;
  comments: CommentWithAuthor[];
  currentUserId: string | null;
};

export function CommentSection({
  recipeId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await addCommentAction(recipeId, formData);
      if (!result.ok) {
        toast.error(result.message ?? "Could not post your comment.");
        return;
      }
      setValue("");
      formRef.current?.reset();
      toast.success("Comment posted.");
      router.refresh();
    });
  }

  async function handleDelete(commentId: string) {
    const result = await deleteCommentAction(commentId, recipeId);
    if (!result.ok) {
      toast.error(result.message ?? "Could not delete the comment.");
      return;
    }
    toast.success("Comment deleted.");
    router.refresh();
  }

  return (
    <section aria-labelledby="comments-heading" className="scroll-mt-24" id="comments">
      <h2
        id="comments-heading"
        className="flex items-center gap-2 font-heading text-xl font-bold"
      >
        <MessageCircle className="size-5 text-primary" aria-hidden="true" />
        Comments
        <span className="text-base font-normal text-muted-foreground">
          ({comments.length})
        </span>
      </h2>

      {currentUserId ? (
        <form ref={formRef} onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="comment-content" className="sr-only">
            Write a comment
          </label>
          <Textarea
            id="comment-content"
            name="content"
            rows={3}
            maxLength={1000}
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Share how it turned out, or ask the cook a question..."
            className="resize-y"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {value.length}/1000
            </span>
            <Button type="submit" disabled={pending || value.trim().length === 0}>
              {pending ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              create an account
            </Link>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      <ul className="mt-7 space-y-6">
        {comments.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No comments yet. Be the first to say something.
          </li>
        ) : null}

        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <Avatar className="size-9 shrink-0">
              {comment.profiles?.avatar_url ? (
                <AvatarImage src={comment.profiles.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="text-xs">
                {initialsOf(comment.profiles?.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold">
                  {comment.profiles?.full_name ?? "Unknown cook"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {comment.content}
              </p>
            </div>

            {currentUserId === comment.user_id ? (
              <ConfirmationDialog
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Delete your comment</span>
                  </Button>
                }
                title="Delete this comment?"
                description="Your comment will be permanently removed."
                confirmLabel="Delete"
                onConfirm={() => handleDelete(comment.id)}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
