<template>
  <div class="layout-static p-ripple-disabled">
    <div class="layout-topbar">
      <router-link to="/" class="layout-topbar-logo">
        <img src="/images/moon.png" alt="logo" />
        <span>Fastbs Application</span>
      </router-link>
      <pMenubar :model="menu">
        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click="navigate">
              <span class="p-menuitem-icon" :class="item.icon"></span>
              <span>{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
            <span class="p-menuitem-icon" :class="item.icon"></span>
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </template>
      </pMenubar>
      <div class="layout-topbar-menu">
        <h4>User: {{ store.user ? `${store.user.first_name} - ${store.user.email}` : 'unregistered' }}</h4>
        <button class="p-link layout-topbar-button" @click="updateMenu()">
          <i class="pi pi-sync"></i>
          <span>Update Menu</span>
        </button>
      </div>
    </div>
    <div class="layout-main-container">
      <div class="layout-main">
        <pToast />
        <pConfirmDialog />
        <NuxtPage />
      </div>
      <div class="layout-footer">
        <img src="@/assets/layout/images/logo-dark.svg" alt="Logo" class="mr-2" height="20"> by
        <span class="font-medium ml-2">PrimeVue</span>
      </div>
    </div>
    <div class="layout-mask"></div>
  </div>
</template>

<script lang="ts" setup>
import type { ToastMessageOptions } from "primevue/toast";

import { socket } from "@/services/socket";
import UsersService from "@/services/UsersService"
import type { Menu2ItemDto } from "@/services/dto/users.dto";

const menu = ref<Menu2ItemDto[]>([]);
const loading = ref(true);
const toast = useToast();
const store = useMainStore();
const { isLogged } = storeToRefs(store);

const emitter = useEmitter();

emitter.on("menu:update", async () => {
  updateMenu();
});

watch(() => isLogged.value, (newValue, prevValue) => {
  console.log(">>> isLogged: ", newValue);
})

socket.off();

const updateMenu = async () => {
  menu.value = await UsersService.getMenu() ?? [];
  //console.log("store.user: ", store.user);
};

onBeforeMount(async () => {
  await UsersService.checkLogin();
  updateMenu();
  loading.value = false;
});

onMounted(() => {
  store.bindWsEvents();
});

</script>

<style>
@import '@/assets/styles.scss';
</style>
