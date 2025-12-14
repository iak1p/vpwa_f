import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { sendSystemMessage } from "./sendMessage";
import { useChatsStore } from "src/stores/chats";
const channelsStore = useChannelsStore();
const { activeChannelId, activeChannelName } = storeToRefs(channelsStore);
const chatsStore = useChatsStore();

export async function channelLeave() {
  const userStore = useUserStore();
  const { username } = storeToRefs(userStore);
  if (!activeChannelName.value || !activeChannelId.value) return;

  try {
    const res = await fetch(
      `http://localhost:3333/api/channels/${activeChannelId.value}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.message || "Failed to leave/delete channel");

    await sendSystemMessage(`${username.value} leave channel`);

    channelsStore.removeChannel(activeChannelId.value);
    await chatsStore.fetchChats(activeChannelId.value);
  } catch (e) {
    console.error(e);
  }
}
