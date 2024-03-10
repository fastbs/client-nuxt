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
