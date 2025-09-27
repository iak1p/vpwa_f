<template>
  <div class="app-grid">
    <section class="panel q-pa-md sidebar scroll-y">
      <ChannelComponent
        v-for="channel in channels"
        :key="channel.name"
        v-bind="channel"
        :active="activeChannel === channel.name"
        @click="onChannelClick(channel.name, channel.id)"
      />
      <q-btn
        class="add-channel-btn"
        color="teal-7"
        flat
        icon="add"
        @click="openCreateDialog"
      />
    </section>

    <section
      class="col"
      style="background-color: #282b30; border-right: 1px solid #424549"
    >
      <div class="channel__header">
        <p>{{ activeChannel || "no chat selected" }}</p>
        <q-btn
          v-if="activeChannel"
          class="add-member-btn"
          icon="person_add"
          flat
          round
          size="sm"
          @click="openAddDialog"
        />
      </div>

      <div
        v-if="channelsLoading"
        class="q-pa-md"
        style="display: flex; gap: 5px; flex-direction: column;"
      >
        <div
          class="loader"
          style="
            width: 100%;
            height: 20px;
            background-color: gray;
            border-radius: 5px;
            opacity: 0.5;
          "
        ></div>
        <div
          class="loader"
          style="
            width: 100%;
            height: 20px;
            background-color: gray;
            border-radius: 5px;
            opacity: 0.5;
          "
        ></div>
      </div>

      <ChannelChatsComponent v-else :chats="channelChats" />
    </section>

    <section
      class="col"
      style="
        display: flex;
        flex-direction: column;
        background-color: #282b30;
        justify-content: end;
      "
    >
      <q-scroll-area class="chat-body">
        <q-list padding class="q-gutter-y-sm">
          <p>erer</p>
          <!-- <MessageComponent v-for="m in messages" :key="m.id" :message="m" /> -->
        </q-list>
      </q-scroll-area>

      <div class="chat-input row items-center q-px-md q-py-sm">
        <q-input
          v-model="message"
          placeholder="Message #general"
          dense
          filled
          input-class="text-white"
          class="chat-input__field"
          style="width: 100%"
        />

        <!-- <q-btn
          unelevated
          color="primary"
          class="chat-input__send"
          icon="send"
        /> -->
      </div>
    </section>

    <section>Right Side</section>

    <BottomModal />
  </div>

  <q-dialog v-model="create.open" persistent>
    <q-card class="card--wide">
      <q-card-section class="card__title">Create channel</q-card-section>

      <q-card-section class="card__body">
        <q-input
          v-model="create.name"
          label="Name"
          outlined
          :disable="create.loading"
          :error="!!create.error"
          :error-message="create.error"
          @focus="create.error = ''"
        />
        <q-input
          v-model="create.description"
          label="Description"
          type="textarea"
          outlined
          :disable="create.loading"
          @input="create.error = ''"
        />
        <q-toggle
          v-model="create.isPrivate"
          label="Private channel"
          :disable="create.loading"
        />
      </q-card-section>

      <q-card-actions align="right" class="card__actions">
        <q-btn
          label="Cancel"
          flat
          :disable="create.loading"
          @click="closeCreateDialog"
        />
        <q-btn
          label="Create"
          color="primary"
          :loading="create.loading"
          :disable="create.loading"
          @click="submitCreate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="add.open" persistent>
    <q-card class="card--narrow">
      <q-card-section class="card__title">Add member</q-card-section>

      <q-card-section class="card__body">
        <q-input
          v-model="add.username"
          label="Username"
          outlined
          :disable="add.loading"
          :error="!!add.error"
          :error-message="add.error"
          @input="add.error = ''"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="card__actions">
        <q-btn
          label="Cancel"
          flat
          :disable="add.loading"
          @click="closeAddDialog"
        />
        <q-btn
          label="Add"
          color="primary"
          :loading="add.loading"
          :disable="add.loading"
          @click="submitAddMember"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import ChannelChatsComponent from "src/components/ChannelChatsComponent.vue";

import { ref, reactive, onMounted } from "vue";

import ChannelComponent from "src/components/ChannelComponent.vue";
import type { ChannelComponentProps } from "src/components/ChannelComponent.vue";
import type { Chat } from "src/components/ChannelChatsComponent.vue";
import BottomModal from "src/components/BottomModal.vue";
// import MessageComponent from "src/components/MessageComponent.vue";

const API = "http://localhost:3333";

const channels = ref<ChannelComponentProps[]>([]);
const activeChannel = ref(channels.value[0]?.name ?? "");
const channelChats = ref<Chat[]>([]);
const message = ref("");
const channelsLoading = ref(false);

const create = reactive({
  open: false,
  loading: false,
  name: "",
  description: "",
  isPrivate: false,
  error: "" as string,
});

const add = reactive({
  open: false,
  loading: false,
  username: "",
  error: "" as string,
});

function openCreateDialog() {
  create.open = true;
  create.name = "";
  create.description = "";
  create.isPrivate = false;
  create.error = "";
}
function closeCreateDialog() {
  if (!create.loading) create.open = false;
}

function openAddDialog() {
  add.open = true;
  add.username = "";
  add.error = "";
}
function closeAddDialog() {
  if (!add.loading) add.open = false;
}

async function submitAddMember() {
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

async function submitCreate() {
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

onMounted(async () => {
  await fetch(`http://localhost:3333/api/channels/all/user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((data: ChannelComponentProps[]) => {
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

.channel__header {
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #424549;
  border-radius: 10px;
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  height: 20px;
  background: linear-gradient(90deg, #0001 33%, #0005 50%, #0001 66%) #f2f2f2;
  background-size: 300% 100%;
  animation: l1 1s infinite linear;
}
@keyframes l1 {
  0% {
    background-position: right;
  }
}

.card--wide {
  min-width: 420px;
}
.card--narrow {
  min-width: 360px;
}
.card__title {
  font-size: 18px;
  font-weight: 600;
}
.card__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card__actions {
  gap: 12px;
}
</style>
