<template>
  <div class="app-grid">
    <SectionChannels class="col" />

    <SectionChats class="col" :owner-label="ownerLabel" />

    <ChatSection class="col" v-model:message="message" />

    <RightSection :class="['col', 'right-section', { open: openMembersR }]" />
  </div>

  <q-btn
    flat
    round
    dense
    color="white"
    icon="list"
    style="position: absolute; top: 20px; right: 20px"
    class="burger-members"
    @click="openMembers"
  />

  <div
    v-show="openMembersR"
    class="right-overlay"
    @click.self="openMembersR = false"
  ></div>

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

const openMembersR = ref(false);

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

const openMembers = () => {
  console.log(openMembersR.value);

  openMembersR.value = !openMembersR.value;
};

onMounted(async () => {
  await ensureNotificationPermission();

  channelsStore.noBackFetch();
  // _____
  // NO BACK
  // await channelsStore.fetchChannels();
  // _____

  userStore.noBackUser();
  // _____
  // NO BACK
  // await userStore.getUser();
  // _____

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
.right-section {
  display: block;
}
.burger-members {
  display: none;
}

@media (max-width: 1200px) {
  .right-section {
    display: none;
  }
  .right-section.open {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    height: 100vh;
    background-color: #1e1e1e;
    z-index: 1000;
    transition: all 0.3s ease;
  }
  .right-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 900;
  }
  .right-section {
    z-index: 1000;
  }
  .app-grid {
    display: grid;
    grid-template-columns: 80px 350px 1fr;
    height: 100vh;
  }
  .burger-members {
    display: block;
  }
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
