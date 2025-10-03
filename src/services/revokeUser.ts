import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";

export async function revokeUser(usernameRaw: string) {
  const { activeChannelId } = storeToRefs(useChannelsStore());
  const channelId = activeChannelId.value;
  const username = (usernameRaw || "").trim();

  if (!channelId) {
    return { ok: false, message: "No active channel selected", status: 0 };
  }

  try {
    const res = await fetch(
      `http://localhost:3333/api/channels/${encodeURIComponent(channelId)}/members/private/${encodeURIComponent(username)}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      return { ok: false, message: data?.message || `Error ${res.status}`, status: res.status, data };
    }

    return { ok: true, message: data?.message || `@${username} removed`, status: res.status, data };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Network error", status: 0 };
  }
}
