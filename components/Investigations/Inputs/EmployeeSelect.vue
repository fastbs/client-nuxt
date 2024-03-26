<template>
    <div class="field grid" v-if="!loading">
        <div class="flex w-full gap-3">
            <div class="flex flex-grow-1">
                <pDropdown v-model="employeeSelected" :options="employees" optionLabel="name" optionValue="id"
                    placeholder="Выберите сотрудника" class="w-full" inputId="employee" @change="inputEvent($event)" />
            </div>
            <div class="flex mr-3">
                <pButton icon="pi pi-plus" severity="primary" v-tooltip.bottom="'Добавить сотрудника'"
                    :pt="{ root: { class: 'flex ml-1' } }" @click="openAddDialog()" />
            </div>
        </div>
        <small v-if="!validState" class="col-12 p-error fadeinup animation-duration-200" id="text-error">Необходим
            выбор</small>
    </div>

    <pDialog v-model:visible="showModal" modal header="Добавление сотрудника" :style="{ width: '50vw' }">
        <div class="p-fluid formgrid grid">
            <div class="field col-12">
                <label for="title">Фамилия, имя, отчество:</label>
                <pInputText id="modalName" v-model="modalName" type="text" :class="{ 'p-invalid': !modalNameState }" />
                <small v-if="!modalNameState" class="p-error fadeinup animation-duration-200" id="text-error">{{
        invalidModalNameFeedback }}</small>
            </div>
            <div class="field col-12">
                <label for="description">Ф.И.О.:</label>
                <div class="flex gap-3">
                    <div class="flex flex-grow-1">
                        <pInputText id="modalShortName" v-model="modalShortName" type="text"
                            :class="{ 'p-invalid': !modalShortNameState }" />
                    </div>
                    <div class="flex">
                        <pButton label="Заполнить" icon="pi pi-pencil" :disabled="!modalName"
                            @click="fillShortName()" />
                    </div>
                </div>
                <small v-if="!modalShortNameState" class="p-error fadeinup animation-duration-200" id="text-error">{{
        invalidModalShortNameFeedback }}</small>
            </div>
            <div class="field col-12 mb-2">
                <div class="flex gap-3">
                    <pButton class="mx-1 mt-2" severity="primary" :disabled="!modalState" @click="createEmployee"
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
import EmployeesService from "@/services/EmployeesService";
import type { EmployeeDto } from "@/services/dto/employees.dto";

const router = useRouter();
const { $toast } = useNuxtApp();

const modelValue = defineModel<string>({ type: String, required: true });
const props = defineProps({
    company: { type: Number, required: true },
});

const loading = ref(true);
const employees = ref<EmployeeDto[]>();
const employeeSelected = ref("");
const showModal = ref(false);
const modalName = ref("");
const modalShortName = ref("");
const duplicate = ref(false);

const validState = computed(() => (employeeSelected.value ? true : false));
const modalNameState = computed(() => modalName.value.length >= 5 && !duplicate.value);
const modalShortNameState = computed(() => modalShortName.value.length >= 5 ? true : false);
const modalState = computed(() => modalNameState.value && modalShortNameState.value);
const invalidModalNameFeedback = computed(() => {
    if (duplicate.value) { return "Ф.И.О. уже зарегистрировано" }
    else { return "Минимум 5 символов"; }
});
const invalidModalShortNameFeedback = computed(() => "Минимум 5 символов");

watch(modalName, (modalName) => {
    duplicate.value = false;
});

const fillShortName = async () => {
    let sp = modalName.value.split(" ");
    let sn = "";
    if (sp[0]) {
        sn = sp[0];
        if (sp[1]) {
            sn = sn + " " + sp[1].substring(0, 1) + ".";
            if (sp[2]) {
                sn = sn + " " + sp[2].substring(0, 1) + ".";
            }
        }
    }
    modalShortName.value = sn;
}

const createEmployee = async () => {
    const response = await EmployeesService.create(
        {
            name: modalName.value,
            name_short: modalShortName.value,
            company: props.company
        });
    if (response) {
        loadEmployees(String(response.id));
        modelValue.value = String(response.id);
        showModal.value = false;
    }
};

const loadEmployees = async (id: string) => {
    const response = await EmployeesService.fetch({ "filter": { "company": { "id": { "_eq": props.company } } } });
    if (response) {
        employees.value = response;
        employeeSelected.value = String(id);
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
        loadEmployees(modelValue.value);
    } else {
        $toast.errors(new Error("Доступ запрещен - EmployeeSelect!"));
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