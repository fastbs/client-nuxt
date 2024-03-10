import { createItem, updateItem, uploadFiles } from '@directus/sdk';

import { GET_POST_CATEGORIES, FETCH_POSTS, GET_POST, DELETE_POST } from "./queries/DirectusQueries";
import type { CategoryDto, CreatePostDto, PostDto, UpdatePostDto } from "./dto/posts.dto";


export default {
  async getCategories(): Promise<CategoryDto[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(GET_POST_CATEGORIES);
    return result ? result.post_categories as CategoryDto[] : undefined;
  },

  async create(data: CreatePostDto): Promise<PostDto | undefined> {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(createItem('posts', data));
    return result as PostDto;
  },

  async fetch(vars: Record<string, unknown> | undefined = undefined): Promise<{ posts: PostDto[], categories: CategoryDto[] } | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(FETCH_POSTS, vars);
    return result ? { posts: result.posts as PostDto[], categories: result.post_categories as CategoryDto[] } : undefined;
  },

  async get(id: number): Promise<{ post: PostDto, categories: CategoryDto[] } | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(GET_POST, { id: id });
    return result ? { post: result.posts_by_id as PostDto, categories: result.post_categories as CategoryDto[] } : undefined;
  },

  async update(id: number, data: UpdatePostDto): Promise<PostDto | undefined> {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(updateItem('posts', id, data));
    return result as PostDto;
  },

  async delete(id: number): Promise<number | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_POST, { id: id });
    return result ? result.delete_posts_item.id as number : undefined;
  },

  async uploadImage(file: File): Promise<Record<string, any>> {
    const { $directus } = useNuxtApp();
    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("file", file, file.name);
    const result = await $directus.request(uploadFiles(formData));
    return result;
  },
};
