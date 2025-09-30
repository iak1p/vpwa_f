<template>
  <section
    class="col"
    style="background-color: #282b30; border-right: 1px solid #424549"
  >
    <div class="channel__header">
      <div>
        <p>{{ activeChannelName || "no chat selected" }}</p>
        <p v-if="ownerLabel && activeChannelName" class="channel__owner">
          {{ ownerLabel }}
        </p>
      </div>
      <div>
        <q-btn
          v-if="activeChannelName"
          class="add-member-btn"
          icon="person_add"
          flat
          round
          size="sm"
          @click="openAddDialog"
        />

        <q-btn
          v-if="activeChannelName"
          class="q-ml-xs"
          icon="add_comment"
          flat
          round
          size="sm"
          @click="openCreateChatDialog"
        />

        <q-btn
          v-if="activeChannelName"
          flat
          round
          dense
          icon="logout"
          class="text-grey-4 q-ml-xs"
          @click="onLeaveChannel()"
        />
      </div>
    </div>

    <div
      v-if="chatsLoading"
      class="q-pa-md"
      style="
        display: flex;
        gap: 2px;
        flex-direction: column;
        padding: 20px 20px 0 10px;
      "
    >
      <div
        class="loader"
        style="
          width: 100%;
          background-color: gray;
          border-radius: 5px;
          opacity: 0.3;
          height: 30px;
        "
      ></div>
      <div
        class="loader"
        style="
          width: 100%;
          background-color: gray;
          border-radius: 5px;
          opacity: 0.3;
          height: 30px;
        "
      ></div>
    </div>

    <ChannelChatsComponent v-else />
  </section>

  <q-dialog v-model="createChat.open" persistent>
    <q-card class="card--narrow">
      <q-card-section class="card__title">Create chat</q-card-section>

      <q-card-section class="card__body">
        <q-input
          v-model="createChat.title"
          label="Title"
          outlined
          :disable="createChat.loading"
          :error="!!createChat.error"
          :error-message="createChat.error"
          @input="createChat.error = ''"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="card__actions">
        <q-btn
          label="Cancel"
          flat
          :disable="createChat.loading"
          @click="closeCreateChatDialog"
        />
        <q-btn
          label="Create"
          color="primary"
          :loading="createChat.loading"
          :disable="createChat.loading"
          @click="() => submitCreateChat(createChat)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="add.open" persistent>
    <q-card class="card--narrow">
      <q-card-section class="card__title">Add member</q-card-section>

      <q-card-section class="card__body">
        <q-input
          v-model="add.username"
          label="Username"
          outlined
          :disable="add.loading"
          :error="!!add.error"
          :error-message="add.error"
          @input="add.error = ''"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="card__actions">
        <q-btn
          label="Cancel"
          flat
          :disable="add.loading"
          @click="closeAddDialog"
        />
        <q-btn
          label="Add"
          color="primary"
          :loading="add.loading"
          :disable="add.loading"
          @click="() => submitAddMember(add)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import ChannelChatsComponent from "./ChannelChatsComponent.vue";
import { storeToRefs } from "pinia";

import { useChatsStore } from "src/stores/chats";
const chatsStore = useChatsStore();
const { loading: chatsLoading } = storeToRefs(chatsStore);

import { useChannelsStore } from "src/stores/channels";
const channelsStore = useChannelsStore();
const { activeChannelId, activeChannelName } = storeToRefs(channelsStore);

import { useUserStore } from "src/stores/user";
const userStore = useUserStore();
const { token } = storeToRefs(userStore);

export interface SectionChannelsProps {
  // onLeaveChannel: () => void | Promise<void>;
  ownerLabel: string | null;
}

defineProps<SectionChannelsProps>();

async function submitAddMember(add: addProps) {
  add.error = "";

  if (!activeChannelName) {
    add.error = "Select a channel first";
    return;
  }
  if (!add.username.trim()) {
    add.error = "Username is required";
    return;
  }

  add.loading = true;
  try {
    const url = `http://localhost:3333/api/channels/${encodeURIComponent(
      activeChannelName.value || ""
    )}/members/${encodeURIComponent(add.username.trim())}`;

    const res = await fetch(url, {
      method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      //   },
      headers: {
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      add.error =
        data?.message ||
        (res.status === 404
          ? "Not found"
          : res.status === 403
          ? "Forbidden"
          : res.status === 409
          ? "User already in channel"
          : "Failed to add member");
      return;
    }

    add.open = false;
  } catch (e) {
    add.error = e instanceof Error ? e.message : "Network error";
  } finally {
    add.loading = false;
  }
}

async function submitCreateChat(create: createProps) {
  create.error = "";

  if (!create.title?.trim()) {
    create.error = "Title is required";
    return;
  }

  // const ch = channels.value.find((c) => c.name === activeChannel.value);
  // const ch = channels.find((c) => c.name === activeChannel.value);

  if (!activeChannelId) {
    create.error = "Channel ID not found";
    return;
  }

  create.loading = true;
  try {
    const res = await fetch(
      `http://localhost:3333/api/chats/create/${encodeURIComponent(
        activeChannelId.value || ""
      )}`,
      {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        //   Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        // },
        headers: {
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: create.title.trim() }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      create.error =
        data?.message ||
        (res.status === 409
          ? "Chat with this title already exists"
          : "Failed to create chat");
      return;
    }

    const newChat = data.chat;
    chatsStore.addChat(newChat);
    chatsStore.setActiveChat(newChat.title, newChat.id);

    create.open = false;
  } catch (e) {
    create.error = e instanceof Error ? e.message : "Network error";
  } finally {
    create.loading = false;
  }
}

async function onLeaveChannel() {
  // const name = activeChannel.value;
  if (!activeChannelName.value || !activeChannelId.value) return;

  try {
    const res = await fetch(
      `http://localhost:3333/api/channels/${encodeURIComponent(
        activeChannelName.value
      )}/leave`,
      {
        method: "DELETE",
        // headers: {
        //   Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        // },
        headers: {
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.message || "Failed to leave/delete channel");

    // channels.value = channels.value.filter((c) => c.name !== name);
    channelsStore.removeChannel(activeChannelId.value);
    // activeChannel.value = channels[0]?.name ?? "";
    // channelChats.value = [];
    // activeChat.value = "";
  } catch (e) {
    console.error(e);
  }
}

interface addProps {
  open: boolean;
  loading: boolean;
  username: string;
  error: string;
}

interface createProps {
  open: boolean;
  loading: boolean;
  error: string;
  title: string;
}

const add = reactive({
  open: false,
  loading: false,
  username: "",
  error: "" as string,
});

function openAddDialog() {
  add.open = true;
  add.username = "";
  add.error = "";
}

function closeAddDialog() {
  if (!add.loading) add.open = false;
}

const createChat = reactive({
  open: false,
  loading: false,
  title: "",
  error: "" as string,
});

function openCreateChatDialog() {
  createChat.open = true;
  createChat.title = "";
  createChat.error = "";
}

function closeCreateChatDialog() {
  if (!createChat.loading) createChat.open = false;
}
</script>

<style>
.channel__header {
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #424549;
  border-radius: 10px;
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.add-member-btn {
  margin-left: 8px;
}

.loader {
  width: 120px;
  background: linear-gradient(90deg, #0001 33%, #0005 50%, #0001 66%) #f2f2f2;
  background-size: 300% 100%;
  animation: l1 1s infinite linear;
}
@keyframes l1 {
  0% {
    background-position: right;
  }
}
.channel__title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.channel__name {
  margin: 0;
  line-height: 1.1;
}
.channel__owner {
  margin: 0;
  font-size: 12px;
  color: #ffffff;
  opacity: 0.9;
}
</style>
