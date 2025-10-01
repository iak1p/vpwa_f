import { defineStore } from "pinia"

export type Status = "online" | "dnd" | "offline"
export interface Member {
  id: number
  username: string
  name?: string | null
  surname?: string | null
  status?: Status | null
  role?: string | null
  reports?: number | null
}

export const useMembersStore = defineStore("members", {
  state: () => ({
    list: [] as Member[],
    loading: false,
  }),
  actions: {
    clear() { this.list = [] },

    async fetchByChannelId(channelId: number, token: string | null) {
      this.loading = true
      try {
        const url = `http://localhost:3333/api/channels/${encodeURIComponent(String(channelId))}/members`

        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(url, { headers })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load members")

        this.list = Array.isArray(data) ? data : (data.members ?? [])
      } finally {
        this.loading = false
      }
    },
  },
})
