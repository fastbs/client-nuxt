<template>
    <div class="card mb-3" style="padding-top: 1.5rem;">
        <pDataView v-if="!loading && invs.length > 0" :value="invs" dataKey="id" :layout="layout" paginator :rows="3"
            :pt="{ header: { class: 'p-0', style: 'border-top-width: 0px;' } }">
            <template #header>
                <div class="flex">
                    <div class="flex flex-shrink-0 justify-content-start">
                        <h2>Расследования</h2>
                    </div>
                    <div class="flex flex-grow-1 justify-content-end ">
                        <NuxtLink v-if="UsersService.checkPermission('investigations', 'create')"
                            :to="{ name: 'investigations-create' }">
                            <pButton icon="pi pi-plus" aria-label="Новое расследование"
                                v-tooltip.left="'Новое расследование'" rounded size="small"
                                :pt="{ root: { class: 'mr-3' } }" />
                        </NuxtLink>
                        <pDataViewLayoutOptions v-model="layout" />
                    </div>
                </div>
            </template>

            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 mt-3">
                        <div class="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                            <img v-if="item.image" :src="store.config.postImagePath + item.image.id"
                                class="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
                                :alt="item.title" />
                            <div
                                class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                                <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                                    <div class="text-2xl font-bold text-900">{{ item.title }}</div>
                                    <div class="flex align-items-center gap-3"></div>
                                    <div class="flex align-items-center gap-3">
                                        <NuxtLink v-if="UsersService.checkPermission('investigations', 'read')"
                                            :to="{ name: 'investigations-id', params: { id: item.id } }">
                                            <pButton label="Просмотр" />
                                        </NuxtLink>
                                    </div>
                                </div>
                                <div class="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #grid="slotProps">
                <div class="grid grid-nogutter">
                    <div v-for="(item, index) in slotProps.items" :key="index"
                        class="col-12 mt-3 sm:col-6 lg:col-12 xl:col-4 p-2">
                        <div class="p-4 border-1 surface-border surface-card border-round">
                            <div class="flex flex-wrap align-items-center justify-content-between gap-2"></div>
                            <div class="flex flex-column align-items-center gap-3 py-5">
                                <img v-if="item.image" :src="store.config.postImagePath + item.image.id"
                                    class="w-9 shadow-2 border-round" :alt="item.title" />
                                <div class="text-2xl font-bold">{{ item.title }}</div>
                                <div> Компания: {{ item.company.name }}</div>
                                <div class="flex gap-3">
                                    <NuxtLink v-if="UsersService.checkPermission('investigations', 'update')"
                                        :to="{ name: 'investigations-id', params: { id: item.id } }">
                                        <pButton label="Просмотр" />
                                    </NuxtLink>
                                </div>
                            </div>
                            <div class="flex align-items-center gap-3">
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </pDataView>
    </div>
</template>

<script lang="ts" setup>
import UsersService from "@/services/UsersService";
import InvestigationsService from "@/services/InvestigationsService";
import type { InvestigationDto } from "@/services/dto/investigations.dto";

const store = useMainStore();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

const invs = ref<InvestigationDto[]>([]);
const layout = ref<"list" | "grid" | undefined>("grid");
const loading = ref(true);


const getData = async () => {
    loading.value = true;
    const res_invs = await InvestigationsService.fetch();
    if (res_invs) {
        invs.value = res_invs;
        loading.value = false;
    }
};

onBeforeMount(async () => {
    if (UsersService.checkPermission("investigations", "read") && UsersService.checkPermission("companies", "read")) {
        await getData();
    } else {
        $toast.errors(new Error("Доступ запрещен!"));
        router.push({ name: "index" });
    }
});


</script>

<style scoped></style>
