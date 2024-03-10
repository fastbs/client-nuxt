<template>
  <div class="flex justify-content-center">
    <pCard :pt="{ root: { class: 'sm:col-12 md:col-8 lg:col-6 xl:col-4 mb-3' } }">
      <template #title>
        <div class="grid">
          <div class="col-6">Логин</div>
          <pDivider />
        </div>
      </template>
      <template #content>
        <div class="p-fluid formgrid grid">
          <div class="field col-12">
            <label for="title">E-mail</label>
            <pInputText id="title" v-model="email" type="text" :class="{ 'p-invalid': !emailState }" />
            <small v-if="!emailState" class="p-error fadeinup animation-duration-200" id="text-error">Логин
              обязателен</small>
          </div>
          <div class="field col-12">
            <label for="description">Пароль</label>
            <pInputText id="description" v-model="password" type="password" :class="{ 'p-invalid': !passwordState }" />
            <small v-if="!passwordState" class="p-error fadeinup animation-duration-200" id="text-error">Пароль
              длиной не менее 6 символов</small>
          </div>
          <div class="field col-6">
            <pButton :disabled="!formState" label="Войти" severity="primary" @click="onSubmit()" />
          </div>
          <div class="field col-6">
            <router-link :to="{ name: 'user-registration' }">
              <pButton label="Регистрация" severity="success" />
            </router-link>
          </div>
        </div>
      </template>
    </pCard>
  </div>
</template>

<script lang="ts" setup>
import UsersService from "@/services/UsersService"

const store = useMainStore();
const router = useRouter();
const emitter = useEmitter();
const { $toast } = useNuxtApp();

const email = ref("");
const password = ref("");

const emailState = computed(() => (email.value.length >= 1 ? true : false));
const passwordState = computed(() => (password.value.length >= 6 ? true : false));
const formState = computed(() => (emailState.value && passwordState.value));

const onSubmit = async () => {
  if (formState.value) {
    try {
      await UsersService.login(email.value, password.value);
      $toast.success("Выполнен вход в систему");
      emitter.emit("menu:update");
      router.push({ name: "index" });
    } catch (errors) {
      console.log("Login error: ", errors);
      $toast.errors(errors);
    }
  }
};

onBeforeMount(async () => {
  if (store.isLogged) {
    $toast.errors(new Error("Доступ запрещен!"));
    router.push({ name: "index" });
  }
});


</script>
