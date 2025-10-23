import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";
import { sendSystemMessage } from "./sendMessage";
import { type User } from "src/components/models";
const channelsStore = useChannelsStore();
const { activeChannelName } = storeToRefs(channelsStore);

export async function addUser(username: string) {
  if (!activeChannelName.value) {
    return { ok: false, message: "Select a channel first" };
  }
  if (!username.trim()) {
    return { ok: false, message: "Username is required" };
  }

  const url = `http://localhost:3333/api/channels/${encodeURIComponent(
    activeChannelName.value
  )}/members/${encodeURIComponent(username.trim())}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    const data = await res.json().catch(() => ({} as User));

    if (!res.ok) {
      const message =
        data?.message ||
        (res.status === 404
          ? "Not found"
          : res.status === 403
          ? "Forbidden"
          : res.status === 409
          ? "User already in channel"
          : "Failed to add member");
      return { ok: false, message };
    }

    await sendSystemMessage(`${username} join channel`);

    return { ok: true, message: `@${username} invited`, data };
  } catch (e) {
    const err = e as Error;
    return { ok: false, message: err?.message || "Network error" };
  }
}
