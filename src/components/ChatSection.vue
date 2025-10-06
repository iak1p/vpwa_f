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
      @scroll="onScroll"
      class="chat-body col"
      :content-style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: '100%',
      }"
      style="width: 100%"
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

    <!-- <MessageLoadingComponent v-if="loading" v-for="i in 1" :key="i" /> -->

    <div
      class="chat-input row items-center q-px-md q-py-sm"
      style="bottom: 0; width: 100%"
    >
      <q-input
        v-model="messageInput"
        ref="messageField"
        :placeholder="`Message #${activeChatName}`"
        dense
        filled
        input-class="text-white"
        class="chat-input__field col"
        @keyup.enter="sendMessage"
        @update:model-value="onInputChange"
      />
      <!-- <q-btn @click="sendMessage"> Send </q-btn> -->
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
import { storeToRefs } from "pinia";
import MessageComponent from "./MessageComponent.vue";
import { useMessagesStore } from "src/stores/messages";
import { nextTick, onMounted, ref } from "vue";
import { useChatsStore } from "src/stores/chats";
import { watch } from "vue";
import { getSocket } from "src/lib/socket";
import { useUserStore } from "src/stores/user";
import { useChannelsStore } from "src/stores/channels";
// import MessageLoadingComponent from "./MessageLoadingComponent.vue";
import { useMembersStore } from "src/stores/members";
import MessageLoadingComponent from "./MessageLoadingComponent.vue";

const messagesStore = useMessagesStore();
const { messages, loading } = storeToRefs(messagesStore);

const chatScroll = ref<any>(null);
let top = false;

async function onScroll(details: any) {
  // details — объект, который Quasar передаёт, с параметрами скролла
  // details.verticalPosition — текущая позиция
  // details.verticalSize — полная высота контента
  // details.verticalContainerSize — видимая область

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

const chatsStore = useChatsStore();
const { activeChatName, activeChatId } = storeToRefs(chatsStore);

const channelStore = useChannelsStore();
const { activeChannelName, activeChannelId } = storeToRefs(channelStore);

const memberslStore = useMembersStore();
const { members } = storeToRefs(memberslStore);

const userStore = useUserStore();
const { id: userId, username } = storeToRefs(userStore);

const messageInput = ref("");
const messageField = ref();
const sending = ref(false);

const socket = getSocket();

const onInputChange = (val: string | number | null) => {
  console.log(val);
  if (val !== "") {
    socket.emit("channel:typing", {
      activeChannelId: activeChannelId.value,
      activeChatId: activeChannelId.value,
      userId: userId.value,
      message: val,
    });
  } else {
    socket.emit("channel:stopTyping", {
      activeChannelId: activeChannelId.value,
      activeChatId: activeChannelId.value,
      userId: userId.value,
    });
  }
};

onMounted(() => {
  if (activeChatId.value) {
    messagesStore.fetchMessages(activeChatId.value);
  }
});

watch(activeChatId, async (next) => {
  messagesStore.clear();
  if (next) await messagesStore.fetchMessages(next);
});

const sendMessage = async () => {
  const mentionRegex = /@(\w+)/g;

  if (!activeChatId.value || messageInput.value == "") return;

  console.log(messageInput.value, activeChatId.value);
  sending.value = true;

  // const matches = messageInput.value.match(mentionRegex);

  // const mentionRegex = /@(\w+)/g;
  const mentions = [...messageInput.value.matchAll(mentionRegex)].map(
    (m) => m[1]
  );

  const userPinged = members.value.some((m) => mentions.includes(m.username));

  // let userPinged = false;

  // members.value.forEach((member) => {
  //   console.log(
  //     "MEMMDMDFHISDFGKSDFKJHSDKFJHKJSDHFJK",
  //     member,
  //     member.username,
  //     matches?.includes(`@${member.username}`)
  //   );

  //   if (matches?.includes(`@${member.username}`)) {
  //     userPinged = true;
  //     break;
  //   }
  // });

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

    // messagesStore.addNewMessage(data);

    messageInput.value = "";
    messageField.value?.focus();
  } catch (err) {
    console.error(err);
  } finally {
    sending.value = false;

    socket.emit("channel:stopTyping", {
      activeChannelId: activeChannelId.value,
      activeChatId: activeChannelId.value,
      userId: userId.value,
    });
  }
};
</script>

<style>
.chats-loader {
  width: fit-content;
  /* font-weight: bold; */
  font-family: monospace;
  font-size: 20px;
  color: white;
  clip-path: inset(0 3ch 0 0);
  animation: l4 1s steps(4) infinite;
}
.chats-loader:before {
  content: "Loading...";
}
@keyframes l4 {
  to {
    clip-path: inset(0 -1ch 0 0);
  }
}
</style>
