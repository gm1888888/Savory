/**
 * Hand-maintained mirror of the schema in `supabase/schema.sql`.
 *
 * If you change the SQL, change this file too (or regenerate it with
 * `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`).
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

/** One line of a recipe's ingredient list. */
export type Ingredient = { item: string };

/** One step of a recipe's method. */
export type Instruction = { step: string };

export type ProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  avatar_path: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  preparation_time: number;
  cooking_time: number;
  total_time: number;
  servings: number;
  image_url: string | null;
  image_path: string | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  /** Generated in Postgres: title + description + category + tags + ingredients. */
  search_text: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
};

export type LikeRow = {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
};

export type BookmarkRow = {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
};

export type CommentRow = {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Insert<T, Optional extends keyof T> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Insert<
          ProfileRow,
          "created_at" | "updated_at" | "avatar_url" | "avatar_path" | "bio"
        >;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      recipes: {
        Row: RecipeRow;
        Insert: Insert<
          RecipeRow,
          | "id"
          | "created_at"
          | "updated_at"
          | "likes_count"
          | "comments_count"
          | "search_text"
          | "image_url"
          | "image_path"
          | "total_time"
        >;
        Update: Partial<RecipeRow>;
        Relationships: [];
      };
      likes: {
        Row: LikeRow;
        Insert: Insert<LikeRow, "id" | "created_at">;
        Update: Partial<LikeRow>;
        Relationships: [];
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: Insert<BookmarkRow, "id" | "created_at">;
        Update: Partial<BookmarkRow>;
        Relationships: [];
      };
      comments: {
        Row: CommentRow;
        Insert: Insert<CommentRow, "id" | "created_at" | "updated_at">;
        Update: Partial<CommentRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      difficulty: Difficulty;
    };
    CompositeTypes: Record<never, never>;
  };
};

/** A recipe joined with its author's profile -- the shape cards and pages use. */
export type RecipeWithAuthor = RecipeRow & {
  profiles: Pick<ProfileRow, "id" | "full_name" | "avatar_url"> | null;
};

/** A comment joined with its author's profile. */
export type CommentWithAuthor = CommentRow & {
  profiles: Pick<ProfileRow, "id" | "full_name" | "avatar_url"> | null;
};
