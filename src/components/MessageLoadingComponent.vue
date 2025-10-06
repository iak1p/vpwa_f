<template>
  <div class="col message">
    <div class="user-photo">
    </div>
    <div class="">
      <div class="row" style="align-items: center; gap: 10px; padding-bottom: 5px;">
        <div
          class="loader"
          style="
            width: 100px;
            background-color: gray;
            border-radius: 5px;
            opacity: 0.3;
            height: 20px;
          "
        ></div>
      </div>

      <div
        class="loader"
        style="
          width: 450px;
          background-color: gray;
          border-radius: 5px;
          opacity: 0.3;
          height: 40px;
          padding-top: 5px;
        "
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">

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
