<template>
  <div class="col message">
    <div class="user-photo">AY</div>
    <div class="">
      <div class="row" style="align-items: center; gap: 10px">
        <p class="username">Amin Yapusi</p>
        <p class="date">21.09.2025 10:06</p>
      </div>
      <p class="message-content">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
        cupiditate nulla fugit libero eum, cum blanditiis nostrum asperiores ab
        ratione reprehenderit dolor delectus velit numquam suscipit, accusamus,
        dicta labore! Aut?
      </p>
    </div>
  </div>
  <div class="col message-ping">
    <div class="user-photo">AY</div>
    <div class="">
      <div class="row" style="align-items: center; gap: 10px">
        <p class="username">Amin Yapusi</p>
        <p class="date">21.09.2025 10:06</p>
      </div>
      <p class="message-content">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
        cupiditate nulla fugit libero eum, cum blanditiis nostrum asperiores ab
        ratione reprehenderit dolor delectus velit numquam suscipit, accusamus,
        dicta labore! Aut?
      </p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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
  /* font-weight: bold; */
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
