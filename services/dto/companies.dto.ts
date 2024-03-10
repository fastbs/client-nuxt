import type { UserDto } from "./users.dto";

export interface CreateCompanyDto {
    name?: string,
    name_short?: string,
    inn?: string,
}

export interface CompanyDto extends CreateCompanyDto {
    id: number,
    user_created?: UserDto;
}

export interface UpdateCompanyDto {
    name?: string;
    name_short?: string;
    inn?: string;
}
