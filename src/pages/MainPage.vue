<template>
  <div
    class=""
    style="
      display: grid;
      grid-template-columns: 80px 350px auto 350px;
      height: 100vh;
    "
  >
    <section
      class="q-pa-md col"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        border-right: 1px solid #424549;
        background-color: #282b30;
        overflow-y: auto;
        scrollbar-width: none;
      "
    >
      <ChannelComponent
        v-for="channel in channels"
        :key="channel.name"
        v-bind="channel"
        :active="activeChannel === channel.name"
        @click="onChannelClick(channel.name, channel.id)"
      />

      <q-btn
        color="teal-7"
        flat
        icon="add"
        style="width: 50px; height: 50px; border-radius: 10px"
      />
    </section>

    <section
      class="col"
      style="background-color: #282b30; border-right: 1px solid #424549"
    >
      <div class="channel__header">
        <p>{{ activeChannel ? activeChannel : "no chat selected" }}</p>
        <!-- <p>Savelii Shaposhnyk</p> -->
      </div>

      <div
        v-if="channelsLoading"
        class="q-pa-md"
        style="display: flex; gap: 5px; flex-direction: column"
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

    <!-- <section class="q-pa-md col" style="background-color: #282b30">
      Right Side
    </section> -->
    <section>Right Side</section>

    <BottomModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ChannelChatsComponent from "src/components/ChannelChatsComponent.vue";
import ChannelComponent from "src/components/ChannelComponent.vue";
import type { ChannelComponentProps } from "src/components/ChannelComponent.vue";
import type { Chat } from "src/components/ChannelChatsComponent.vue";
import BottomModal from "src/components/BottomModal.vue";
// import MessageComponent from "src/components/MessageComponent.vue";

const channels = ref<ChannelComponentProps[]>([]);
const activeChannel = ref(channels.value[0]?.name ?? "");

const channelChats = ref<Chat[]>([]);

const message = ref("");

const channelsLoading = ref(false);

onMounted(async () => {
  await fetch("http://localhost:3333/api/channels/all/user", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((data: ChannelComponentProps[]) => {
      channels.value = data;
      console.log(data);
      activeChannel.value = channels.value[0]?.name ?? "";
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

// const chatsMap: Record<string, ChannelChatComponentProps> = {
//   "test 1": {
//     chats: [
//       { id: 1, name: "general" },
//       { id: 2, name: "random" },
//       { id: 3, name: "help" },
//     ],
//   },
//   "test 2": {
//     chats: [
//       { id: 4, name: "news" },
//       { id: 5, name: "support" },
//     ],
//   },
//   "test 3": {
//     chats: [{ id: 6, name: "dev" }],
//   },
// };
</script>

<style>
.channel__header {
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #424549;
  border-radius: 10px;
  padding: 20px;
  color: white;
}

.add-channel {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  text-align: center;
  line-height: 50px;
  color: white;
  font-size: 20px;
  cursor: pointer;
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
</style>
