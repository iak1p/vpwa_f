import { defineStore, storeToRefs } from "pinia";
import type { Chat } from "src/components/models";
import { useUserStore } from "src/stores/user";
import { getSocket } from "src/lib/socket";

export const useChatsStore = defineStore("chats", {
  state: () => ({
    chats: [] as Chat[],
    loading: false,
    activeChatId: null as number | null,
    activeChatName: null as string | null,
    initedRealtime: false,
  }),
  actions: {
    initRealtime() {
      if (this.initedRealtime) return;
      this.initedRealtime = true;

      const userStore = useUserStore();
      const { id } = storeToRefs(userStore);

      const socket = getSocket();

      socket.off("chat:new");

      socket.on(
        "chat:new",
        (chat: Chat, userId?: number) => {
          if (userId != id.value) {
            this.chats.unshift(chat);
          }
        }
      );
    },
    async fetchChats(channelId: number) {
      this.loading = true;
      await fetch(`http://localhost:3333/api/channels/chats/${channelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // headers: {
        //   ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        // },
      })
        .then((res) => res.json())
        .then((data: Chat[]) => {
          data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          this.chats = data;
          this.loading = false;
          this.activeChatId = data[0]?.id ?? null;
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    addChat(chat: Chat) {
      this.chats.unshift(chat);

      //   await this.channels.unshift(channel);
    },
    setActiveChat(chatName: string, chatlId: number) {
      this.activeChatId = chatlId;
      this.activeChatName = chatName;
    },
    // async removeChannel(channelName: string) {
    //   //   this.channels = await this.channels.filter((c) => c.name !== channelName);
    // },
  },
});
