<template>
  <router-view />
</template>

<script setup lang="ts">
// import { useChannelsStore } from '@/stores/channels'
import { useChannelsStore } from "src/stores/channels";
const channelsStore = useChannelsStore();
channelsStore.initRealtime();

import { useChatsStore } from "src/stores/chats";
const chatsStore = useChatsStore();
chatsStore.initRealtime();
</script>
