<template>
  <section class="channel">
    <ul class="channel__chat-list">
      <li
        v-for="chat in chats"
        :key="chat.id"
        class="channel__chat-item"
        :class="{ active: activeChatId == chat.id }"
        role="button"
        tabindex="0"
        @click="onChatClicked(chat.title, chat.id)"
      >
        <span class="channel__chat-icon" aria-hidden="true">#</span>
        <p class="channel__chat-name">
          {{ chat.title }}
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

// interface Props {}

import { useChatsStore } from "src/stores/chats";
import { useMessagesStore } from "src/stores/messages";
const chatsStore = useChatsStore();

const { chats, activeChatId } = storeToRefs(chatsStore);

const messagesStore = useMessagesStore();

// defineProps<Props>();

const onChatClicked = (chatName: string, chatId: number) => {
  console.log("Chat clicked:", chatName, chatId);
  chatsStore.setActiveChat(chatName, chatId);

  if (activeChatId.value) messagesStore.fetchMessages(activeChatId.value);
};
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
  gap: 2px;
}

.channel__chat-item {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  user-select: none;
  color: gray;
}

.channel__chat-item.active {
  color: white;
  background-color: #36393e;
}

.channel__chat-item.active .channel__chat-icon {
  color: white;
}

.channel__chat-item:hover {
  background-color: #36393e;
  color: white;
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
