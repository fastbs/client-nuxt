<template>
  <div class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="flex">
      <div class="flex flex-shrink-0 justify-content-start">
        <h2>Публикации</h2>
      </div>
    </div>

    <pDivider :pt="{ root: { class: 'mt-0' } }" />

    <div class="flex justify-content-center">
      <pCard v-if="!loading" :pt="{ root: { class: 'sm:col-12 md:col-12 lg:col-8 xl:col-6 mb-3' } }">
        <template #title>
          <div class="grid">
            <div class="col-6">Добавление публикации</div>
            <div class="col-6 flex flex-wrap justify-content-end gap-3">
              <pButton @click="addPost()" label="Добавить" severity="success" :disabled="!formState" />
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
              <pDropdown v-model="post.category" :options="categories" optionLabel="name" optionValue="id"
                placeholder="Выберите категорию" inputId="category" :class="{ 'p-invalid': !categoryState }" />
              <small v-if="!categoryState" class="p-error fadeinup animation-duration-200" id="text-error">Категория
                обязательна</small>
            </div>
            <div class="field col-12">
              <label for="image">Изображение</label>
              <div>
                <img id="image" src="" class="max-h-20rem max-w-full p-1 border-1 border-blue-500" alt="Нет изображения"
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
import UsersService from "@/services/UsersService";
import PostsService from "@/services/PostsService";
import type { CategoryDto, CreatePostDto } from "@/services/dto/posts.dto";

const router = useRouter();
const { $toast } = useNuxtApp();

const post = ref<CreatePostDto>({
  title: "New title",
  description: "Description",
  category: 1,
  image: undefined,
});
const categories = ref<CategoryDto[]>();
const postImage = ref(new File([""], ""));
const loading = ref(true);

const titleState = computed(() => (post.value.title.length >= 5 ? true : false));
const descriptionState = computed(() => (post.value.description!.length >= 5 ? true : false));
const categoryState = computed(() => (post.value.category != 0));
const formState = computed(() => (titleState.value && descriptionState.value && categoryState.value));


const addPost = async () => {
  if (formState) {
    let image = null;
    if (postImage.value.size) {
      image = await PostsService.uploadImage(postImage.value);
      post.value.image = image.id;
      $toast.success("Изображение загружено");
    }
    const response = await PostsService.create(post.value);
    if (response) {
      $toast.success("Публикация добавлена");
      router.push({ name: "posts" });
    }
  }
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
}

onBeforeMount(async () => {
  if (UsersService.checkPermission("posts", "create")) {
    const response = await PostsService.getCategories();
    if (response) {
      categories.value = response;
      loading.value = false;
    }
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