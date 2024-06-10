import { v4 as uuidv4 } from 'uuid';
import { createItem, updateItem } from '@directus/sdk';
import type { CreateInvestigationDto, InvestigationDto } from "./dto/investigations.dto";
import { FETCH_INVESTIGATIONS, GET_INVESTIGATION, DELETE_INVESTIGATION } from "./queries/DirectusQueries";

export default {
  async create(data: CreateInvestigationDto): Promise<InvestigationDto | undefined> {
    const { $directus } = useNuxtApp();
    data.state = JSON.stringify({ "counter": 0, "current_node": "" });
    data.content = JSON.stringify({
      "_id": uuidv4(),
      "name": "Инициализация (из клиента)",
      "type": "InitializationBlock",
      "is_ready": false,
      "data": {
        "is_periodic": false,
        "director": {
          "employee": "",
          "job_title": "",
          "basis": ""
        },
        "directors": []
      },
      //"children": []
    });

    const result = await $directus.request(createItem('investigations', data));
    return result as InvestigationDto;
  },

  async fetch(vars: Record<string, unknown> | undefined = undefined): Promise<InvestigationDto[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(FETCH_INVESTIGATIONS, vars);
    console.log(">>> Investigation fetch result:", result);
    return result ? result.investigations as InvestigationDto[] : undefined;
  },

  async get(id: number): Promise<InvestigationDto | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(GET_INVESTIGATION, { id: id });
    return result ? result.investigations_by_id as InvestigationDto : undefined;
  },

  async update(id: number, data: InvestigationDto): Promise<InvestigationDto | undefined> {
    const { $directus } = useNuxtApp();
    const sc = structuredClone(data) as Record<string, any>;
    delete sc.id;
    delete sc.user_created;
    delete sc.company;
    delete sc.image;

    const result = await $directus.request(updateItem('investigations', id, sc));
    return result as InvestigationDto;
  },

  async delete(id: number): Promise<number | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_INVESTIGATION, { id: id });
    return result ? result.delete_investigations_item.id as number : undefined;
  },

};
