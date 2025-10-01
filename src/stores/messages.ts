import { Message } from "./../components/models";
import { defineStore } from "pinia";

export interface Member {
  id: number;
  username: string;
  name?: string | null;
  surname?: string | null;
  role?: string | null;
  reports?: number | null;
}

export const useMessagesStore = defineStore("messages", {
  state: () => ({
    messages: [] as any[],
    loading: false,
  }),
  actions: {
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
        this.messages.push(message)
    },
  },
});
