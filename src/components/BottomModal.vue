<template>
  <div class="fixed-bottom-left z-max q-ma-sm">
    <q-card
      flat
      bordered
      class="overlay-card"
      style="background-color: #282b30; border: 1px solid #424549"
    >
      <q-item class="q-pa-sm" style="width: 410px">
        <q-item-section avatar>
          <div
            class="bm-avatar"
            @click="cycleStatus"
            title="Нажми чтобы сменить свой пол"
          >
            <span>{{ initials }}</span>
            <span class="bm-status" :class="statusClass"></span>
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-white">{{ displayName }}</q-item-label>
          <q-item-label
            caption
            class="row items-center q-gutter-xs text-grey-5"
          >
            <span>@{{ username }}</span>
            <span class="bm-dot" :class="statusClass"></span>
          </q-item-label>
        </q-item-section>
        <q-item-section
          side
          style="display: flex; flex-direction: row; align-items: center"
        >
          <q-btn flat round dense icon="mic" class="text-grey-4" />
          <q-btn flat round dense icon="settings" class="text-grey-4 q-ml-xs" />
          <q-btn
            flat
            round
            dense
            icon="logout"
            class="text-red-4 q-ml-xs"
            @click="onLogout()"
          />
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";

export interface BottomModalProps {
  onLogout: () => void;
}
defineProps<BottomModalProps>();

type Status = "online" | "dnd" | "offline";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
function writeUser(u: any) {
  localStorage.setItem("user", JSON.stringify(u));
}

const user = ref(readUser());

const displayName = computed((): string => {
  const name = (user.value?.name ?? "").trim();
  const surname = (user.value?.surname ?? "").trim();
  if (name || surname) return [name, surname].filter(Boolean).join(" ");
  return "User";
});

const username = computed((): string => {
  return user.value?.username ?? "user";
});

const initials = computed((): string => {
  const parts = displayName.value.split(" ").filter(Boolean);
  const a = (parts[0]?.[0] ?? "U").toUpperCase();
  const b = (parts[1]?.[0] ?? "").toUpperCase();
  return a + b || "U";
});

function isStatus(s: unknown): s is Status {
  return s === "online" || s === "dnd" || s === "offline";
}
const status = ref<Status>(
  isStatus(user.value?.status) ? user.value.status : "online"
);

const statusClass = computed<string>(() =>
  status.value === "online"
    ? "is-online"
    : status.value === "dnd"
    ? "is-away"
    : "is-offline"
);

function setStatus(s: Status) {
  status.value = s;
  user.value = { ...user.value, status: s };
  writeUser(user.value);
}

function cycleStatus() {
  setStatus(
    status.value === "online"
      ? "dnd"
      : status.value === "dnd"
      ? "offline"
      : "online"
  );
}
</script>

<style scoped>
.overlay-card {
  border-radius: 12px;
}

.bm-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #1976d2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  user-select: none;
  cursor: pointer;
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
</style>
