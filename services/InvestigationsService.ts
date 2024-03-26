import api from "@/services/api";
import { useQuery, useMutation } from "@vue/apollo-composable";
//import { GET_INVESTIGATIONS, GET_INVESTIGATION, CREATE_INVESTIGATION, UPDATE_INVESTIGATION } from "@/services/queries/GraphqlQueries";

import { createItem, updateItem } from '@directus/sdk';
import type { CreateInvestigationDto, InvestigationDto } from "./dto/investigations.dto";
import { FETCH_INVESTIGATIONS, GET_INVESTIGATION } from "./queries/DirectusQueries";

export default {
/*   create(payload: CreateInvestigationDto, onDone: (result: InvestigationDto) => void, onError: (error: Error) => void) {
    const mutation = useMutation(CREATE_INVESTIGATION);
    mutation.mutate({ payload: payload });

    mutation.onDone(mutationResult => {
      onDone(mutationResult.data.createInvestigation);
    });

    mutation.onError(error => {
      const err = new Error;
      err.message = "Investigation not created! - " + error.message;
      onError(err);
    })
  }, */

  async create(data: CreateInvestigationDto): Promise<InvestigationDto | undefined> {
    const { $directus } = useNuxtApp();
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
    const result = await $directus.request(updateItem('investigations', id, data));
    return result as InvestigationDto;
  },  

  /*
  update2(payload: InvestigationDto, onDone: (result: InvestigationDto) => void, onError: (error: Error) => void) {
    const mutation = useMutation(UPDATE_INVESTIGATION);
    mutation.mutate({ payload: payload });
    
    mutation.onDone(mutationResult => {
      onDone(mutationResult.data.investigation);
    });

    mutation.onError(err => {
      const error = new Error;
      error.message = "Error in InvestigationService.update2 - " + err.message;
      onError(error);
    });
  },

  update(id: string, inv: InvestigationDto) {
    return api().put(`investigations/${id}`, inv);
  }, */

  /*  
    delete (id) {
      return api().delete(`posts/${id}`)
    },
  
    getImagePath(id) {
      const imagePath = `http://localhost:4100/posts/image/${id}`;
      return imagePath;
    },
  
    getCategories() {
      return api().get('posts/categories');
    }, */

};
