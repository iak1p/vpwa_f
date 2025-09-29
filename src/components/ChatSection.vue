<template>
  <section
    class="col column chat-section"
    style="background:#282b30; border-right:1px solid #424549"
  >
    <q-scroll-area class="chat-body col">
      <q-list padding class="q-gutter-y-sm">
        <MessageComponent v-for="i in 1" :key="i" />
      </q-list>
    </q-scroll-area>

    <div class="chat-input row items-center q-px-md q-py-sm">
      <q-input
        v-model="message"
        placeholder="Message #general"
        dense
        filled
        input-class="text-white"
        class="chat-input__field col"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import MessageComponent from "./MessageComponent.vue";

// export interface SectionChannelsProps {
//   message: string;
// }
// const props = defineProps<SectionChannelsProps>();

// const emit = defineEmits<{
//   (e: "update:message", v: string): void;
// }>();
// const { message } = props;

const message = defineModel<string>("message");
</script>
