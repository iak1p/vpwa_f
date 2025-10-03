// import type { Status } from "./members";
import { getSocket } from "src/lib/socket";
// import { Message } from "./../components/models";
import { defineStore, storeToRefs } from "pinia";
import { useChatsStore } from "./chats";
import { AppVisibility } from "quasar";
import { useUserStore } from "./user";
import { Message } from "src/components/models";

export const useMessagesStore = defineStore("messages", {
  state: () => ({
    messages: [] as any[],
    initedRealtime: false,
    loading: false,
  }),
  actions: {
    checkNotification(message: Message) {
      const mentionRegex = /@(\w+)/g;
      const userStore = useUserStore();
      const { status, username } = storeToRefs(userStore);

      if (AppVisibility.appVisible) return;
      if (Notification.permission !== "granted") return;
      if (status.value === "dnd" || status.value === "offline") return;
      if (message.type === "text") return;

      if (message.type === "ping") {
        let me = false;
        const matches = message.content.match(mentionRegex);

        matches?.forEach((match) => {
          if (match.includes(`@${username.value}`)) me = true;
        });

        if (!me) return;
      }

      if (true) {
        new Notification(
          `${message.sender.name} ${message.sender.surname} (@${message.sender.username})`,
          {
            body: `${message.content.slice(0, 60)}...`,
          }
        );
      }
    },
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

          console.log(message);

          if (!("Notification" in window)) {
            alert("Браузер не поддерживает Notifications API");
            return;
          }

          this.checkNotification(message);
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
