<template>
  <div
    class="channel-icon"
    :style="{ backgroundColor: prorps.channel.color }"
    :class="{ 'channel-icon--active': active }"
  >
    <span class="channel-icon__letters">
      {{
        prorps.channel.name
          .split(" ")
          .filter(Boolean)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      }}</span
    >
  </div>
</template>

<script setup lang="ts">
import type { Channel } from "./models";

export interface ChannelComponentProps {
  channel: Channel;
  active?: boolean;
}

const prorps = withDefaults(defineProps<ChannelComponentProps>(), {
  active: false,
});

console.log("PRORPS", prorps.channel);
</script>

<style scoped>
.channel-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  text-align: center;
  line-height: 50px;
  color: white;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
  transition: 0.3s opacity ease;
}

.channel-icon:hover {
  opacity: 0.8;
  transition: 0.3s opacity ease;
}

.channel-icon__letters {
  display: inline-block;
}

.channel-icon--active {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>
