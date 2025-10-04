import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";
import { useChatsStore } from "src/stores/chats";
import { useUserStore } from "src/stores/user";
import { sendSystemMessage } from "./sendMessage";

export async function deleteChannel() {
  const userStore = useUserStore();
  const { username } = storeToRefs(userStore);

  const channelsStore = useChannelsStore();
  const { activeChannelId } = storeToRefs(channelsStore);

  if (!activeChannelId.value) {
    return { ok: false, message: "Select a channel first" };
  }

  try {
    const res = await fetch(
      `http://localhost:3333/api/channels/${activeChannelId.value}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: data?.message || `Error ${res.status}` };
    }

    sendSystemMessage(`${username.value} leav channel`);

    channelsStore.removeChannel(activeChannelId.value);

  
    return { ok: true, message: data?.message || "Channel deleted" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Network error" };
  }
}
