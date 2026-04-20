export const COLUMN_POSTS_TABLE = "column_posts";
export const COLUMN_CATEGORIES_TABLE = "column_categories";
export const COLUMN_CATEGORIES_RELATION = "column_categories";

export const COLUMN_POST_ROUTE_BASE = "/column-posts";

export function getCategoryBadgeStyle(category) {
  return {
    backgroundColor: category?.badge_bg_color || "#eef2f7",
    color: category?.badge_text_color || "#344054",
  };
}
