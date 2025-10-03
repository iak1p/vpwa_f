<template>
  <div class="" style="height: 100%; background-color: #282b30;">
    <MembersList class="col" />
    <q-input
      ref="commandInput"
      v-model="command"
      placeholder="Type command"
      standout
      input-class="text-white"
      class="chat-input__field col q-pa-md"
      @update:model-value="onInputChange"
      @change="onInputBlur"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const command = ref("");
const commandInput = ref();
import MembersList from "src/components/MembersList.vue";
import { channelLeave } from "src/services/channelLeave";
import { addUser } from "src/services/addUser";

const onInputChange = (val: string | number | null) => {
  console.log("В процессе ввода:", val);
};

const onInputBlur = async (val: string) => {
  const commands = val.split(" ");
  console.log("Закончил ввод:", commands);

  if (commands[0] == "/cancel") {
    console.log("YOUU DELETED CHANNEL");
    await channelLeave();
  } else if (commands[0] == "/invite") {
    console.log("YOUU INVITED", commands[1]);
    addUser(commands[1]);
  }

  command.value = "";
  commandInput.value?.blur();
};

// const command = defineModel<string>("command");
</script>

<style></style>
