// import { useChatsStore } from "src/stores/chats";
// const chatsStore = useChatsStore();
// const { loading: chatsLoading } = storeToRefs(chatsStore);

import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { sendSystemMessage } from "./sendMessage";
const channelsStore = useChannelsStore();
const { activeChannelId, activeChannelName } = storeToRefs(channelsStore);

export async function channelLeave() {
  const userStore = useUserStore();
  const { username } = storeToRefs(userStore);
  // const name = activeChannel.value;
  if (!activeChannelName.value || !activeChannelId.value) return;

  try {
    const res = await fetch(
      `http://localhost:3333/api/channels/${activeChannelId.value}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        // headers: {
        //   ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        // },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.message || "Failed to leave/delete channel");

    sendSystemMessage(`${username.value} leave channel`);
    // channels.value = channels.value.filter((c) => c.name !== name);
    channelsStore.removeChannel(activeChannelId.value);
    // activeChannel.value = channels[0]?.name ?? "";
    // channelChats.value = [];
    // activeChat.value = "";
  } catch (e) {
    console.error(e);
  }
}
