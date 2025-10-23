<template>
  <section class="panel q-pa-md sidebar scroll-y" style="padding-bottom: 75px">
    <ChannelComponent
      v-for="channel in channels"
      :key="channel.name"
      :channel="channel"
      :active="activeChannelId === channel.id"
      :color="'#26A69A'"
      @click="onChannelClick(channel.name, channel.id)"
    />
    <q-btn
      class="add-channel-btn"
      color="teal-7"
      flat
      icon="add"
      @click="openCreateDialog()"
    />
  </section>

  <q-dialog v-model="create.open" persistent>
    <q-card class="card--wide">
      <q-card-section class="card__title">Create channel</q-card-section>

      <q-card-section class="card__body">
        <q-input
          v-model="create.name"
          label="Name"
          outlined
          :disable="create.loading"
          :error="!!create.error"
          :error-message="create.error"
          @focus="create.error = ''"
        />
        <q-input
          v-model="create.description"
          label="Description"
          type="textarea"
          outlined
          :disable="create.loading"
          @input="create.error = ''"
        />
        <q-toggle
          v-model="create.isPrivate"
          label="Private channel"
          :disable="create.loading"
        />
      </q-card-section>

      <q-card-actions align="right" class="card__actions">
        <q-btn
          label="Cancel"
          flat
          :disable="create.loading"
          @click="closeCreateDialog"
        />
        <q-btn
          label="Create"
          color="primary"
          :loading="create.loading"
          :disable="create.loading"
          @click="submitCreateChannel()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import ChannelComponent from "./ChannelComponent.vue";
import { storeToRefs } from "pinia";

import { useChannelsStore } from "src/stores/channels";
const channelsStore = useChannelsStore();
const { channels, activeChannelId } = storeToRefs(channelsStore);

import { useChatsStore } from "src/stores/chats";
const chatsStore = useChatsStore();

import { getSocket } from "src/lib/socket";

// const { token } = storeToRefs(userStore);

// export interface SectionChannelsProps {

// }

// defineProps<SectionChannelsProps>();

onMounted(() => {
  console.log("SectionChannels mounted");

  channelsStore.noBackFetch();
});

const onChannelClick = async (channelName: string, channelId: number) => {
  console.log("Channel clicked:", channelName, channelId);

  const socket = getSocket();
  socket.emit("channel:unsubscribe", activeChannelId.value);
  socket.emit("channel:subscribe", channelId);

  await chatsStore.fetchChats(channelId);
  channelsStore.setActiveChannel(channelId, channelName);
};

async function submitCreateChannel() {
  create.error = "";

  if (!create.name.trim()) {
    create.error = "Name is required";
    return;
  }

  create.loading = true;

  try {
    const res = await fetch(`http://localhost:3333/api/channels/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      // headers: {
      //   ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify({
        name: create.name.trim(),
        description: create.description.trim() || null,
        is_private: !!create.isPrivate,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      create.error =
        data?.message ||
        (res.status === 409
          ? "Channel with this name already exists"
          : "Failed to create channel");
      return;
    }

    const created = data.channel;
    channelsStore.addChannel(created);
    channelsStore.setActiveChannel(created.id, created.name);
    await onChannelClick(created.name, created.id);
    create.open = false;
  } catch (e) {
    create.error = e instanceof Error ? e.message : "Network error";
  } finally {
    create.loading = false;
  }
}

const create = reactive({
  open: false,
  loading: false,
  name: "",
  description: "",
  isPrivate: false,
  error: "" as string,
});

function openCreateDialog() {
  create.open = true;
  create.name = "";
  create.description = "";
  create.isPrivate = false;
  create.error = "";
}

function closeCreateDialog() {
  if (!create.loading) create.open = false;
}
</script>

<style>
.app-grid {
  display: grid;
  grid-template-columns: 80px 350px 1fr 350px;
  height: 100vh;
}
.panel {
  background-color: #282b30;
  border-right: 1px solid #424549;
}
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.scroll-y {
  overflow-y: auto;
  scrollbar-width: none;
}

.add-member-btn {
  margin-left: 8px;
}

.add-channel-btn {
  min-width: 50px;
  min-height: 50px;
  max-width: 50px;
  max-height: 50px;
  border-radius: 10px;
}
</style>
