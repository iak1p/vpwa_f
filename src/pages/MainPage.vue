<template>
  <div class="app-grid">
    <SectionChannels />

    <SectionChats class="col" :owner-label="ownerLabel" />

    <ChatSection class="col" v-model:message="message" />

    <section>Right Side</section>
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
const userStore = useUserStore();

const channelsStore = useChannelsStore();

const message = ref("");
const router = useRouter();
const ownerLabel = ref<string | null>(null);

// const ownerLabel = computed<string | null>(() => {
//   const ch = channels.value.find((c) => c.name === activeChannel.value);
//   const dn = ch?.owner?.displayName?.trim() || "";
//   const un = ch?.owner?.username?.trim() || "";

//   if (!dn && !un) return null;
//   if (dn && un) return `${dn} (@${un})`;
//   return dn || `@${un}`;
// });

onMounted(async () => {
  await channelsStore.fetchChannels();
  await userStore.getUser();
});

async function handleLogout() {
  localStorage.clear();
  await router.replace("/login");
}

// import { io as ioc } from "socket.io-client";

// const socket = ioc("http://localhost:3333", {
//   auth: { token: localStorage.getItem("token") || "" },
// });

// socket.on("connect", () => {
//   const local = JSON.parse(localStorage.getItem("user"));
//   const userId = local.id;
//   socket.emit("auth:hello", userId);
//   // socket.emit('org:subscribe', orgId)
// });

// const socket = getSocket();

// // console.log("SOCKKKEKEKKEKE", socket)

// socket.on("channel:new", (channel, userId) => {

//   const local = JSON.parse(localStorage.getItem("user"));
//   const userIdLocal = local.id;
//   console.log("User IDDDDD", userId, userIdLocal)
//   console.log(channel);
//   // добавим новый канал в начало списка
//   if (userIdLocal == userId) channelsStore.addChannel(channel);
//   // если нужно — сразу сделать активным:
//   // channelsStore.activeChannelId = channel.id
// });
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
  width: 50px;
  height: 50px;
  border-radius: 10px;
}
</style>
