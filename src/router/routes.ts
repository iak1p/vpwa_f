import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },
  {
    path: "/",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      { path: "login", component: () => import("pages/SignIn.vue") },
      { path: "register", component: () => import("pages/SignUp.vue") }, // => /auth/login
    ],
  },
  {
    path: "/test",
    component: () => import("pages/TestPage.vue"),
  },
  {
    path: '/main',
    component: () => import('pages/MainPage.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
