import api from "@/services/api";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { GET_INVESTIGATIONS, GET_INVESTIGATION, CREATE_INVESTIGATION, UPDATE_INVESTIGATION } from "@/services/queries/GraphqlQueries";
import type { CreateInvestigationDto, InvestigationDto } from "./dto/investigations.dto";

export default {
  create(payload: CreateInvestigationDto, onDone: (result: InvestigationDto) => void, onError: (error: Error) => void) {
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
  },

  fetch(onDone: (result: InvestigationDto[]) => void, onError: (error: Error) => void) {
    const query = useQuery(GET_INVESTIGATIONS, null, { fetchPolicy: 'network-only', });

    query.onResult(queryResult => {
      onDone(queryResult.data.investigations);
    });

    query.onError(err => {
      const error = new Error;
      error.message = "Error in InvestigationService.fetch - " + err.message;
      onError(error);
    });
  },

  get(_id: string, onDone: (result: InvestigationDto) => void, onError: (error: Error) => void) {
    const query = useQuery(GET_INVESTIGATION, { _id: _id }, { fetchPolicy: 'network-only', });

    query.onResult(queryResult => {
      onDone(queryResult.data.investigation);
    });

    query.onError(err => {
      const error = new Error;
      error.message = "Error in InvestigationService.get - " + err.message;
      onError(error);
    });
  },

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
  },

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
