<template>
  <div class="app-grid">
    <!-- Sidebar -->
    <section class="panel q-pa-md sidebar scroll-y">
      <ChannelComponent
        v-for="ch in channels"
        :key="ch.name"
        v-bind="ch"
        :active="activeChannel === ch.name"
        @click="activeChannel = ch.name"
      />
      <q-btn
        class="add-channel-btn"
        color="teal-7"
        flat
        icon="add"
        @click="openCreateDialog"
      />
    </section>

    <!-- Channel area -->
    <section class="panel">
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

      <ChannelChatsComponent
        v-bind="chatsMap[activeChannel] ?? { name: '', chats: [] }"
      />
    </section>

    <!-- Right panels (плейсхолдеры) -->
    <section class="panel q-pa-md"></section>
    <section class="panel q-pa-md"></section>
  </div>

  <!-- Create channel dialog -->
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
        <q-btn label="Cancel" flat :disable="create.loading" @click="closeCreateDialog" />
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

  <!-- Add member dialog -->
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
        <q-btn label="Cancel" flat :disable="add.loading" @click="closeAddDialog" />
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
import { ref, reactive, onMounted } from "vue";
import ChannelComponent from "src/components/ChannelComponent.vue";
import type { ChannelComponentProps } from "src/components/ChannelComponent.vue";
import type { ChannelChatComponentProps } from "src/components/ChannelChatsComponent.vue";

const API = "http://localhost:3333";

const channels = ref<ChannelComponentProps[]>([]);
const activeChannel = ref(channels.value[0]?.name ?? "");

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
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
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
  try {
    const res = await fetch(`${API}/api/channels/all/user`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });
    const data = (await res.json()) as ChannelComponentProps[];
    channels.value = data;
    activeChannel.value = channels.value[0]?.name ?? "";
  } catch (err) {
    console.error(err);
  }
});

const chatsMap: Record<string, ChannelChatComponentProps> = {
  "test 1": {
    chats: [
      { id: 1, name: "general" },
      { id: 2, name: "random" },
      { id: 3, name: "help" },
    ],
  },
  "test 2": { chats: [{ id: 4, name: "news" }, { id: 5, name: "support" }] },
  "test 3": { chats: [{ id: 6, name: "dev" }] },
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
.add-member-btn { margin-left: 8px; }

.add-channel-btn {
  width: 50px;
  height: 50px;
  border-radius: 10px;
}

.card--wide { min-width: 420px; }
.card--narrow { min-width: 360px; }
.card__title { font-size: 18px; font-weight: 600; }
.card__body { display: flex; flex-direction: column; gap: 16px; }
.card__actions { gap: 12px; }
</style>
