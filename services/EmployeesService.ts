import { createItem, updateItem } from '@directus/sdk';

import type { EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from "./dto/employees.dto";
import { FETCH_EMPLOYEES, GET_EMPLOYEE, DELETE_EMPLOYEE, DELETE_EMPLOYEES } from "./queries/DirectusQueries";


export default {
  async create(data: CreateEmployeeDto): Promise<EmployeeDto | undefined> {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(createItem('employees', data));
    return result as EmployeeDto;
  },

  async fetch(vars: Record<string, unknown> | undefined = undefined): Promise<EmployeeDto[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(FETCH_EMPLOYEES, vars);
    return result ? result.employees as EmployeeDto[] : undefined;
  },

  async get(id: number): Promise<EmployeeDto | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(GET_EMPLOYEE, { id: id });
    return result ? result.employees_by_id as EmployeeDto : undefined;
  },

  async update(id: number, data: UpdateEmployeeDto): Promise<EmployeeDto | undefined> {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(updateItem('employees', id, data));
    return result as EmployeeDto;
  },

  async delete(id: number): Promise<number | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_EMPLOYEE, { id: id });
    return result ? result.delete_employees_item.id as number : undefined;
  },

  async deleteMany(ids: number[]): Promise<number[] | undefined> {
    const { $dQuery } = useNuxtApp();
    const result = await $dQuery(DELETE_EMPLOYEES, { ids: ids });
    return result ? result.delete_employees_items.ids as number[] : undefined;
  }

};
