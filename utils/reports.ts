import { customEndpoint } from '@directus/sdk';
import { saveAs } from "file-saver";

export const exportReport = async (name: string, format: string, data: object, fileName = "No name") => {
    const { $directus } = useNuxtApp();

    const body = {
        name,
        format,
        data,
        fileName
    };

    const result = await $directus.request(customEndpoint({
        path: '/reports/',
        method: 'POST',
        body: JSON.stringify(body),
    })) as any;

    console.log("Custom endpoint result:", result);
    saveAs(await result.blob(), fileName + "." + format);

    return true;
}