import { useChatsStore } from "src/stores/chats";
const chatsStore = useChatsStore();
// const { loading: chatsLoading } = storeToRefs(chatsStore);

import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";
const channelsStore = useChannelsStore();
const {activeChannelName } = storeToRefs(channelsStore);

// export async function addUser(username: any) {
//   try {
//     const res = await fetch(
//       `http://localhost:3333/api/channels/${encodeURIComponent(
//         activeChannelName.value || ""
//       )}/members/${encodeURIComponent(username.trim())}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//         },
//         // headers: {
//         //   ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
//         // },
//       }
//     );
//     const data = await res.json().catch(() => ({}));
//     console.log(data)
//   } catch (e) {
//     console.error(e)
//   }
// }
export async function addUser(username: string) {
  const channelsStore = useChannelsStore();
  const { activeChannelName } = storeToRefs(channelsStore);

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

    const data = await res.json().catch(() => ({} as any));

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

    return { ok: true, message: `@${username} invited`, data };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Network error" };
  }
}
