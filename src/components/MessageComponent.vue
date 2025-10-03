<template>
  <div
    class="col"
    :class="{
      'message-ping': ping,
      message: !ping,
    }"
  >
    <div class="user-photo" :style="{ backgroundColor: message.sender.color }">
      {{ message.sender.name?.[0]?.toUpperCase()
      }}{{ message.sender.surname?.[0]?.toUpperCase() }}
    </div>
    <div>
      <div class="row" style="align-items: center; gap: 10px">
        <p class="username">
          <!-- {{ message.sender.name }} {{ message.sender.surname }} -->
          {{ message.sender.username }}
        </p>
        <p class="date">
          {{
            new Date(message.createdAt).toLocaleDateString("de-DE", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          }}
        </p>
      </div>
      <p class="message-content">
        {{ message.content }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "src/stores/user";
import type { Message } from "./models";
import { storeToRefs } from "pinia";

let ping = false;
const mentionRegex = /@(\w+)/g;

const userStore = useUserStore();
const { username } = storeToRefs(userStore);

export interface MessageComponentProps {
  message: Message;
}

const props = defineProps<MessageComponentProps>();

if (props.message.type == "ping") {
  const matches = props.message.content.match(mentionRegex);

  matches?.forEach((match) => {
    console.log("MATCHHHHH", match, username.value);

    if (match.includes(`@${username.value}`)) ping = true;
  });
}
</script>

<style>
.date {
  color: gray;
  font-size: 12px;
}
.user-photo {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  background-color: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-right: 10px;
  user-select: none;
}
.message {
  /* background-color: red; */
  display: flex;
  color: white;
  margin: 10px;
  width: 98%;
}
.message-content {
  /* background-color: blue; */
  font-size: 14px;
}
.message-ping {
  background-color: rgba(255, 166, 0, 0.07);
  display: flex;
  color: white;
  padding: 10px;
  width: 98%;
  border-bottom-right-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
