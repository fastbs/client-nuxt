import { createItem, updateItem, uploadFiles } from '@directus/sdk';

import { FETCH_MAP_IMAGES, GET_MAP_POINTS, GET_MAP_MARKERS, DELETE_MAP_MARKER, DELETE_MAP_MARKERS } from "./queries/DirectusQueries";
import type { MapImageDto, MapPoint, CreateMapMarkerDto, MapMarkerDto, UpdateMapMarkerDto } from './dto/maps.dto';


export default {
    async fetchMapImages(): Promise<MapImageDto[] | undefined> {
        const { $dQuery } = useNuxtApp();
        const result = await $dQuery(FETCH_MAP_IMAGES);
        return result ? result.map_images as MapImageDto[] : undefined;
    },

    async getMapImagePoints(mid: number): Promise<MapPoint[] | undefined> {
        const { $dQuery } = useNuxtApp();
        const result = await $dQuery(GET_MAP_POINTS, { mid: mid });
        return result ? result.map_points as MapPoint[] : undefined;
    },

    async createMapMarker(data: CreateMapMarkerDto): Promise<MapMarkerDto | undefined> {
        const { $directus } = useNuxtApp();
        const result = await $directus.request(createItem('map_markers', data));
        return result as MapMarkerDto;
    },

    async updateMapMarker(id: number, data: UpdateMapMarkerDto): Promise<MapMarkerDto | undefined> {
        const { $directus } = useNuxtApp();
        const result = await $directus.request(updateItem('map_markers', id, data));
        return result as MapMarkerDto;
    },

    async getMapMarkers(mid: number): Promise<MapMarkerDto[] | undefined> {
        const { $dQuery } = useNuxtApp();
        const result = await $dQuery(GET_MAP_MARKERS, { mid: mid });
        return result ? result.map_markers as MapMarkerDto[] : undefined;
    },

    async deleteMapMarker(id: number): Promise<number | undefined> {
        const { $dQuery } = useNuxtApp();
        const result = await $dQuery(DELETE_MAP_MARKER, { id: id });
        return result ? result.delete_map_markers_item.id as number : undefined;
    },

    async deleteMapMarkers(ids: number[]): Promise<number[] | undefined> {
        const { $dQuery } = useNuxtApp();
        const result = await $dQuery(DELETE_MAP_MARKERS, { ids: ids });
        return result ? result.delete_map_markers_items.ids as number[] : undefined;
    }

};
