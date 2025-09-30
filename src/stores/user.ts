import { defineStore } from "pinia";

export type Status = "online" | "dnd" | "offline";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: null as string | null,

    username: null as string | null,
    status: null as string | null,
    id: null as number | null,
    name: null as string | null,
    surname: null as string | null,
    email: null as string | null,
    createdAt: null as Date | null,
    updatedAt: null as Date | null,

    // user: null as User | null
  }),
  actions: {
    initFromStorage() {
      try {
        this.token = localStorage.getItem("token");

        const u = JSON.parse(localStorage.getItem("user") || "null");
        this.id = u?.id ?? null;
        this.username = u?.username ?? null;
        this.name = u?.name ?? null;
        this.surname = u?.surname ?? null;
        this.email = u?.email ?? null;
        this.status = u?.status ?? null;
        this.createdAt = u?.createdAt ? new Date(u.createdAt) : null;
        this.updatedAt = u?.updatedAt ? new Date(u.updatedAt) : null;
      } catch {
        this.clearSession();
      }
    },
    setSession(user: any, token: string) {
      this.token    = token;
      this.id       = user?.id ?? null;
      this.username = user?.username ?? null;
      this.name     = user?.name ?? null;
      this.surname  = user?.surname ?? null;
      this.email    = user?.email ?? null;
      this.status   = user?.status ?? "online";
      this.createdAt = user?.createdAt ? new Date(user.createdAt) : null;
      this.updatedAt = user?.updatedAt ? new Date(user.updatedAt) : null;
    },
    clearSession() {
      this.token = null;
      this.username = null;
      this.status   = null;
      this.id = null;
      this.name = null;
      this.surname = null;
      this.email = null;
      this.createdAt = null;
      this.updatedAt = null;
    },
    setStatus(s: string) {
      this.status = s;
    },
    cycleStatus() {
      this.setStatus(this.status === "online" ? "offline" : "online");
    },
  },

  getters: {
    isAuth: (s) => !!s.token,

    displayName: (s): string => {
      const n = (s.name ?? "").trim();
      const sn = (s.surname ?? "").trim();
      return n || sn ? [n, sn].join(" ") : "User";
    },

    initials(): string {
      const parts = this.displayName.split(" ").filter(Boolean);
      const a = (parts[0]?.[0] ?? "U").toUpperCase();
      const b = (parts[1]?.[0] ?? "").toUpperCase();
      return a + b || "U";
    },

    statusClass(): string {
      return this.status === "online"
        ? "is-online"
        : this.status === "dnd"
        ? "is-away"
        : "is-offline";
    },
  },
});
