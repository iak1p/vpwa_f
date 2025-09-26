<template>
  <section class="channel">
    <ul class="channel__chat-list">
      <li
        v-for="chat in chats"
        :key="chat.id"
        class="channel__chat-item"
        role="button"
        tabindex="0"
      >
        <span class="channel__chat-icon" aria-hidden="true">#</span>
        <p class="channel__chat-name">{{ chat.name }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { Chat } from "./models";

export interface ChannelChatComponentProps {
  title: string;
  chats: Chat[];
}

defineProps<ChannelChatComponentProps>();
</script>

<style>
.channel__chat-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  color: white;
  padding: 20px 20px 0 10px;
}

.channel__chat-item {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  user-select: none;
}

.channel__chat-item:hover {
  background-color: #36393e;
}

.channel__chat-icon {
  margin-right: 8px;
  color: #aaa;
  font-size: 15px;
  user-select: none;
}

.channel__chat-name {
  margin: 0;
}
</style>
