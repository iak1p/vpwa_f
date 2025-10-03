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
      class="chat-body col"
      style="display: flex; align-items: end; justify-content: end; width: 100%"
    >
      <div class="" v-if="messages.length == 0">
        <p>Start a new conversation</p>
      </div>
      <div class="" v-else>
        <q-list padding class="q-gutter-y-sm" style="height: 100%">
          <MessageComponent v-for="message in messages" :message="message" />
        </q-list>

        <!-- <q-list padding class="q-gutter-y-sm" style="height: 100%">
          <MessageLoadingComponent v-for="i in 10" :key="i" />
        </q-list> -->
      </div>
    </q-scroll-area>

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
import { onMounted, ref } from "vue";
import { useChatsStore } from "src/stores/chats";
import { watch } from "vue";
import { getSocket } from "src/lib/socket";
import { useUserStore } from "src/stores/user";
import { useChannelsStore } from "src/stores/channels";
import MessageLoadingComponent from "./MessageLoadingComponent.vue";

const messagesStore = useMessagesStore();
const { messages, loading } = storeToRefs(messagesStore);

const chatsStore = useChatsStore();
const { activeChatName, activeChatId } = storeToRefs(chatsStore);

const channelStore = useChannelsStore();
const { activeChannelName, activeChannelId } = storeToRefs(channelStore);

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

  // fetch(`http://localhost:3333/api/messages/${activeChatId.value}/send`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${localStorage.getItem("token")}`,
  //   },
  //   body: JSON.stringify({
  //     content: messageInput.value,
  //   }),
  // })
  //   .then((res) => res.json())
  //   .catch((err) => console.error(err))
  //   .then((data) => {
  //     console.log(data);

  //     messagesStore.addNewMessage(data);

  //     messageInput.value = "";
  //     messageField.value?.focus();
  //   });

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
