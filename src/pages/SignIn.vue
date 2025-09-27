<template>
  <q-page class="flex flex-center">
    <div class="login-card">
      <h2>Login with your account</h2>

      <q-form novalidate @submit="onSubmit" class="login-form">
        <q-input
          v-model="username"
          label="Nickname"
          outlined
          hide-bottom-space
          no-error-icon
          :rules="[(val) => !!val]"
          @focus="errorMessage = ''"
        />

        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          required
          :rules="[
            (val) => !!val,
            (val) =>
              /.+@.+\..+/.test(val) ||
              `It should contains a symbol '@'. In email '${val}' it isnt.`,
          ]"
          hide-bottom-space
          no-error-icon
          novalidate
          @focus="errorMessage = ''"
        />

        <q-input
          v-model="password"
          :type="showPwd ? 'text' : 'password'"
          label="Password"
          outlined
          required
          :rules="[(val) => !!val]"
          hide-bottom-space
          @focus="errorMessage = ''"
        >
          <template #append>
            <q-icon
              :name="showPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPwd = !showPwd"
            />
          </template>
        </q-input>

        <div v-if="errorMessage" class="full-row error-message">
          {{ errorMessage }}
        </div>

        <q-btn label="Sign in" type="submit" class="submit-btn full-width" />
        <!--color: "primary" -->
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const email = ref("");
const password = ref("");
const showPwd = ref(false);
const router = useRouter();
const errorMessage = ref("");

const API = "http://localhost:3333";

async function onSubmit() {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Login failed");

    const tokenStr: string | undefined = data?.token?.token;
    if (!tokenStr) throw new Error("Token not returned by server");

    localStorage.setItem("token", tokenStr);
    // localStorage.setItem("user", JSON.stringify(data?.user ?? null));

    await router.push("/main");
  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = "Unknown error";
    }
  }
}
</script>

<style scoped>
/* .login-page {
  display: flex;
  justify-content: center; 
  align-items: center;    
  min-height: 100vh;    
} */

.login-card {
  background: rgba(128, 128, 128, 0.12);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90vw;
  padding: 24px;
  transition: box-shadow 0.25s ease;
}

.login-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}
.error-message {
  color: red;
  width: 100%;
}
h2 {
  font-size: 28px;
  margin: 0 0 40px 0;
  font-weight: 500;
  color: #1d1d1f;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* .submit-btn {
  margin-top: 20px;
  padding: 10px 0;
  font-weight: bold;
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
