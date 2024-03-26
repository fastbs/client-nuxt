<template>
    <div class="field grid" v-if="!loading">
        <div class="flex w-full gap-3">
            <div class="flex flex-grow-1">
                <pDropdown v-model="jobTitleSelected" :options="jobTitles" optionLabel="name" optionValue="id"
                    placeholder="Выберите должность" class="w-full" inputId="job_title" @change="inputEvent($event)" />
            </div>
            <div class="flex mr-3">
                <pButton icon="pi pi-plus" severity="primary" v-tooltip.bottom="'Добавить должность'"
                    :pt="{ root: { class: 'flex ml-1' } }" @click="openAddDialog()" />
            </div>
        </div>
        <small v-if="!validState" class="col-12 p-error fadeinup animation-duration-200" id="text-error">Необходим
            выбор</small>
    </div>

    <pDialog v-model:visible="showModal" modal header="Добавление должности" :style="{ width: '50vw' }">
        <div class="p-fluid formgrid grid">
            <div class="field col-12">
                <label for="title">Наименование должности:</label>
                <pInputText id="modalName" v-model="modalName" type="text" :class="{ 'p-invalid': !modalNameState }" />
                <small v-if="!modalNameState" class="p-error fadeinup animation-duration-200" id="text-error">{{
        invalidModalNameFeedback }}</small>
            </div>
            <div class="field col-12">
                <label for="description">Краткая форма:</label>
                <pInputText id="modalShortName" v-model="modalShortName" type="text"
                    :class="{ 'p-invalid': !modalShortNameState }" />
                <small v-if="!modalShortNameState" class="p-error fadeinup animation-duration-200" id="text-error">{{
        invalidModalShortNameFeedback }}</small>
            </div>
            <div class="field col-12 mb-2">
                <div class="flex gap-3">
                    <pButton class="mx-1 mt-2" severity="primary" :disabled="!modalState" @click="createJobTitle"
                        label="Добавить" />
                    <pButton class="mx-1 mt-2" severity="secondary" @click="showModal = false" label="Отмена" />
                </div>
            </div>

        </div>
    </pDialog>
</template>

<script lang="ts" setup>
import type { DropdownChangeEvent } from "primevue/dropdown";

import UsersService from "@/services/UsersService";
import JobTitlesService from "@/services/JobTitlesService";
import type { JobTitleDto } from "@/services/dto/jobtitles.dto";

const router = useRouter();
const { $toast } = useNuxtApp();

const modelValue = defineModel<string>({ type: String, required: true });
const props = defineProps({
    company: { type: Number, required: true },
});

const loading = ref(true);
const jobTitles = ref<JobTitleDto[]>();
const jobTitleSelected = ref("");
const showModal = ref(false);
const modalName = ref("");
const modalShortName = ref("");
const duplicate = ref(false);

const validState = computed(() => (jobTitleSelected.value ? true : false));
const modalNameState = computed(() => modalName.value.length >= 5 && !duplicate.value);
const modalShortNameState = computed(() => modalShortName.value.length >= 5 ? true : false);
const modalState = computed(() => modalNameState.value && modalShortNameState.value);
const invalidModalNameFeedback = computed(() => {
    if (duplicate.value) { return "Должность уже зарегистрирована" }
    else { return "Минимум 5 символов"; }
});
const invalidModalShortNameFeedback = computed(() => "Минимум 5 символов");

watch(modalName, (modalName) => {
    duplicate.value = false;
});


const createJobTitle = async () => {
    const response = await JobTitlesService.create(
        {
            name: modalName.value,
            name_short: modalShortName.value,
            company: props.company
        });
    if (response) {
        loadJobTitles(String(response.id));
        showModal.value = false;
    }
};

const loadJobTitles = async (id: string) => {
    const response = await JobTitlesService.fetch({ "filter": { "company": { "id": { "_eq": props.company } } } });
    if (response) {
        jobTitles.value = response;
        jobTitleSelected.value = String(id);
        loading.value = false;
    }
};

const inputEvent = (event: DropdownChangeEvent) => {
    modelValue.value = event.value;
};

const openAddDialog = async () => {
    modalName.value = "";
    modalShortName.value = "";
    showModal.value = true;
};


onMounted(async () => {
    if (UsersService.checkPermission("investigations", "update")) {
        loadJobTitles(modelValue.value);
    } else {
        $toast.errors(new Error("Доступ запрещен - JobTitleSelect!"));
        router.push({ name: "index" });
    }
});


</script>

<style>
.input-group-text.is-valid {
    border-color: #198754;
}

.input-group-text.is-invalid {
    border-color: #dc3545;
}
</style>