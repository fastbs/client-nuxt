import type { UserDto } from "./users.dto";
import type { CompanyDto } from "./companies.dto";

export interface CreateJobTitleDto {
  name: string;
  name_short?: string;
  company: number;
}

export interface JobTitleDto {
  id: number;
  name: string;
  name_short?: string;
  company: CompanyDto;
  user_created?: UserDto;
}

export interface UpdateJobTitleDto {
  name: string;
  name_short?: string;
  company: number;
}
