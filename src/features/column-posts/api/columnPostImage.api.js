import { supabase } from "shared/api/supabaseClient";

const IMAGE_WORKER_URL = process.env.REACT_APP_IMAGE_WORKER_URL || "https://img.law-hankyul.com";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  return session.access_token;
}

async function requestImageWorker(pathname, body) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${IMAGE_WORKER_URL}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "이미지 정리에 실패했습니다.");
  }

  return payload;
}

export async function deleteManagedImagesByKeys(keys = []) {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];

  if (!uniqueKeys.length) {
    return { deletedCount: 0 };
  }

  return requestImageWorker("/delete", { keys: uniqueKeys });
}

export async function deleteManagedImagesByPostId(postId) {
  if (!postId) {
    return { deletedCount: 0 };
  }

  return requestImageWorker("/delete-by-post", { postId: String(postId) });
}
