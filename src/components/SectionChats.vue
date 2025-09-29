<template>
  <section
    class="col"
    style="background-color: #282b30; border-right: 1px solid #424549"
  >
    <div class="channel__header">
      <div>
        <p>{{ activeChannel || "no chat selected" }}</p>
        <p v-if="ownerLabel && activeChannel" class="channel__owner">
          {{ ownerLabel }}
        </p>
      </div>
      <div>
        <q-btn
          v-if="activeChannel"
          class="add-member-btn"
          icon="person_add"
          flat
          round
          size="sm"
          @click="openAddDialog"
        />

        <q-btn
          v-if="activeChannel"
          class="q-ml-xs"
          icon="add_comment"
          flat
          round
          size="sm"
          @click="openCreateChatDialog"
        />

        <q-btn
          v-if="activeChannel"
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
      v-if="channelsLoading"
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

    <ChannelChatsComponent
      v-else
      :chats="channelChats"
      :activeChat="activeChat"
    />
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
import type { Chat } from "./ChannelChatsComponent.vue";

export interface SectionChannelsProps {
  activeChannel: string | null;
  channelsLoading: boolean;
  channelChats: Chat[];
  activeChat: string | null;
  onChannelClick: (channelName: string, channelId: number) => Promise<void>;
  submitAddMember: (add: {
    open: boolean;
    loading: boolean;
    username: string;
    error: string;
  }) => Promise<void>;
  submitCreateChat: (createChat: {
    open: boolean;
    loading: boolean;
    title: string;
    error: string;
  }) => Promise<void>;
  onLeaveChannel: () => void | Promise<void>;
  ownerLabel: string | null;
}

defineProps<SectionChannelsProps>();

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
