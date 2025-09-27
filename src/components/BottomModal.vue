<template>
  <div class="fixed-bottom-left z-max q-ma-sm">
    <q-card
      flat
      bordered
      class="overlay-card"
      style="background-color: #282b30; border: 1px solid #424549"
    >
      <q-item class="q-pa-sm" style="width: 410px">
        <q-item-section avatar>
          <div
            class=""
            style="
              width: 38px;
              height: 38px;
              border-radius: 100%;
              background-color: #1976d2;
              color: white;
              line-height: 38px;
              text-align: center;
            "
          >
            AY
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-white">Amin Yapusi</q-item-label>
        </q-item-section>
        <q-item-section
          side
          style="display: flex; flex-direction: row; align-items: center"
        >
          <q-btn flat round dense icon="mic" class="text-grey-4" />
          <q-btn flat round dense icon="settings" class="text-grey-4 q-ml-xs" />
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>
