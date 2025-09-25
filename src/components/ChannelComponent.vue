<template>
  <div
    class="channel"
    :style="{ backgroundColor: color }"
    :class="{ active: active }"
  >
    <p>{{ title[0] }}{{ title[1] }}</p>
  </div>
</template>

<script setup lang="ts">
export interface ChannelComponentProps {
  title: string;
  color: string;
  active?: boolean;
}

withDefaults(defineProps<ChannelComponentProps>(), {
  color: "primary",
  active: false,
});
</script>

<style scoped>
.channel {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  text-align: center;
  line-height: 50px;
  color: white;
  font-size: 20px;
  cursor: pointer;
}
.channel.active {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>
