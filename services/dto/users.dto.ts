/* export class ResourceActionDto {
    name : string;
    roles: number[];
} */
/*
export type PermissionItemDto = {
    route: string;
    action: string;
}

export type ResourcePermissionDto = {
    action: string;
    allow: boolean;
}

export type ResourceDto = {
    resource: string;
}

export type LoginUserDto = {
    email: string;
    password: string;
}
*/
/*
export type CreateUserDto = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export type CreatedUserDto = {
    id: string
    first_name: string;
    last_name: string;
    email: string;
    roles: [number];
}
*/

export type UserDto = {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    avatar?: {
        id: string;
        filename_disk: string;
        filename_download: string;
        title: string;
        type: string;
    }
    location?: string;
    title?: string;
    description?: string;
    role?: {
        id: string;
        name: string;
        admin_access: boolean;
    }
}

export type MenuItemDto = {
    _id: string;
    id: number;
    name: string;
    route: string;
    icon: string;
    roles: number[];
    children: [{
        name: string;
        route: string;
        icon: string;
    }];
}

export type toField = {
    name: string;
}

export type Menu2ItemDto = {
    label: string;
    to?: toField;
    icon?: string;
    route?: string;
    items?: Menu2ItemDto[];
}

export type Menu3ItemDto = {
    id: number;
    name: string;
    parent?: number;
    route?: string;
    icon?: string;
}

/* export type typeGetMenu = {
    menu2: [Menu2ItemDto]
} | undefined;

export type UserInfoDto = {
    userId: string;
    username: string;
} */

export type PermissionDto = {
    id: number;
    collection: string;
    action: string;
}

//export default { ResourceActionDto, ResourcePermissionDto };