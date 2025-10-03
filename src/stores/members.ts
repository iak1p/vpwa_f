import { defineStore, storeToRefs } from "pinia";
import { useUserStore } from "./user";
import { getSocket } from "src/lib/socket";

export type Status = "online" | "dnd" | "offline";
export interface Member {
  id: number;
  username: string;
  name?: string | null;
  surname?: string | null;
  status?: Status | null;
  role?: string | null;
  reports?: number | null;
  typing?: boolean | null;
  message?: string | null;
  showMessage: boolean | null;
  color: string;
}

export const useMembersStore = defineStore("members", {
  state: () => ({
    members: [] as Member[],
    loading: false,
    initedRealtime: false,
  }),
  actions: {
    initRealtime() {
      if (this.initedRealtime) return;
      this.initedRealtime = true;

      const userStore = useUserStore();
      const { id } = storeToRefs(userStore);

      const socket = getSocket();

      socket.off("channel:typing");
      socket.off("channel:stopTyping");

      socket.on("channel:typing", (typingUserId, message) => {
        if (typingUserId != id.value) {
          this.setTyping(typingUserId, message);
        }
      });

      socket.on("channel:stopTyping", (typingUserId) => {
        if (typingUserId != id.value) {
          this.unsetTyping(typingUserId);
        }
      });
    },
    clear() {
      this.members = [];
    },
    setTyping(typingUserId: number, message: string) {
      const member = this.members.find((m) => m.id === typingUserId);
      if (member) {
        member.typing = true;
        member.message = message;
      }
    },
    unsetTyping(typingUserId: number) {
      const member = this.members.find((m) => m.id === typingUserId);
      if (member) {
        member.typing = false;
        member.message = "";
        member.showMessage = false;
      }
    },
    showMessage(userId: number) {
      const member = this.members.find((m) => m.id === userId);
      if (member) {
        member.showMessage = member.showMessage ? false : true;
      }
    },
    async fetchByChannelId(channelId: number) {
      this.loading = true;
      try {
        const res = await fetch(
          `http://localhost:3333/api/channels/${channelId}/members`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Failed to load members");

        data.forEach((el: Member) => {
          el.typing = false;
          el.message = "";
        });

        this.members = data;
      } finally {
        this.loading = false;
      }
    },
  },
});
