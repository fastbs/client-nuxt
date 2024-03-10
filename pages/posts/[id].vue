<template>
  <div class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="flex">
      <div class="flex flex-shrink-0 justify-content-start">
        <h2>Публикации</h2>
      </div>
      <div class="flex flex-grow-1 justify-content-end ">
        <NuxtLink v-if="UserService.checkPermission('posts', 'create')" :to="{ name: 'posts-create' }">
          <pButton icon="pi pi-plus" aria-label="Добавить публикацию" v-tooltip.left="'Добавить публикацию'" rounded
            size="small" />
        </NuxtLink>
      </div>
    </div>

    <pDivider :pt="{ root: { class: 'mt-0' } }" />
    <div class="flex justify-content-center">
      <pCard v-if="!loading" :pt="{ root: { class: 'sm:col-12 md:col-12 lg:col-8 xl:col-6 mb-3' } }">
        <template #title>
          <div class="grid">
            <div class="col-6">{{ post!.title }}</div>
            <div class="col-6 flex flex-wrap justify-content-end gap-3">
              <NuxtLink v-if="UserService.checkPermission('posts', 'update')"
                :to="{ name: 'posts-edit-id', params: { id: post!.id } }">
                <pButton label=" Изменить" severity="success" />
              </NuxtLink>
              <pButton v-if="UserService.checkPermission('posts', 'delete')" @click="deletePost()" label="Удалить"
                severity="danger" />
            </div>
            <pDivider />
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-8">
              <p class="text-3xl">{{ post!.description }}</p>
              <span class="flex align-items-center gap-2">
                <i class="pi pi-tag"></i>
                <span class="font-semibold">{{ categories!.find((x) => x.id == post!.category!.id)!.name }}</span>
              </span>
            </div>
            <div class="col-4">
              <img v-if="post!.image" :src="store.config.postImagePath + post!.image.id"
                class="max-w-full p-1 border-1 border-blue-500" alt="Post image">
            </div>
          </div>
        </template>
      </pCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserService from "@/services/UsersService";
import PostsService from "@/services/PostsService";
import type { PostDto, CategoryDto } from "@/services/dto/posts.dto";

const store = useMainStore();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();


const post = ref<PostDto>();
const categories = ref<CategoryDto[]>();
const loading = ref(true);

const getPost = async () => {
  console.log("posts[id] id: ", Number(route.params.id));
  const response = await PostsService.get(Number(route.params.id));
  console.log("response: ", response);
  if (response) {
    post.value = response.post;
    categories.value = response.categories;
    loading.value = false;
  }
};

const deletePost = () => {
  confirm.require({
    message: 'Вы желаете удалить публикацию?',
    header: 'Предупреждение',
    icon: 'pi pi-times-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const response = await PostsService.delete(post.value!.id);
      if (response) {
        $toast.success("Публикация удалена");
        router.push({ name: "posts" });
      }
    },
    reject: () => {
      $toast.warn("Отмена удаления публикации");
    }
  });
};

onBeforeMount(async () => {
  if (UserService.checkPermission("posts", "read")) {
    getPost();
  } else {
    $toast.errors(new Error("Доступ запрещен!"));
    router.push({ name: "index" });
  }
});

</script>
