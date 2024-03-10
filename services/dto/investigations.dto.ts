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

export type CreateInvestigationDto = {
    title: string,
    description: string,
    company: CompanyDto; //string,
};

export type InvestigationDto = {
    _id: string,
    title: string,
    description: string,
    image: string,
    content: object,
    global_data: object,
    current_node: string,
    company: CompanyDto,
};

export type ContentBlockDto = {
    _id: string,
    name: string,
    type: string,
    is_ready: boolean,
    data: object,
    children?: object,
};


export type Node = {
    name: string,
    path: string
 };

//export type Employee = { _id?: string, name: string, name_short: string };
