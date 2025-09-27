<template>
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
      @click="openCreateDialog()"
    />
  </section>

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
          @click="submitCreate(create)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import ChannelComponent from "./ChannelComponent.vue";
import type { ChannelComponentProps } from "./ChannelComponent.vue";

export interface SectionChannelsProps {
  channels: ChannelComponentProps[];
  activeChannel: string | null;
  onChannelClick: (channelName: string, channelId: number) => Promise<void>;
  submitCreate: (create: any) => Promise<void>;
}

defineProps<SectionChannelsProps>();

const create = reactive({
  open: false,
  loading: false,
  name: "",
  description: "",
  isPrivate: false,
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
</script>
