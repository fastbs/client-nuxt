import { customEndpoint } from '@directus/sdk';
import { saveAs } from "file-saver";

export const exportReport2 = async (name: string, format: string, data: object, fileName = "No name") => {
    const { $directus } = useNuxtApp();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("format", format);
    formData.append("data", JSON.stringify(data));
    formData.append("fileName", fileName);

    const obj = {
        name,
        format,
        data,
        fileName
    };

    const result = await $directus.request(customEndpoint<Blob>({
        path: '/reports/',
        method: 'POST',
        body: JSON.stringify(obj), //formData,
    })) as any;

    console.log("Custom endpoint result:", result);
    const blob = await result.blob();
    console.log("result blob:", blob);
    saveAs(blob, fileName + "." + format);

    return true;
}