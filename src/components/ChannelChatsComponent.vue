<template>
  <div class="channel-header">
    <p>{{ title }}</p>
  </div>

  <div class="channel-chats" v-for="chat in chats" :key="chat.id">
    <div class="chat">
      <span>#</span>
      <p>{{ chat.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ChannelChatComponentProps {
  title: string;
  chats: Chat[];
}

export interface Chat {
  id: number;
  name: string;
}

defineProps<ChannelChatComponentProps>();
</script>

<style>
.channel-header {
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid green;
  padding: 20px 10px;
}
.channel-chats {
  display: flex;
  flex-direction: column;
}
.chat {
  display: flex;
  padding: 10px;
}
</style>
