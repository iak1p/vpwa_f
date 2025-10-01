import { useChatsStore } from "src/stores/chats";
const chatsStore = useChatsStore();
const { loading: chatsLoading } = storeToRefs(chatsStore);

import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";
const channelsStore = useChannelsStore();
const { activeChannelId, activeChannelName } = storeToRefs(channelsStore);

export async function addUser(username: any) {
  try {
    const res = await fetch(
      `http://localhost:3333/api/channels/${encodeURIComponent(
        activeChannelName.value || ""
      )}/members/${encodeURIComponent(username.trim())}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        // headers: {
        //   ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        // },
      }
    );
    const data = await res.json().catch(() => ({}));
    console.log(data)
  } catch (e) {
    console.error(e)
  }
}
