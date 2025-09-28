<template>
  <div class="app-grid">
    <SectionChannels
      :channels="channels"
      :activeChannel="activeChannel"
      :onChannelClick="onChannelClick"
      :submit-create="submitCreate"
    />

    <SectionChats
      class="col"
      :active-channel="activeChannel"
      :channels-loading="channelsLoading"
      :channel-chats="channelChats"
      :on-channel-click="onChannelClick"
      :submit-add-member="submitAddMember"
    />

    <ChatSection class="col" v-model:message="message" />
    <!-- <ChatSection
      class="col"
      :message="message"
      @update:message="(val) => (message = val)"
    /> -->

    <section>Right Side</section>
  </div>

  <BottomModal />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { ChannelComponentProps } from "src/components/ChannelComponent.vue";
import type { Chat } from "src/components/ChannelChatsComponent.vue";
import BottomModal from "src/components/BottomModal.vue";
import SectionChannels from "src/components/SectionChannels.vue";
import SectionChats from "src/components/SectionChats.vue";
import ChatSection from "src/components/ChatSection.vue";
// import MessageComponent from "src/components/MessageComponent.vue";

const API = "http://localhost:3333";

const channels = ref<ChannelComponentProps[]>([]);
const activeChannel = ref(channels.value[0]?.name ?? "");

const channelChats = ref<Chat[]>([]);

const message = ref("");

const channelsLoading = ref(false);

async function submitCreate(create: any) {
  create.error = "";

  if (!create.name.trim()) {
    create.error = "Name is required";
    return;
  }

  create.loading = true;
  try {
    const res = await fetch(`${API}/api/channels/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({
        name: create.name.trim(),
        description: create.description.trim() || null,
        is_private: !!create.isPrivate,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      create.error =
        data?.message ||
        (res.status === 409
          ? "Channel with this name already exists"
          : "Failed to create channel");
      return;
    }

    const created = data.channel;
    channels.value = [created, ...channels.value];
    activeChannel.value = created.name;

    create.open = false;
  } catch (e) {
    create.error = e instanceof Error ? e.message : "Network error";
  } finally {
    create.loading = false;
  }
}

async function submitAddMember(add: any) {
  add.error = "";

  if (!activeChannel.value) {
    add.error = "Select a channel first";
    return;
  }
  if (!add.username.trim()) {
    add.error = "Username is required";
    return;
  }

  add.loading = true;
  try {
    const url = `${API}/api/channels/${encodeURIComponent(
      activeChannel.value
    )}/members/${encodeURIComponent(add.username.trim())}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      add.error =
        data?.message ||
        (res.status === 404
          ? "Not found"
          : res.status === 403
          ? "Forbidden"
          : res.status === 409
          ? "User already in channel"
          : "Failed to add member");
      return;
    }

    add.open = false;
  } catch (e) {
    add.error = e instanceof Error ? e.message : "Network error";
  } finally {
    add.loading = false;
  }
}

onMounted(async () => {
  await fetch(`http://localhost:3333/api/channels/all/user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((data: ChannelComponentProps[]) => {
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      channels.value = data;
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

const onChannelClick = async (channelName: string, channelId: number) => {
  activeChannel.value = channelName;
  channelsLoading.value = true;

  console.log("Channel clicked:", channelName, channelId);

  await fetch(`http://localhost:3333/api/channels/chats/${channelId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((data: Chat[]) => {
      channelChats.value = data;
      channelsLoading.value = false;
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};
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

.loader {
  width: 120px;
  background: linear-gradient(90deg, #0001 33%, #0005 50%, #0001 66%) #f2f2f2;
  background-size: 300% 100%;
  animation: l1 1s infinite linear;
}
@keyframes l1 {
  0% {
    background-position: right;
  }
}
</style>
