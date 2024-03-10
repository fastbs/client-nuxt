import type { UserDto } from "./users.dto";
import type { ImageDto } from "./files.dto";

export interface CategoryDto {
    id: number;
    name?: string;
    description?: string;
}

export interface CreatePostDto {
    title: string;
    description?: string;
    category: number;
    image?: string; //ImageDto;
}

export interface PostDto {
    id: number;
    title: string;
    description?: string;
    category: CategoryDto;
    image?: ImageDto;
    user_created?: UserDto;
}

export interface UpdatePostDto {
    title: string;
    description?: string;
    category: number;
    image?: string | null; //ImageDto;
};
