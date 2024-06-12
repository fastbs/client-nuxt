import { customEndpoint } from '@directus/sdk';
import { saveAs } from "file-saver";

export const exportReport = async (name: string, format: string, data: object, fileName = "No name") => {
    const { $directus, $toast } = useNuxtApp();

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

    if (result.ok) {
        saveAs(await result.blob(), fileName + "." + format);
        $toast.success("Отчет сохранен: " + fileName + "." + format);
    }
    else {
        throw (new Error(result.statusText));
    }
}