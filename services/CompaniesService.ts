import type { CompanyDto, CreateCompanyDto, UpdateCompanyDto } from "./dto/companies.dto";
import { CREATE_COMPANY, FETCH_COMPANIES, UPDATE_COMPANY, DELETE_COMPANY, DELETE_COMPANIES } from "./queries/DirectusQueries";


export default {
  async create(data: CreateCompanyDto): Promise<CompanyDto | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(CREATE_COMPANY, { data: data });
    return result ? result.create_companies_item as CompanyDto : undefined;
  },

  async update(id: number, data: UpdateCompanyDto): Promise<CompanyDto | undefined> {
    console.log(">>>>> Enter CompaniesService - UPDATE");
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(UPDATE_COMPANY, { id: id, data: data });
    return result ? result.update_companies_item as CompanyDto : undefined;
  },

  async fetch(vars: Record<string, unknown> | undefined = undefined): Promise<CompanyDto[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(FETCH_COMPANIES, vars);
    return result ? result.companies as CompanyDto[] : undefined;
  },

  async delete(id: number): Promise<number | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_COMPANY, { id: id });
    return result ? result.delete_companies_item.id as number : undefined;
  },

  async deleteMany(ids: number[]): Promise<number[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_COMPANIES, { ids: ids });
    return result ? result.delete_companies_items.ids as number[] : undefined;
  }
};
