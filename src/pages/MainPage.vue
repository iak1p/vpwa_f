<template>
  <div
    class=""
    style="
      display: grid;
      grid-template-columns: 80px 350px auto 350px;
      height: 100vh;
    "
  >
    <section
      class="q-pa-md col"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        border-right: 1px solid #424549;
        background-color: #282b30;
        overflow-y: auto;
        scrollbar-width: none;
      "
    >
      <ChannelComponent
        v-for="value in source"
        :key="value.title"
        v-bind="value"
        :active="activeChannel === value.title"
        @click="activeChannel = value.title"
      />

      <q-btn
        color="teal-7"
        flat
        icon="add"
        style="width: 50px; height: 50px; border-radius: 10px"
      />
    </section>

    <div
      class="col"
      style="background-color: #282b30; border-right: 1px solid #424549"
    >
      <div class="channel__header">
        <p>{{ activeChannel }}</p>
        <!-- <p>Savelii Shaposhnyk</p> -->
      </div>

      <ChannelChatsComponent
        v-bind="chatsMap[activeChannel] ?? { title: '', chats: [] }"
      />
    </div>

    <div class="q-pa-md col" style="background-color: #282b30">
      <!-- <ChannelComponent
        v-for="value in source"
        :key="value.title"
        v-bind="value"
      /> -->
    </div>

    <div class="q-pa-md col" style="background-color: #282b30">
      <!-- <ChannelComponent
        v-for="value in source"
        :key="value.title"
        v-bind="value"
      /> -->
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
  {
    title: "test channel",
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

<style>
.channel__header {
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #424549;
  border-radius: 10px;
  padding: 20px;
  color: white;
}

.add-channel {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  text-align: center;
  line-height: 50px;
  color: white;
  font-size: 20px;
  cursor: pointer;
}
</style>
