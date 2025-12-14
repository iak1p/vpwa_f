<template>
  <router-view />
</template>

<script setup lang="ts">
// import { useChannelsStore } from '@/stores/channels'
import { useChannelsStore } from "src/stores/channels";
const channelsStore = useChannelsStore();
// channelsStore.initRealtime();

import { useChatsStore } from "src/stores/chats";
const chatsStore = useChatsStore();
// chatsStore.initRealtime();

import { useMessagesStore } from "src/stores/messages";
const messagesStore = useMessagesStore();
// messagesStore.initRealtime();

import { useMembersStore } from "./stores/members";
const membersStore = useMembersStore();
// membersStore.initRealtime();

import { useUserStore } from "./stores/user";
import { watch } from "vue";
import { connectSocket, disconnectSocket } from "./lib/socket";
const userStore = useUserStore();

watch(
  () => userStore.status,
  (status) => {
    if (status === "offline") {
      // 1) отключаем realtime-слушателей
      channelsStore.destroyRealtime();
      chatsStore.destroyRealtime();
      messagesStore.destroyRealtime();
      membersStore.destroyRealtime();

      // 2) физически рвём соединение
      disconnectSocket();
    } else {
      // ONLINE / DND → подключаемся
      connectSocket();

      // заново инициализируем подписки
      channelsStore.initRealtime();
      chatsStore.initRealtime();
      messagesStore.initRealtime();
      membersStore.initRealtime();
    }
  },
  { immediate: true }
);
</script>
