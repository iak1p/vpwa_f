<template>
  <div class="app-grid">
    <SectionChannels />

    <SectionChats class="col" :owner-label="ownerLabel" />

    <ChatSection class="col" v-model:message="message" />

    <RightSection />
  </div>

  <BottomModal :on-logout="handleLogout" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BottomModal from "src/components/BottomModal.vue";
import SectionChannels from "src/components/SectionChannels.vue";
import SectionChats from "src/components/SectionChats.vue";
import ChatSection from "src/components/ChatSection.vue";
import { useRouter } from "vue-router";
import { useChannelsStore } from "src/stores/channels";
import { useUserStore } from "src/stores/user";
import RightSection from "src/components/RightSection.vue";
import { useChatsStore } from "src/stores/chats";
import { storeToRefs } from "pinia";
import { useMessagesStore } from "src/stores/messages";
import { getSocket } from "src/lib/socket";

const userStore = useUserStore();

const channelsStore = useChannelsStore();
const { activeChannelId } = storeToRefs(channelsStore);

const chatsStore = useChatsStore();
const { activeChatId } = storeToRefs(chatsStore);

const messagesStore = useMessagesStore();

const message = ref("");
const router = useRouter();
const ownerLabel = ref<string | null>(null);
const socket = getSocket();

async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

onMounted(async () => {
  await ensureNotificationPermission();
  await channelsStore.fetchChannels();
  await userStore.getUser();

  if (!activeChannelId.value) return;

  socket.emit("channel:subscribe", activeChannelId.value);

  await chatsStore.fetchChats(activeChannelId.value);

  if (!activeChatId.value) return;

  await messagesStore.fetchMessages(activeChatId.value);
});

async function handleLogout() {
  localStorage.clear();
  await router.replace("/login");
}
</script>

<style>
.app-grid {
  display: grid;
  grid-template-columns: 80px 350px 1fr 350px;
  height: 100vh;
}
.panel {
  background-color: #282b30;
  border-right: 1px solid #424549;
}
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.scroll-y {
  overflow-y: auto;
  scrollbar-width: none;
}

.add-member-btn {
  margin-left: 8px;
}

.add-channel-btn {
  min-width: 50px;
  min-height: 50px;
  max-width: 50px;
  max-height: 50px;
  border-radius: 10px;
}
</style>
