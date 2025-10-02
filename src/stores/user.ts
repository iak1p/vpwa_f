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
    async getUser() {
      fetch("http://localhost:3333/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.id = data.id;
          this.username = data.username;
        });
    },
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
      this.token = token;
      this.id = user?.id ?? null;
      this.username = user?.username ?? null;
      this.name = user?.name ?? null;
      this.surname = user?.surname ?? null;
      this.email = user?.email ?? null;
      this.status = user?.status ?? "online";
      this.createdAt = user?.createdAt ? new Date(user.createdAt) : null;
      this.updatedAt = user?.updatedAt ? new Date(user.updatedAt) : null;
    },
    clearSession() {
      this.token = null;
      this.username = null;
      this.status = null;
      this.id = null;
      this.name = null;
      this.surname = null;
      this.email = null;
      this.createdAt = null;
      this.updatedAt = null;
    },
    async setStatus(next: Status) {
      const prev = this.status;
      this.status = next;

      try {
        const res = await fetch("http://localhost:3333/api/users/status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ status: next }),
        });

        if (!res.ok) {
          this.status = prev;
          const errText = await res.text().catch(() => "");
          throw new Error(`Status update failed: ${res.status} ${errText}`);
        }

        const data = await res.json().catch(() => ({}));
        this.status = (data?.status as Status) || next;
      } catch (e) {
        this.status = prev;
        throw e;
      }
    },
  },
});
