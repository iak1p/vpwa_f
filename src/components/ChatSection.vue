<template>
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
</template>

<script lang="ts" setup>
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
