import { defineStore } from "pinia";

export const useChatsStore = defineStore("user", {
  state: () => ({
    username: null as string | null,
    status: null as string | null,
    id: null as number | null
  }),
  actions: {
    
  },
});
