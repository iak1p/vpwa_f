<template>
  <section
    class="col column chat-section"
    style="
      background: #282b30;
      border-right: 1px solid #424549;
      position: relative;
    "
  >
    <div
      v-if="loading"
      style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div class="chats-loader"></div>
    </div>

    <q-scroll-area
      v-else
      class="chat-body col"
      style="display: flex; align-items: end; justify-content: end; width: 100%"
    >
      <div class="" v-if="messages.length == 0">
        <p>Start a new conversation</p>
      </div>
      <q-list v-else padding class="q-gutter-y-sm" style="height: 100%">
        <MessageComponent v-for="message in messages" :message="message" />
      </q-list>
    </q-scroll-area>

    <div
      class="chat-input row items-center q-px-md q-py-sm"
      style="position: absolute; bottom: 0; width: 100%"
    >
      <q-input
        v-model="messageInput"
        :placeholder="`Message #${activeChatName}`"
        dense
        filled
        input-class="text-white"
        class="chat-input__field col"
      />
      <q-btn @click="sendMessage"> Send </q-btn>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import MessageComponent from "./MessageComponent.vue";
import { useMessagesStore } from "src/stores/messages";
import { ref } from "vue";
import { useChatsStore } from "src/stores/chats";

const messagesStore = useMessagesStore();
const { messages, loading } = storeToRefs(messagesStore);

const chatsStore = useChatsStore();
const { activeChatName, activeChatId } = storeToRefs(chatsStore);

const sendMessage = async () => {
  if (!activeChatId.value || messageInput.value == "") return;

  console.log(messageInput.value, activeChatId.value);
  fetch(`http://localhost:3333/api/messages/${activeChatId.value}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      content: messageInput.value,
    }),
  })
    .then((res) => res.json())
    .catch((err) => console.error(err))
    .then((data) => {
      console.log(data);

      messagesStore.addNewMessage(data);
    });
};

const messageInput = ref("");
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
