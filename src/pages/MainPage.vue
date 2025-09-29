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
      :activeChannel="activeChannel"
      :channelsLoading="channelsLoading"
      :channelChats="channelChats"
      :onChannelClick="onChannelClick"
      :submitAddMember="submitAddMember"
      :submitCreateChat="submitCreateChat"
      :activeChat="activeChat"
      :onLeaveChannel="leaveOrDeleteActiveChannel"
      :owner-label="ownerLabel"
    />

    <ChatSection class="col" v-model:message="message" />

    <section>Right Side</section>
  </div>

  <BottomModal :on-logout="handleLogout" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { ChannelComponentProps } from "src/components/ChannelComponent.vue";
import BottomModal from "src/components/BottomModal.vue";
import SectionChannels from "src/components/SectionChannels.vue";
import SectionChats from "src/components/SectionChats.vue";
import ChatSection from "src/components/ChatSection.vue";
import type { Chat } from "src/components/ChannelChatsComponent.vue";
import { useRouter } from "vue-router";

const API = "http://localhost:3333";
const channels = ref<ChannelComponentProps[]>([]);
const activeChannel = ref(channels.value[0]?.name ?? "");

const channelChats = ref<Chat[]>([]);
const message = ref("");
const channelsLoading = ref(false);
const router = useRouter();
const activeChat = ref(channelChats.value[0]?.title ?? "");

const ownerLabel = computed<string | null>(() => {
  const ch = channels.value.find((c) => c.name === activeChannel.value);
  const dn = ch?.owner?.displayName?.trim() || "";
  const un = ch?.owner?.username?.trim() || "";

  if (!dn && !un) return null;
  if (dn && un) return `${dn} (@${un})`;
  return dn || `@${un}`;
});

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
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      channelChats.value = data;
      channelsLoading.value = false;

      activeChat.value = data[0]?.title ?? "";

      console.log(activeChat);
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

async function leaveOrDeleteActiveChannel() {
  const name = activeChannel.value;
  if (!name) return;

  try {
    const res = await fetch(
      `${API}/api/channels/${encodeURIComponent(name)}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.message || "Failed to leave/delete channel");

    channels.value = channels.value.filter((c) => c.name !== name);
    activeChannel.value = channels.value[0]?.name ?? "";
    channelChats.value = [];
    activeChat.value = "";
  } catch (e) {
    console.error(e);
  }
}
async function submitCreateChat(create: any) {
  create.error = "";

  if (!create.title?.trim()) {
    create.error = "Title is required";
    return;
  }

  const ch = channels.value.find((c) => c.name === activeChannel.value);
  if (!ch?.id) {
    create.error = "Channel ID not found";
    return;
  }

  create.loading = true;
  try {
    const res = await fetch(
      `${API}/api/chats/create/${encodeURIComponent(ch.id)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ title: create.title.trim() }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      create.error =
        data?.message ||
        (res.status === 409
          ? "Chat with this title already exists"
          : "Failed to create chat");
      return;
    }

    const newChat = data.chat;
    channelChats.value = [newChat, ...channelChats.value];
    activeChat.value = newChat?.title ?? activeChat.value;

    create.open = false;
  } catch (e) {
    create.error = e instanceof Error ? e.message : "Network error";
  } finally {
    create.loading = false;
  }
}

// import { Dialog } from "quasar";

// function leaveOrDeleteActiveChannel() {
//   const name = activeChannel.value;
//   if (!name) return;

//   const channel = channels.value.find((c) => c.name === name);
//   const isOwner = (channel as any)?.role === "owner"; // или как у вас хранится роль

//   Dialog.create({
//     title: "Подтверждение",
//     message: isOwner
//       ? `Вы владелец канала "${name}". При выходе он будет удалён.`
//       : `Вы точно хотите выйти из канала "${name}"?`,
//     persistent: true,
//     ok: {
//       label: isOwner ? "Удалить" : "Выйти",
//       color: "negative",
//     },
//     cancel: { label: "Отмена" },
//   }).onOk(() => {
//     void (async () => {
//       try {
//         const res = await fetch(
//           `${API}/api/channels/${encodeURIComponent(name)}/leave`,
//           {
//             method: "DELETE",
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//             },
//           }
//         );

//         const data = await res.json().catch(() => ({}));
//         if (!res.ok)
//           throw new Error(data?.message || "Failed to leave/delete channel");

//         channels.value = channels.value.filter((c) => c.name !== name);
//         activeChannel.value = channels.value[0]?.name ?? "";
//         channelChats.value = [];
//         activeChat.value = "";
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   });
// }

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
