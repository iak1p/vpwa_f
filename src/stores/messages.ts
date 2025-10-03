import { getSocket } from "src/lib/socket";
// import { Message } from "./../components/models";
import { defineStore, storeToRefs } from "pinia";
import { useChatsStore } from "./chats";

export const useMessagesStore = defineStore("messages", {
  state: () => ({
    messages: [] as any[],
    initedRealtime: false,
    loading: false,
  }),
  actions: {
    initRealtime() {
      if (this.initedRealtime) return;
      this.initedRealtime = true;

      const socket = getSocket();
      const { activeChatId } = storeToRefs(useChatsStore());

      socket.off("message:new");
      socket.on(
        "message:new",
        ({ chatId, message }: { chatId: number | string; message: any }) => {
          const idNum = Number(chatId);
          if (idNum !== activeChatId.value) return;

          if (!this.messages.some((m) => m.id === message.id)) {
            this.messages.push(message);
          }
        }
      );
    },

    clear() {
      this.messages = [];
    },
    async fetchMessages(channelId: any) {
      this.loading = true;

      fetch(`http://localhost:3333/api/messages/${channelId}/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .catch((err) => console.error(err))
        .then((data) => {
          console.log("MESSSAGEEWESS", data);

          this.messages = data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addNewMessage(message: any) {
      this.messages.push(message);

      if (this.messages.some((m) => m.id === message.id)) return;
      this.messages.push(message);
    },
  },
});
