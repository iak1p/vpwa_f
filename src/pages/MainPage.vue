<template>
  <div
    class=""
    style="display: grid; grid-template-columns: 80px 250px auto; height: 100vh"
  >
    <div
      class="q-pa-md col bg-green-3"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        border-right: 1px solid green;
      "
    >
      <ChannelComponent
        v-for="value in source"
        :key="value.title"
        v-bind="value"
        :active="activeChannel === value.title"
        @click="activeChannel = value.title"
      />
    </div>

    <div class="bg-green-3 col" style="">
      <ChannelChatsComponent
        v-bind="chatsMap[activeChannel] ?? { title: '', chats: [] }"
      />
    </div>

    <div class="q-pa-md col" style="background-color: lightgreen">
      <ChannelComponent
        v-for="value in source"
        :key="value.title"
        v-bind="value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChannelChatsComponent from "src/components/ChannelChatsComponent.vue";
import ChannelComponent from "src/components/ChannelComponent.vue";
import type { ChannelComponentProps } from "src/components/ChannelComponent.vue";
import type { ChannelChatComponentProps } from "src/components/ChannelChatsComponent.vue";

const source: ChannelComponentProps[] = [
  {
    title: "Channel 1",
    color: "#26A69A",
  },
  {
    title: "Channel 2",
    color: "#1976D2",
  },
  {
    title: "Channel 3",
    color: "#9C27B0",
  },
];

const activeChannel = ref(source[0]?.title ?? "");

const chatsMap: Record<string, ChannelChatComponentProps> = {
  "Channel 1": {
    title: "Channel 1",
    chats: [
      { id: 1, name: "general" },
      { id: 2, name: "random" },
      { id: 3, name: "help" },
    ],
  },
  "Channel 2": {
    title: "Channel 2",
    chats: [
      { id: 4, name: "news" },
      { id: 5, name: "support" },
    ],
  },
  "Channel 3": {
    title: "Channel 3",
    chats: [{ id: 6, name: "dev" }],
  },
};
</script>
