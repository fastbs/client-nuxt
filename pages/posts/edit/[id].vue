<template>
  <div class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="flex">
      <div class="flex flex-shrink-0 justify-content-start">
        <h2>Публикации</h2>
      </div>
      <div class="flex flex-grow-1 justify-content-end ">
        <router-link v-if="UsersService.checkPermission('posts', 'create')" :to="{ name: 'posts-create' }">
          <pButton icon="pi pi-plus" aria-label="Добавить публикацию" v-tooltip.left="'Добавить публикацию'" rounded
            size="small" />
        </router-link>
      </div>
    </div>

    <pDivider :pt="{ root: { class: 'mt-0' } }" />

    <div class="flex justify-content-center">
      <pCard v-if="!loading" :pt="{ root: { class: 'sm:col-12 md:col-12 lg:col-8 xl:col-6 mb-3' } }">
        <template #title>
          <div class="grid">
            <div class="col-6">Изменение публикации id={{ post.id }}</div>
            <div class="col-6 flex flex-wrap justify-content-end gap-3">
              <pButton @click="updatePost()" label="Изменить" severity="success" :disabled="!formState" />
              <pButton v-if="UsersService.checkPermission('posts', 'delete')" @click="deletePost()" label="Удалить"
                severity="danger" />
            </div>
            <pDivider />
          </div>
        </template>
        <template #content>
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <label for="title">Заголовок</label>
              <pInputText id="title" v-model="post.title" type="text" :class="{ 'p-invalid': !titleState }" />
              <small v-if="!titleState" class="p-error fadeinup animation-duration-200" id="text-error">Заголовок длиной
                не менее 5 символов</small>
            </div>
            <div class="field col-12">
              <label for="description">Описание</label>
              <pInputText id="description" v-model="post.description" type="text"
                :class="{ 'p-invalid': !descriptionState }" />
              <small v-if="!descriptionState" class="p-error fadeinup animation-duration-200" id="text-error">Описание
                длиной не менее 5 символов</small>
            </div>
            <div class="field col-12">
              <label for="category">Категория</label>
              <pDropdown v-model="post.category.id" :options="categories" optionLabel="name" optionValue="id"
                placeholder="Выберите категорию" inputId="category" :class="{ 'p-invalid': !categoryState }" />
              <small v-if="!categoryState" class="p-error fadeinup animation-duration-200" id="text-error">Категория
                обязательна</small>
            </div>
            <div class="field col-12">
              <label for="image">Изображение</label>
              <div>
                <img id="image"
                  :src="(post.image && post.image.filename_download) ? (store.config.postImagePath + post.image.id) : ''"
                  class="max-h-20rem max-w-full p-1 border-1 border-blue-500" alt="Нет изображения"
                  @click="handleAttachment()" />
              </div>
              <div v-if="postImage.name" class="field col-12">
                <span class="ms-4 mr-2">Имя: {{ postImage.name }}</span>
                <span class="ms-4">Размер: {{ postImage.size }} байт</span>
              </div>
            </div>
            <div class="field col-6">
              <pButton label="Изменить изображение" severity="help" @click="handleAttachment()" />
              <input id="hiddenAttachment" class="hide" type="file" accept="image/*"
                @change.prevent="fileChange($event)" />
              <a id="attachmentAnchor" class="hide" />
            </div>
            <div class="field col-6">
              <pButton label="Удалить изображение" severity="danger" @click="deleteImage()" />
            </div>
          </div>
        </template>
      </pCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import cloneDeep from 'lodash/cloneDeep';

import UsersService from "@/services/UsersService";
import PostsService from "@/services/PostsService";
import type { CategoryDto, PostDto, UpdatePostDto } from "@/services/dto/posts.dto";


const store = useMainStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

const post = ref<PostDto>({
  id: 0,
  title: "",
  description: "",
  category: {
    id: 0,
  },
});
const categories = ref<CategoryDto[]>([]);
let postImage = ref(new File([""], ""));
const loading = ref(true);
let imageChanged = false;

console.log("post: ", post.value);

const titleState = computed(() => (post.value.title.length >= 5 ? true : false));
const descriptionState = computed(() => (post.value.description && post.value.description!.length >= 5 ? true : false));
const categoryState = computed(() => (post.value.category!.id != 0 ? true : false));
const formState = computed(() => (titleState.value && descriptionState.value && categoryState.value));


const getPost = async () => {
  const response = await PostsService.get(Number(route.params.id));
  if (response) {
    post.value = <PostDto>cloneDeep(response.post);
    categories.value = response.categories;
    loading.value = false;
  }
};

const updatePost = async () => {
  if (formState) {
    const updatePost: UpdatePostDto = {
      title: post.value.title,
      description: post.value.description,
      category: post.value.category.id,
    }
    updatePost.image = imageChanged ? null : undefined;
    if (postImage.value.size) {
      updatePost.image = (await PostsService.uploadImage(postImage.value)).id;
      $toast.success("Изображение изменено");
    }
    const response = await PostsService.update(post.value.id, updatePost);
    if (response) {
      $toast.success("Публикация добавлена");
      router.push({ name: "posts" });
    }
  }
};

const deletePost = () => {
  confirm.require({
    message: 'Вы желаете удалить публикацию?',
    header: 'Предупреждение',
    icon: 'pi pi-times-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const response = await PostsService.delete(post.value.id);
      console.log(response);
      if (response) {
        $toast.success("Публикация удалена");
        router.push({ name: "posts" });
      }
    },
    reject: () => {
      $toast.success("Отмена удаления публикации");
    }
  });
};

const handleAttachment = () => {
  let node = document.getElementById("hiddenAttachment");
  if (node != null) {
    node.click();
  }
};

const fileChange = async (event: Event) => {
  if (event.target != null) {
    let vr = (event.target as HTMLInputElement)
    if (vr.files != null) {
      imageChanged = true;
      postImage.value = vr.files[0];
      let image = document.getElementById("image") as HTMLImageElement;
      if (image != null) {
        image.src = URL.createObjectURL(vr.files[0])
      }
    }
  }
}

const deleteImage = () => {
  post.value.image = undefined;
  postImage.value = new File([""], "");
  let image = document.getElementById("image") as HTMLImageElement;
  image.src = "";
  imageChanged = true;
}

onBeforeMount(async () => {
  if (UsersService.checkPermission("posts", "update")) {
    getPost();
  } else {
    $toast.errors(new Error("Доступ запрещен!"));
    router.push({ name: "index" });
  }
});

</script>

<style scoped>
.hide {
  position: absolute;
  top: -9999px;
  left: -9999px;
}
</style>