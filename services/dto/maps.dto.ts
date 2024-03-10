import type { UserDto } from "./users.dto";
import type { ImageDto } from "./files.dto";

export interface MapPoint {
    id?: number;
    x: number;
    y: number;
    lat: number;
    lng: number;
    comment?: string;
}

export interface MapRectangle {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface CreateMapMarkerDto {
    map_image: number;
    name: string;
    comment?: string;
    x: number;
    y: number;
    lat: number;
    lng: number;
}

export interface MapMarkerDto {
    id: number;
    map_image: MapImageDto;
    name: string;
    comment?: string;
    x: number;
    y: number;
    lat: number;
    lng: number;
}

export interface UpdateMapMarkerDto {
    map_image?: number;
    name?: string;
    comment?: string;
    x?: number;
    y?: number;
    lat?: number;
    lng?: number;
 }

export interface MapImageDto {
    id: number;
    name?: string;
    point1: MapPoint;
    point2: MapPoint;
    image?: ImageDto;
    user_created?: UserDto;
}
