//import { type DirectusError, isDirectusError } from '@directus/errors';

const LIFE_MESSAGE = 5000;
const LIFE_ERROR = 5000;

export default defineNuxtPlugin(() => {
    const toast = useToast();

    const success = (mes: string) => {
        toast.add({ severity: 'success', summary: 'Успешно', detail: mes, life: LIFE_MESSAGE });
    };

    const warn = (mes: string) => {
        toast.add({ severity: 'warn', summary: 'Предупреждение', detail: mes, life: LIFE_MESSAGE });
    };

    const errors = (err: any) => {
        console.log("Toast errors type: ", typeof (err), err);
        if (Array.isArray(err.errors)){
            (err.errors as Error[]).forEach((error, index) => {
                console.log("Error ", index, " : ", error);
                processError(error);
            });

        } else if (err instanceof  Error) {
            console.log("Error: ", err.message);
            processError(err);            
        }
/*         if (Array.isArray(err)) {
            err.forEach((error, index) => {
                console.log("Error ", index, " : ", error);
                processError(error);
            });
        }
        else if (isDirectusError(err)) {
            toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message, life: LIFE_ERROR });
        }
        else {
            toast.add({ severity: 'error', summary: 'Ошибка', detail: String(err), life: LIFE_ERROR });
        } */
    };

    const processError = (error: any) => {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: (error as Error).message, life: LIFE_ERROR });
    };

    return {
        provide: {
            toast: {
                success,
                warn,
                errors,
            }
        },
    };
})
