import { defineStore, storeToRefs } from "pinia";
import type { Channel } from "src/components/models";
import { getSocket } from "src/lib/socket"
import { useUserStore } from "src/stores/user";
// const userStore = useUserStore();
// const { token } = storeToRefs(userStore);

export const useChannelsStore = defineStore("channels", {
  state: () => ({
    channels: [] as Channel[],
    loading: false,
    activeChannelId: null as number | null,
    activeChannelName: null as string | null,
    initedRealtime: false,
  }),
  actions: {
    initRealtime() {
      if (this.initedRealtime) return
      this.initedRealtime = true

      const userStore = useUserStore();
      const { id } = storeToRefs(userStore);

      const socket = getSocket()

      socket.off('channel:new')

      socket.on('channel:new', (channel: Channel, userId?: number) => {
        const raw = localStorage.getItem('user')
        const userIdLocal = raw ? JSON.parse(raw).id : null

        if (userId && id.value !== userId) return

        this.channels.unshift(channel)
      })
    },
    async fetchChannels() {
      this.loading = true;
      await fetch(`http://localhost:3333/api/channels/all/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // headers: {
        //   ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        // },
      })
        .then((res) => res.json())
        .then((data: Channel[]) => {
          data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

          this.channels = data;
          this.activeChannelId = data[0]?.id ?? null;
          this.activeChannelName = data[0]?.name ?? null;
          this.loading = false;

          console.log("FETCHED DATA", data);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    addChannel(channel: Channel) {
      this.channels.unshift(channel);
    },
    removeChannel(activeChannelId: number) {
      this.channels = this.channels.filter((c) => c.id !== activeChannelId);
      this.activeChannelId = this.channels[0]?.id ?? null;
      this.activeChannelName = this.channels[0]?.name ?? null;
    },
    setActiveChannel(channelId: number, channelName: string) {
      this.activeChannelId = channelId;
      this.activeChannelName = channelName;
    },
  },
});
