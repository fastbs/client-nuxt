<template>
  <div>

  </div>
</template>

<script lang="ts" setup>
import UsersService from "@/services/UsersService";

const store = useMainStore();
const router = useRouter();
const confirm = useConfirm();
const emitter = useEmitter();
const { $toast } = useNuxtApp();

onMounted(() => {
  if (!store.isLogged) {
    $toast.errors(new Error("Доступ запрещен!"));
    router.push({ name: "index" });
  } else {

    confirm.require({
      message: 'Вы желаете выйти из системы?',
      header: 'Предупреждение',
      icon: 'pi pi-times-circle',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await UsersService.logout();
          $toast.success("Выполнен выход из системы");
          emitter.emit("menu:update");
          router.push({ name: "index" });
        } catch (err) {
          $toast.errors(err);
          window.history.length > 1 ? router.go(-1) : router.push({ name: "index" });
        }
      },
      reject: () => {
        $toast.warn("Выход из системы отменен");
        window.history.length > 1 ? router.go(-1) : router.push({ name: "index" });
      }
    });
  }
});

onBeforeMount(async () => {
});

</script>
