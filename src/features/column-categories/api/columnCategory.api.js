import { supabase } from "shared/api/supabaseClient";
import { COLUMN_CATEGORIES_TABLE } from "../model/columnCategory.constants";

export async function listColumnCategories() {
  return supabase
    .from(COLUMN_CATEGORIES_TABLE)
    .select("id, name, slug, badge_bg_color, badge_text_color, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
}

export async function getColumnCategory(id) {
  return supabase
    .from(COLUMN_CATEGORIES_TABLE)
    .select("id, name, slug, badge_bg_color, badge_text_color, sort_order, is_active")
    .eq("id", id)
    .single();
}

export async function createColumnCategory(payload) {
  return supabase.from(COLUMN_CATEGORIES_TABLE).insert([payload]).select().single();
}

export async function updateColumnCategory(id, payload) {
  return supabase.from(COLUMN_CATEGORIES_TABLE).update(payload).eq("id", id).select().single();
}
