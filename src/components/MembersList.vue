<template>
  <section class="panel q-pa-md scroll-y" style="overflow: visible">
    <div class="mb-header">
      <div class="mb-title">Members</div>
      <div class="mb-count">{{ members.length }}</div>
    </div>

    <q-skeleton v-if="loading" type="rect" height="28px" class="q-mb-sm" />

    <q-list v-else bordered separator>
      <q-item v-for="m in members" :key="m.id">
        <q-item-section avatar>
          <div
            class="bm-avatar bm-sm"
            style="position: absolute"
            :style="{ backgroundColor: m.color }"
          >
            <span
              >{{ m.surname?.[0]?.toUpperCase()
              }}{{ m.name?.[0]?.toUpperCase() }}</span
            >

            <span class="bm-status" :class="statusClass(m.status)"></span>

            <div class="buble" :class="{ active: m.showMessage }">
              <p style="padding: 5px; font-weight: normal">{{ m.message }}</p>
            </div>
          </div>
        </q-item-section>

        <q-item-section>
          <div class="" style="display: flex">
            <q-item-label class="text-white"
              >{{ m.surname }} {{ m.name }}</q-item-label
            >
            <q-icon
              v-if="(owner.id == m.id)"
              name="star"
              color="yellow"
              style="padding-left: 5px"
            />
          </div>
          <q-item-label
            caption
            class="row items-center q-gutter-xs text-grey-5"
          >
            <span>@{{ m.username }}</span>
            <span
              v-if="m.typing"
              class="typing-text"
              style="cursor: pointer"
              @click="showMessage(m.id)"
            ></span>
          </q-item-label>
        </q-item-section>
      </q-item>

      <div v-if="!members.length" class="q-pa-md text-grey-5">
        No members yet
      </div>
    </q-list>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useChannelsStore } from "src/stores/channels";
import { useMembersStore, type Status } from "src/stores/members";

const channels = useChannelsStore();
const { activeChannelId, owner } = storeToRefs(channels);

const membersStore = useMembersStore();
const { members, loading } = storeToRefs(membersStore);

const showMessage = (userId: number) => {
  membersStore.showMessage(userId);
};

onMounted(async () => {
  if (activeChannelId.value) {
    await membersStore.fetchByChannelId(activeChannelId.value);
  }
});

watch(activeChannelId, (id) => {
  membersStore.clear();
  if (id) membersStore.fetchByChannelId(id);
});

function statusClass(st?: Status | null) {
  return st === "online"
    ? "is-online"
    : st === "dnd"
    ? "is-away"
    : "is-offline";
}
</script>

<style scoped>
.buble {
  position: absolute;
  bottom: 25px;
  right: calc(100%);
  background-color: white;
  border-radius: 10px;
  border-bottom-right-radius: 0px;
  padding: 5px;
  max-width: 200px;
  color: black;
  z-index: 1000000;
  white-space: normal;
  word-wrap: break-word;
  display: none;
}
.buble.active {
  display: block;
}
.panel {
  background-color: #282b30;
  /* border-left: 1px solid #424549; */
}
.mb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.mb-title {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}
.mb-count {
  color: #9e9e9e;
  font-size: 12px;
}

.bm-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  user-select: none;
}
.bm-sm {
  width: 32px;
  height: 32px;
  font-size: 12px;
}
.bm-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #282b30;
}
.bm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.is-online {
  background: #21ba45;
}
.is-away {
  background: #f2c037;
}
.is-offline {
  background: #9e9e9e;
}

.typing-text {
  width: fit-content;
  clip-path: inset(0 1.2ch 0 0);
  animation: l4 1s steps(3) infinite;
}
.typing-text:before {
  content: "typing...";
}
@keyframes l4 {
  to {
    clip-path: inset(0 -1ch 0 0);
  }
}
</style>
