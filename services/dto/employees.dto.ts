import type { UserDto } from "./users.dto";
import type { CompanyDto } from "./companies.dto";

export interface CreateEmployeeDto {
  name: string;
  name_short?: string;
  company: number;
}

export interface EmployeeDto{
  id: number;
  name: string;
  name_short?: string;
  company: CompanyDto;
  user_created?: UserDto;
}

export interface UpdateEmployeeDto {
  name: string;
  name_short?: string;
  company: number;
}

export type EmployeesTableItemDto = {
  //isActive: boolean, 
  employee: string,
  //employee_name: string,
  job_title: string,
  //job_title_name: string,
  basis: string,
  starts_at: Date,
  ends_at: Date,
};

export type EmployeeField = {
  employee: string,
  job_title: string,
  basis: string,
  starts_at: Date,
  ends_at: Date,
}