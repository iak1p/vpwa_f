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
  width: 50px;
  height: 50px;
  border-radius: 10px;
}
</style>
