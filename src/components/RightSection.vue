<template>
  <div class="" style="height: 100%; background-color: #282b30">
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

    <div class="q-px-md q-pb-sm">
      <div v-if="cmdError" class="text-negative text-caption">
        {{ cmdError }}
      </div>
      <div v-else-if="cmdInfo" class="text-positive text-caption">
        {{ cmdInfo }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const command = ref("");
const commandInput = ref();
import MembersList from "src/components/MembersList.vue";
import { channelLeave } from "src/services/channelLeave";
import { addUser } from "src/services/addUser";
import { deleteChannel } from "src/services/deleteChannel";
import { revokeUser } from "src/services/revokeUser";
import { joinChannel } from "src/services/joinChannel";
import { useMembersStore } from "src/stores/members";
import { useChannelsStore } from "src/stores/channels";
import { kickUserById } from "src/services/kickUser";

const cmdError = ref<string | null>(null);
const cmdInfo = ref<string | null>(null);
const membersStore = useMembersStore();
const channelStore = useChannelsStore();

const onInputChange = (val: string | number | null) => {
  console.log("В процессе ввода:", val);
};

const onInputBlur = async (val: string) => {
  const commands = val.split(" ");
  console.log("Закончил ввод:", commands);

  if (commands[0] == "/cancel") {
    console.log("YOUU DELETED CHANNEL");
    await channelLeave();
    cmdInfo.value = "Channel left/deleted";
    setTimeout(() => {
      cmdInfo.value = null;
    }, 4000);
  } else if (commands[0] == "/invite") {
    const { ok, message } = await addUser(commands[1] || "");
    if (!ok) {
      cmdError.value = message;
      setTimeout(() => {
        cmdError.value = null;
      }, 4000);
    } else {
      cmdInfo.value = message;
      setTimeout(() => {
        cmdInfo.value = null;
      }, 4000);
    }
  } else if (commands[0] == "/quit") {
    const { ok, message } = await deleteChannel();
    if (!ok) {
      cmdError.value = message;
      setTimeout(() => (cmdError.value = null), 4000);
    } else {
      cmdInfo.value = message;
      setTimeout(() => (cmdInfo.value = null), 4000);
    }
  } else if (commands[0] == "/revoke") {
    const { ok, message } = await revokeUser(commands[1] || "");
    if (!ok) {
      cmdError.value = message;
      setTimeout(() => (cmdError.value = null), 4000);
    } else {
      cmdInfo.value = message;
      setTimeout(() => (cmdInfo.value = null), 4000);
    }
  } else if (commands[0] == "/join") {
    const args = commands.slice(1);

    const isPrivate = args[args.length - 1] === "private";
    const channelName = isPrivate
      ? args.slice(0, -1).join(" ")
      : args.join(" ");

    if (!channelName.trim()) {
      cmdError.value = "Channel name is required";
      setTimeout(() => (cmdError.value = null), 4000);
    } else {
      const { ok, message } = await joinChannel(channelName, isPrivate);
      if (!ok) {
        cmdError.value = message;
        setTimeout(() => (cmdError.value = null), 4000);
      } else {
        cmdInfo.value = message;
        setTimeout(() => (cmdInfo.value = null), 4000);
      }
    }
  } else if (commands[0] == "/kick") {
    const nick = (commands[1] || "").trim();
    if (!nick) {
      cmdError.value = "Nick is required";
      setTimeout(() => (cmdError.value = null), 4000);
    } else {
      const target = membersStore.findByUsername(nick);
      if (!target) {
        cmdError.value = `User "${nick}" not found in this channel`;
        setTimeout(() => (cmdError.value = null), 4000);
      } else {
        try {
          const channelId = Number(channelStore.activeChannelId);
          const { message, appliedBan, votes } = await kickUserById(
            channelId,
            target.id
          );

          cmdInfo.value = appliedBan
            ? `User banned (hlasov: ${votes})`
            : `U've voted (${votes}/3)`;
          setTimeout(() => (cmdInfo.value = null), 4000);

          if (appliedBan) {
            membersStore.removeMember(target.id);
          }
        } catch (e: any) {
          cmdError.value = e?.message || "Kick failed";
          setTimeout(() => (cmdError.value = null), 4000);
        }
      }
    }
  }

  command.value = "";
  commandInput.value?.blur();
};

// const command = defineModel<string>("command");
</script>

<style></style>
