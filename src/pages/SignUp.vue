<template>
  <q-page class="flex flex-center">
    <div class="signup-card">
      <h2>Create your account</h2>

      <q-form novalidate @submit="onSubmit" class="form-grid">
        <q-input
          v-model="firstName"
          label="First name"
          outlined
          required
          :rules="[(val) => !!val || 'Enter your name']"
          hide-bottom-space
          no-error-icon
        />

        <q-input
          v-model="lastName"
          label="Last name"
          outlined
          required
          :rules="[(val) => !!val || 'Enter your surname']"
          hide-bottom-space
          no-error-icon
        />

        <q-input
          v-model="nickname"
          label="Nickname"
          outlined
          required
          :rules="[(val) => !!val || 'Enter your username']"
          hide-bottom-space
          no-error-icon
          class="full-row"
        />

        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          required
          :rules="[
            (val) => !!val || 'Enter email',
            (val) =>
              /.+@.+\..+/.test(val) ||
              `It should contains a symbol '@'. In email '${val}' it isnt.`,
          ]"
          hide-bottom-space
          novalidate
          class="full-row"
        />

        <q-input
          v-model="password"
          :type="showPwd ? 'text' : 'password'"
          label="Password"
          outlined
          required
          :rules="[(val) => !!val || 'Enter password']"
          hide-bottom-space
          class="full-row"
        >
          <!--color: "primary" -->
          <template #append>
            <q-icon
              :name="showPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPwd = !showPwd"
            />
          </template>
        </q-input>

        <q-btn
          label="Create account"
          type="submit"
          class="full-row text-weight-bold submit-btn"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

const firstName = ref("");
const lastName = ref("");
const nickname = ref("");
const email = ref("");
const password = ref("");
const showPwd = ref(false);

function onSubmit() {
  console.log({
    firstName: firstName.value,
    lastName: lastName.value,
    nickname: nickname.value,
    email: email.value,
    password: password.value,
  });
}
</script>

<style scoped>
h2 {
  font-size: 28px;
  margin: 0 0 24px 0;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
}

.signup-card {
  background: rgba(128, 128, 128, 0.12);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 28px;
  transition: box-shadow 0.25s ease;
  width: 480px;
  max-width: 92vw;
  margin-top: 60px;
}

.signup-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 15px;
}

.full-row {
  grid-column: 1 / -1;
}
/* .submit-btn {
  padding: 10px 0;  
  margin-top: 12px;  
  width: 100%;
} */

.submit-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px 0;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;

  background: linear-gradient(
    90deg,
    red,
    orange,
    yellow,
    green,
    blue,
    indigo,
    violet
  );
  background-size: 400% 400%;
  animation: rainbow 8s ease infinite;
  transition: transform 0.2s ease;
}

.submit-btn:hover {
  transform: scale(1.03);
}

@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
