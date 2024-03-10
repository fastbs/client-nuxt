import {
    createDirectus,
    authentication,
    graphql,
    rest,
    readMe,

    createItem,
    createItems,
    readItem,
    readItems,
    updateItem,
    updateItems,
    deleteItem,
    deleteItems
} from '@directus/sdk';


class LocalStorage {
    get() {
        const data = JSON.parse(window.localStorage.getItem("directus-data") ?? "{}");
        console.log("LocalStorage get data: "); //, data);
        return data;
    }
    set(data: any) {
        console.log("LocalStorage set data: "); //, data);
        localStorage.setItem("directus-data", JSON.stringify(data));
    }
}

const directus = createDirectus('http://localhost:8055')
    .with(authentication('json', { storage: new LocalStorage() })) //authentication('cookie', { credentials: 'include' }))
    .with(graphql({ credentials: 'include' }))
    .with(rest({ credentials: 'include' }));

async function dQuery(query: string, variables?: Record<string, unknown>, scope?: "items" | "system"){
    const result = await directus.query(query, variables, scope);
    console.log("dQuery result: ", result);
    return result;
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            directus,
            dQuery,
/*             readMe,
            createItem,
            createItems,
            readItem,
            readItems,
            updateItem,
            updateItems,
            deleteItem,
            deleteItems, */
        },
    };
});
