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
        <p
          class="channel__chat-name"
          :class="{ 'active': activeChat == chat.title }"
        >
          {{ chat.title }}
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface Props {
  chats: Chat[];
  activeChat?: string | null;
}

export interface Chat {
  id: number;
  title: string;
  lastMessageId: number | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

defineProps<Props>();

// const props = withDefaults(defineProps<{ chats: Chat[] }>(), {
//   chats: () => [],
// });
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
