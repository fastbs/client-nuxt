import type { UserDto } from "./users.dto";
import type { CompanyDto } from "./companies.dto";
import type { ImageDto } from "./files.dto";

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
    image?: ImageDto;
    current_node: string;
    state: any;
    content: any;
    company: CompanyDto;
    user_created?: UserDto;
};

export interface ContentBlockDto {
    id: string;
    name: string;
    type: string;
    is_ready: boolean;
    data: any;
    children?: object;
};


export interface Node {
    name: string;
    path: string;
};


export type BlockActionEventDto = {
    p1: string,
    p2: string
};

