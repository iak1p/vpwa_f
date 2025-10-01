import { defineStore } from "pinia";

export type Status = "online" | "dnd" | "offline";
export interface Member {
  id: number;
  username: string;
  name?: string | null;
  surname?: string | null;
  status?: Status | null;
  role?: string | null;
  reports?: number | null;
}

export const useMembersStore = defineStore("members", {
  state: () => ({
    members: [] as Member[],
    loading: false,
  }),
  actions: {
    clear() {
      this.members = [];
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
        
        this.members = data
      } finally {
        this.loading = false;
      }
    },
  },
});
