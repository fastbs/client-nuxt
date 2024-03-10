import { createItem, updateItem } from '@directus/sdk';

import type { JobTitleDto, CreateJobTitleDto, UpdateJobTitleDto } from "./dto/jobtitles.dto";
import { FETCH_JOB_TITLES, GET_JOB_TITLE, DELETE_JOB_TITLE, DELETE_JOB_TITLES } from "./queries/DirectusQueries";


export default {
  async create(data: CreateJobTitleDto): Promise<JobTitleDto | undefined> {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(createItem('jobtitles', data));
    return result as JobTitleDto;
  },

  async fetch(vars: Record<string, unknown> | undefined = undefined): Promise<JobTitleDto[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(FETCH_JOB_TITLES, vars);
    return result ? result.jobtitles as JobTitleDto[] : undefined;
  },

  async get(id: number): Promise<JobTitleDto | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(GET_JOB_TITLE, { id: id });
    return result ? result.jobtitles_by_id as JobTitleDto : undefined;
  },

  async update(id: number, data: UpdateJobTitleDto): Promise<JobTitleDto | undefined> {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(updateItem('jobtitles', id, data));
    return result as JobTitleDto;
  },

  async delete(id: number): Promise<number | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_JOB_TITLE, { id: id });
    return result ? result.delete_jobtitles_item.id as number : undefined;
  },

  async deleteMany(ids: number[]): Promise<number[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_JOB_TITLES, { ids: ids });
    return result ? result.delete_jobtitles_items.ids as number[] : undefined;
  }

};
