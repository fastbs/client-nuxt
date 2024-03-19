import type { UserDto } from "./users.dto";
import type { CompanyDto } from "./companies.dto";

/* export class CreateInvestigationDto {
    title = "";
    description = "";
}

export class InvestigationDto extends CreateInvestigationDto {
    _id = "";
    content: object = {};
    global_data: object = {};
    current_node = "";    
}

export class ContentBlockDto {
    _id = "";
    name ="";
    type = "";
    is_ready = false;
    data: object = {};
    children?: object[];
} */

export interface CreateInvestigationDto {
    title: string,
    description: string,
    company: CompanyDto; //string,
};

export interface InvestigationDto {
    id: number;
    title: string;
    description?: string;
    image?: string;
    state: object;
    content: object;
    company: CompanyDto;
    user_created?: UserDto;
};

export interface ContentBlockDto {
    _id: string;
    name: string;
    type: string;
    is_ready: boolean;
    data: object;
    children?: object;
};


export interface Node {
    name: string;
    path: string;
 };

//export type Employee = { _id?: string, name: string, name_short: string };
