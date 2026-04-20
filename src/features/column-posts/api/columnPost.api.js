import { supabase } from "shared/api/supabaseClient";
import {
  COLUMN_CATEGORIES_RELATION,
  COLUMN_CATEGORIES_TABLE,
  COLUMN_POSTS_TABLE,
} from "../model/columnPost.constants";

const columnPostCategorySelect = `${COLUMN_CATEGORIES_RELATION}(id, name, slug, badge_bg_color, badge_text_color, sort_order, is_active)`;

export async function listColumnPosts() {
  return supabase
    .from(COLUMN_POSTS_TABLE)
    .select(`*, ${columnPostCategorySelect}`)
    .order("created_at", { ascending: false });
}

export async function getColumnPost(id) {
  return supabase
    .from(COLUMN_POSTS_TABLE)
    .select(`*, ${columnPostCategorySelect}`)
    .eq("id", id)
    .single();
}

export async function createColumnPost(payload) {
  return supabase
    .from(COLUMN_POSTS_TABLE)
    .insert([
      {
        ...payload,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();
}

export async function updateColumnPost(id, payload) {
  return supabase
    .from(COLUMN_POSTS_TABLE)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export async function deleteColumnPost(id) {
  return supabase.from(COLUMN_POSTS_TABLE).delete().eq("id", id);
}

export async function setColumnPostVisibility(id, isPublic) {
  return supabase
    .from(COLUMN_POSTS_TABLE)
    .update({
      is_public: isPublic,
      published_at: isPublic ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select(`*, ${columnPostCategorySelect}`)
    .single();
}

export async function listColumnCategoryOptions() {
  return supabase
    .from(COLUMN_CATEGORIES_TABLE)
    .select("id, name, slug, badge_bg_color, badge_text_color, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
}
