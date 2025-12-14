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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    owner: {} as any,
    _onChannelNew: null as null | ((channel: Channel, userId?: number) => void),
  }),
  actions: {
    clear() {
      this.channels = [];
      this.activeChannelId = null;
      this.activeChannelName = null;
      this.activeChannel = null;
      this.owner = null;
    },
    initRealtime() {
      if (this.initedRealtime) return;
      this.initedRealtime = true;

      const userStore = useUserStore();
      const { id } = storeToRefs(userStore);

      const socket = getSocket();

      socket.off("channel:new");

      // this._onChannelNew = (channel: Channel, userId?: number) => {
      //   if (userId && id.value !== userId) return;

      //   this.channels.unshift(channel);
      //   this.owner = channel.owner;
      // };

      // socket.on("channel:new", this._onChannelNew);

      socket.on("channel:new", (channel: Channel, userId?: number) => {
        if (userId && id.value !== userId) return;

        this.channels.unshift(channel);
        console.log("CHAHHAHAHAHH", channel);
        this.owner = channel.owner;
      });
    },
    destroyRealtime() {
      const socket = getSocket();
      socket.off("channel:new");
      // if (!this.initedRealtime) return;
      // this.initedRealtime = false;

      // const socket = getSocket();

      // if (this._onChannelNew) {
      //   socket.off("channel:new", this._onChannelNew);
      //   this._onChannelNew = null;
      // }
    },
    // async updateChannels() {
    //   this.loading = true;
    //   await fetch(`http://localhost:3333/api/channels/all/user`, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem("token")}`,
    //     },
    //   })
    //     .then((res) => res.json())
    //     .then((data: Channel[]) => {
    //       data?.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

    //       this.channels = data;
    //       this.activeChannelId = data[0]?.id ?? null;
    //       this.activeChannelName = data[0]?.name ?? null;
    //       this.activeChannel = data[0] ?? null;
    //       this.owner = data[0]?.owner ?? null;
    //       this.loading = false;

    //       console.log("FETCHED DATA", data);
    //     })
    //     .catch((err) => {
    //       console.error(err);
    //     });

    //   if (!this.activeChannelId && this.channels.length) {
    //     const [first] = this.channels;
    //     if (first) {
    //       this.activeChannelId = first.id;
    //       this.activeChannelName = first.name;
    //       this.activeChannel = first;
    //     }
    //   }
    // },
    async updateChannels() {
      this.loading = true;
      try {
        const res = await fetch("http://localhost:3333/api/channels/all/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data: Channel[] = await res.json();

        data?.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

        this.channels = data;

        let newActive = this.channels.find(
          (ch) => ch.id === this.activeChannelId
        );

        if (!newActive && this.channels.length) {
          newActive = this.channels[0];
        }

        if (newActive) {
          this.activeChannelId = newActive.id;
          this.activeChannelName = newActive.name;
          this.activeChannel = newActive;
          this.owner = newActive.owner ?? null;
        } else {
          this.activeChannelId = null;
          this.activeChannelName = null;
          this.activeChannel = null;
          this.owner = null;
        }

        console.log("FETCHED DATA", data);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
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
