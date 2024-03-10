<template>
  <div class="card mb-3" style="padding-top: 1.5rem;">
    <pDataView v-if="!loading && posts.length > 0" :value="posts" dataKey="id" :layout="layout" paginator :rows="3"
      :pt="{ header: { class: 'p-0', style: 'border-top-width: 0px;' } }">
      <template #header>
        <div class="flex">
          <div class="flex flex-shrink-0 justify-content-start">
            <h2>Публикации</h2>
          </div>
          <div class="flex flex-grow-1 justify-content-end ">
            <router-link v-if="UsersService.checkPermission('posts', 'create')" :to="{ name: 'posts-create' }">
              <pButton icon="pi pi-plus" aria-label="Добавить публикацию" v-tooltip.left="'Добавить публикацию'" rounded
                size="small" :pt="{
                  root: { class: 'mr-3' }
                }" />
            </router-link>
            <pDataViewLayoutOptions v-model="layout" />
          </div>
        </div>
      </template>

      <template #list="slotProps">
        <div class="grid grid-nogutter">
          <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 mt-3">
            <div class="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
              <img v-if="item.image" :src="store.config.postImagePath + item.image.id" :alt="item.title"
                class="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" />
              <div
                class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                  <div class="text-2xl font-bold text-900">{{ item.title }}</div>
                  <div class="flex align-items-center gap-3">
                    <span class="flex align-items-center gap-2">
                      <i class="pi pi-tag"></i>
                      <span class="font-semibold">{{ item.category.name }}</span>
                    </span>
                  </div>
                  <div class="flex align-items-center gap-3">
                    <NuxtLink v-if="UsersService.checkPermission('posts', 'read')"
                      :to="{ name: 'posts-id', params: { id: item.id } }">
                      <pButton label="Просмотр" />
                    </NuxtLink>
                    <NuxtLink v-if="UsersService.checkPermission('posts', 'update')"
                      :to="{ name: 'posts-edit-id', params: { id: item.id } }">
                      <pButton label="Изменить" severity="success" />
                    </NuxtLink>
                    <pButton v-if="UsersService.checkPermission('posts', 'delete')" @click="deletePost(item.id)"
                      label="Удалить" severity="danger" />
                  </div>
                </div>
                <div class="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="grid grid-nogutter">
          <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 mt-3 sm:col-6 lg:col-12 xl:col-4 p-2">
            <div class="p-4 border-1 surface-border surface-card border-round">
              <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-user-plus"></i>
                  <span class="font-semibold">{{ item.user_created.first_name }}</span>
                  <i class="pi pi-tag  ml-4"></i>
                  <span class="font-semibold">{{ item.category.name }}</span>
                </div>
              </div>
              <div class="flex flex-column align-items-center gap-3 py-5">
                <img v-if="item.image" :src="store.config.postImagePath + item.image.id" class="w-9 shadow-2 border-round"
                  :alt="item.title" />
                <div class="text-2xl font-bold">{{ item.title }}</div>
                <div class="flex gap-3">
                  <NuxtLink v-if="UsersService.checkPermission('posts', 'read')"
                    :to="{ name: 'posts-id', params: { id: item.id } }">
                    <pButton label="Просмотр" />
                  </NuxtLink>
                  <NuxtLink v-if="UsersService.checkPermission('posts', 'update')"
                    :to="{ name: 'posts-edit-id', params: { id: item.id } }">
                    <pButton label="Изменить" severity="success" />
                  </NuxtLink>
                  <pButton v-if="UsersService.checkPermission('posts', 'delete')" @click="deletePost(item.id)"
                    label="Удалить" severity="danger" />
                </div>
              </div>
              <div class="flex align-items-center gap-3">
              </div>
            </div>
          </div>
        </div>
      </template>
    </pDataView>
  </div>
</template>

<script lang="ts" setup>
import UsersService from "@/services/UsersService"
import PostsService from "@/services/PostsService";
import type { CategoryDto, PostDto } from "@/services/dto/posts.dto";

const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();
const store = useMainStore();

const layout = ref<"list" | "grid" | undefined>("grid");
const loading = ref(true);

const posts = ref<PostDto[]>([]);
const categories = ref<CategoryDto[]>([]);

onBeforeMount(async () => {
  if (UsersService.checkPermission("posts", "read")) {
    getPosts();
  } else {
    $toast.errors(new Error("Доступ запрещен!"));
    router.push({ name: "index" });
  }
});

const getPosts = async () => {
  const response = await PostsService.fetch();
  if (response) {
    posts.value = response.posts;
    categories.value = response.categories;
    loading.value = false;
  }
};

const deletePost = (id: number) => {
  confirm.require({
    message: 'Вы желаете удалить публикацию?',
    header: 'Предупреждение',
    icon: 'pi pi-times-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const response = await PostsService.delete(id);
      if (response) {
        $toast.success("Публикация удалена");
        getPosts();
      }
    },
    reject: () => {
      $toast.warn("Отмена удаления публикации");
    }
  });
};

</script>