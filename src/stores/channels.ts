import { defineStore, storeToRefs } from "pinia";
import type { Channel } from "src/components/models";
import { getSocket } from "src/lib/socket";
import { useUserStore } from "src/stores/user";
// const userStore = useUserStore();
// const { token } = storeToRefs(userStore);

export const useChannelsStore = defineStore("channels", {
  state: () => ({
    channels: [] as Channel[],
    loading: false,
    activeChannelId: null as number | null,
    activeChannelName: null as string | null,
    activeChannel: null as Channel | null,
    initedRealtime: false,
    owner: {} as any,
  }),
  actions: {
    noBackFetch() {
      console.error("NO BACK FETCH CHANNELS");
      const c: Channel[] = [
        {
          id: 24,
          name: "test chanel",
          isPrivate: false,
          ownerId: 9,
          createdAt: "2025-10-23T08:03:02.361+00:00",
          color: "#e9c46a",
          owner: {
            id: 9,
            username: "test",
            name: "Test",
            surname: "Test",
          },
          role: "owner",
          reports: 0,
          joinedAt: "2025-10-23T08:03:02.403Z",
          banned: false,
          kick_voters: [],
        },
        {
          id: 25,
          name: "test chnnel 2",
          isPrivate: false,
          ownerId: 9,
          createdAt: "2025-10-23T10:27:37.328+00:00",
          color: "#e76f51",
          owner: {
            id: 9,
            username: "test",
            name: "Test",
            surname: "Test",
          },
          role: "owner",
          reports: 0,
          joinedAt: "2025-10-23T10:27:37.401Z",
          banned: false,
          kick_voters: [],
        },
      ];
      c?.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
      this.channels = c;
      this.activeChannelId = c[0]?.id ?? null;
      this.activeChannelName = c[0]?.name ?? null;
      this.activeChannel = c[0] ?? null;
      this.owner = c[0]?.owner ?? null;
    },
    initRealtime() {
      if (this.initedRealtime) return;
      this.initedRealtime = true;

      const userStore = useUserStore();
      const { id } = storeToRefs(userStore);

      const socket = getSocket();

      socket.off("channel:new");

      socket.on("channel:new", (channel: Channel, userId?: number) => {
        if (userId && id.value !== userId) return;

        this.channels.unshift(channel);
        console.log("CHAHHAHAHAHH", channel);
        this.owner = channel.owner;
      });
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
          data?.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

          this.channels = data;
          this.activeChannelId = data[0]?.id ?? null;
          this.activeChannelName = data[0]?.name ?? null;
          this.activeChannel = data[0] ?? null;
          this.owner = data[0]?.owner ?? null;
          this.loading = false;

          console.log("FETCHED DATA", data);
        })
        .catch((err) => {
          console.error(err);
        });
      if (!this.activeChannelId && this.channels.length) {
        const [first] = this.channels;
        if (first) {
          this.activeChannelId = first.id;
          this.activeChannelName = first.name;
          this.activeChannel = first;
        }
      }
    },
    addChannel(channel: Channel) {
      this.channels.unshift(channel);
      this.owner = channel.owner;
    },
    removeChannel(activeChannelId: number) {
      this.channels = this.channels.filter((c) => c.id !== activeChannelId);
      this.activeChannelId = this.channels[0]?.id ?? null;
      this.activeChannelName = this.channels[0]?.name ?? null;
      this.activeChannel = this.channels[0] ?? null;
      this.owner = this.channels[0]?.owner ?? null;
    },
    setActiveChannel(channelId: number, channelName: string) {
      this.activeChannelId = channelId;
      this.activeChannelName = channelName;
      this.activeChannel =
        this.channels.find((channel) => channel.id == channelId) ?? null;
      this.owner = this.channels.find(
        (channel) => channel.id == channelId
      )?.owner;
    },
  },
});
