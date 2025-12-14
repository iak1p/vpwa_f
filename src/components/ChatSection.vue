<template>
  <section
    class="col column chat-section"
    style="
      background: #282b30;
      border-right: 1px solid #424549;
      position: relative;
    "
  >
    <q-scroll-area
      ref="chatScroll"
      class="chat-body col"
      style="width: 100%"
      :content-style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: '100%',
      }"
      @scroll="onScroll"
    >
      <div v-if="messages.length === 0">
        <p>No messages</p>
      </div>

      <div v-else>
        <q-list padding class="q-gutter-y-sm">
          <MessageComponent v-for="m in messages" :key="m.id" :message="m" />
        </q-list>
      </div>
    </q-scroll-area>

    <div
      class="chat-input row items-center q-px-md q-py-sm"
      style="bottom: 0; width: 100%"
    >
      <q-input
        v-model="messageInput"
        ref="messageField"
        class="chat-input__field col"
        input-class="text-white"
        :placeholder="`Message #${activeChatName}`"
        dense
        filled
        @keyup.enter="sendMessage"
        @update:model-value="onInputChange"
      />

      <q-menu
        v-model="menuOpen"
        :target="messageField?.$el"
        anchor="top left"
        self="bottom left"
        fit
        no-parent-event
        no-focus
        no-refocus
        class="bg-dark text-white"
      >
        <q-list dense>
          <q-item
            v-for="cmd in filteredCommands"
            :key="cmd.name"
            clickable
            v-close-popup
            active-class="bg-grey-8"
            @click="apply(cmd)"
          >
            <q-item-section>
              <div class="text-weight-medium">/{{ cmd.name }}</div>
              <div class="text-caption text-grey-4">
                {{ cmd.desc }}
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="filteredCommands.length === 0">
            <q-item-section class="text-grey-4 text-caption">
              No commands found
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>

      <q-menu
        v-model="menuUserOpen"
        :target="messageField?.$el"
        anchor="top left"
        self="bottom left"
        fit
        no-parent-event
        no-focus
        no-refocus
        class="bg-dark text-white"
      >
        <q-list dense>
          <q-item
            v-for="member in members"
            :key="member.username"
            clickable
            v-close-popup
            active-class="bg-grey-8"
            @click="applyUsername(member.username)"
          >
            <q-item-section>
              <div class="text-weight-medium">/{{ member.username }}</div>
            </q-item-section>
          </q-item>

          <q-item v-if="filteredCommands.length === 0">
            <q-item-section class="text-grey-4 text-caption">
              No commands found
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>

      <q-btn
        label="Send"
        :loading="sending"
        :disable="sending || !messageInput.trim()"
        @click="sendMessage"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: "open-members"): void;
}>();

import { Notify } from "quasar";
import { storeToRefs } from "pinia";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import MessageComponent from "./MessageComponent.vue";

import { getSocket } from "src/lib/socket";

import { useChatsStore } from "src/stores/chats";
import { useChannelsStore } from "src/stores/channels";
import { useMembersStore } from "src/stores/members";
import { useMessagesStore } from "src/stores/messages";
import { useUserStore } from "src/stores/user";

import { addUser } from "src/services/addUser";
import { channelLeave } from "src/services/channelLeave";
import { deleteChannel } from "src/services/deleteChannel";
import { joinChannel } from "src/services/joinChannel";
import { kickUserById } from "src/services/kickUser";
import { revokeUser } from "src/services/revokeUser";

const menuOpen = ref(false);
const menuUserOpen = ref(false);
const selectedIndex = ref(0);

const commands = [
  { name: "invite", desc: "Invite user: /invite username" },
  {
    name: "cancel",
    desc: "Quit from channel or Quit and delete (only owner): /cancel",
  },
  { name: "quit", desc: "Delete channel (only owner): /quit" },
  {
    name: "revoke",
    desc: "Revoke user from channel: /revoke username",
  },
  {
    name: "join",
    desc: "Join/Create channel: /join channel_name [private]",
  },
  {
    name: "kick",
    desc: "Kick user: /kick username",
  },
  {
    name: "list",
    desc: "List of all users: /list",
  },
];

const queryAfterSlash = computed(() => {
  const text = (messageInput.value ?? "").toString().trim();
  if (!text.startsWith("/")) return "";

  return (text.slice(1).split(/\s+/)[0] ?? "").toLowerCase();
});

const filteredCommands = computed(() => {
  const q = queryAfterSlash.value;
  if (messageInput.value.trim() === "/") return commands;
  return commands.filter((c) => c.name.startsWith(q));
});

async function apply(cmd: { name: string }) {
  messageInput.value = `/${cmd.name} `;
  menuOpen.value = false;

  await nextTick(() => {
    messageField.value?.focus?.();
  });
}

async function applyUsername(username: string) {
  messageInput.value += `${username} `;
  menuUserOpen.value = false;

  await nextTick(() => {
    messageField.value?.focus?.();
  });
}

const messagesStore = useMessagesStore();
const { messages } = storeToRefs(messagesStore);

const chatsStore = useChatsStore();
const { activeChatName, activeChatId } = storeToRefs(chatsStore);

const channelStore = useChannelsStore();
const { activeChannelId } = storeToRefs(channelStore);

const membersStore = useMembersStore();
const { members } = storeToRefs(membersStore);

const userStore = useUserStore();
const { id: userId } = storeToRefs(userStore);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chatScroll = ref<any>(null);
const messageInput = ref("");
const messageField = ref();
const sending = ref(false);

let top = false;

const socket = getSocket();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onScroll(details: any) {
  if (details.verticalPosition <= 0) {
    console.log("Доскроллил до верха!");
    top = true;
    await messagesStore.fetchNewMessages();
  }
}

function scrollToBottom(smooth = false) {
  const el = chatScroll.value?.getScrollTarget?.();
  if (!el) return;

  const to = Math.max(0, el.scrollHeight - el.clientHeight);
  chatScroll.value.setScrollPosition("vertical", to, smooth ? 300 : 0);
}

onMounted(async () => {
  await nextTick();
  scrollToBottom(false);
});

watch(
  () => messages.value.length,
  async () => {
    if (top) {
      top = false;
      const el = chatScroll.value?.getScrollTarget?.();
      chatScroll.value.setScrollPosition("vertical", el.scrollTop + 15, 0);
      return;
    }

    await nextTick();
    scrollToBottom(false);
  }
);

const onInputChange = (value: string | number | null) => {
  const val = (value ?? "").toString();

  const text = val; // не trim(), чтобы не ломать пробелы
  const trimmedStart = text.trimStart();

  // @меню: если строка заканчивается на "@что-то" (без пробела после)
  const mentionMatch = text.match(/(?:^|\s)@([^\s@]*)$/);
  menuUserOpen.value = !!mentionMatch;
  if (menuUserOpen.value) selectedIndex.value = 0;

  // /команды: только пока вводится команда (до первого пробела)
  const isCommandTyping =
    trimmedStart.startsWith("/") && !trimmedStart.slice(1).includes(" ");

  menuOpen.value = isCommandTyping;
  if (menuOpen.value) selectedIndex.value = 0;

  // typing
  if (val !== "") {
    socket.emit("channel:typing", {
      activeChannelId: activeChannelId.value,
      activeChatId: activeChannelId.value,
      userId: userId.value,
      message: val,
    });
  } else {
    menuOpen.value = false;
    menuUserOpen.value = false;

    socket.emit("channel:stopTyping", {
      activeChannelId: activeChannelId.value,
      activeChatId: activeChannelId.value,
      userId: userId.value,
    });
  }
};

// const onInputChange = (value: string | number | null) => {
//   const val = (value ?? "").toString();
//   console.log(val);

//   const t = val.trim();

//   if (val !== "") {
//     if (t.includes("@")) {
//       menuUserOpen.value = true;
//       selectedIndex.value = 0;
//     } else {
//       menuUserOpen.value = false;
//     }

//     if (t.startsWith("/")) {
//       menuOpen.value = true;
//       selectedIndex.value = 0;
//     } else {
//       menuOpen.value = false;
//     }

//     socket.emit("channel:typing", {
//       activeChannelId: activeChannelId.value,
//       activeChatId: activeChannelId.value,
//       userId: userId.value,
//       message: val,
//     });
//   } else {
//     menuOpen.value = false;
//     menuUserOpen.value = false;

//     socket.emit("channel:stopTyping", {
//       activeChannelId: activeChannelId.value,
//       activeChatId: activeChannelId.value,
//       userId: userId.value,
//     });
//   }
// };

onMounted(async () => {
  if (activeChatId.value) {
    await messagesStore.fetchMessages(activeChatId.value);
  }
});

watch(activeChatId, async (next) => {
  messagesStore.clear();
  if (next) await messagesStore.fetchMessages(next);
});

const createNotification = (type: "negative" | "positive", message: string) => {
  Notify.create({
    type,
    message,
    position: "top",
    timeout: 3000,
  });
};

const onInputBlur = async (val: string) => {
  const commands = val.split(" ");

  switch (commands[0]) {
    case "/cancel": {
      await channelLeave();
      createNotification("positive", "Channel left/deleted");
      break;
    }

    case "/invite": {
      const { ok, message } = await addUser(commands[1] || "");

      if (!ok) {
        createNotification("negative", message);
        break;
      }

      createNotification("positive", message);
      break;
    }

    case "/quit": {
      const { ok, message } = await deleteChannel();

      if (!ok) {
        createNotification("negative", message);
        break;
      }

      createNotification("positive", message);
      break;
    }

    case "/revoke": {
      const { ok, message } = await revokeUser(commands[1] || "");

      if (!ok) {
        createNotification("negative", message);
        break;
      }

      createNotification("positive", message);
      break;
    }

    case "/join": {
      const args = commands.slice(1);

      const isPrivate = args[args.length - 1] === "private";
      const channelName = isPrivate
        ? args.slice(0, -1).join(" ")
        : args.join(" ");

      if (!channelName.trim()) {
        createNotification("negative", "Channel name is required");
        break;
      }

      const { ok, message } = await joinChannel(channelName, isPrivate);

      if (!ok) {
        createNotification("negative", message);
        break;
      }

      createNotification("positive", message);
      break;
    }

    case "/kick": {
      const nick = (commands[1] || "").trim();

      if (!nick) {
        createNotification("negative", "Nick is required");
        break;
      }

      const target = membersStore.findByUsername(nick);

      if (!target) {
        createNotification(
          "negative",
          `User "${nick}" not found in this channel`
        );
        break;
      }

      try {
        const channelId = Number(channelStore.activeChannelId);
        const { appliedBan, votes } = await kickUserById(channelId, target.id);

        if (appliedBan) {
          createNotification("positive", `User banned (votes: ${votes})`);
          membersStore.removeMember(target.id);
        } else {
          createNotification("positive", `You've voted (${votes}/3)`);
        }
      } catch (e) {
        createNotification(
          "negative",
          e instanceof Error ? e.message : "Kick failed"
        );
      }

      break;
    }

    case "/list": {
      emit("open-members");
      const memberNames = members.value.map((m) => m.username).join(", ");
      createNotification("positive", `Members: ${memberNames}`);
      break;
    }

    default:
      createNotification("negative", "Unknown command");
      break;
  }

  messageInput.value = "";
};

const sendMessage = async () => {
  if (messageInput.value?.startsWith("/")) {
    await onInputBlur(messageInput.value);
    return;
  }

  const mentionRegex = /@(\w+)/g;

  if (!activeChatId.value || messageInput.value == "") {
    createNotification(
      "negative",
      "Cannot send empty message or no active chat"
    );
  }

  console.log(messageInput.value, activeChatId.value);
  sending.value = true;

  const mentions = [...messageInput.value.matchAll(mentionRegex)].map(
    (m) => m[1]
  );
  const userPinged = members.value.some((m) => mentions.includes(m.username));

  try {
    const res = await fetch(
      `http://localhost:3333/api/messages/${activeChatId.value}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: messageInput.value,
          type: !userPinged ? "text" : "ping",
        }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to send");

    console.log(data);
  } catch (err) {
    console.error(err);
  } finally {
    sending.value = false;
    menuOpen.value = false;

    messageInput.value = "";
    messageField.value?.focus();

    socket.emit("channel:stopTyping", {
      activeChannelId: activeChannelId.value,
      activeChatId: activeChannelId.value,
      userId: userId.value,
    });
  }
};
</script>

<style></style>
