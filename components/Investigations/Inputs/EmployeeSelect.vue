<template>
    <div class="field grid" v-if="!loading">
        <div class="flex w-full gap-3">
            <div class="flex flex-grow-1">
                <pDropdown v-model="employeeSelected" :options="employees" optionLabel="name" optionValue="_id"
                    placeholder="Выберите сотрудника" class="w-full" inputId="employee" @change="inputEvent($event)" />
                <!-- $emit('update:modelValue', $event)    inputEvent($event) -->
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
                        <pButton label="Заполнить" icon="pi pi-pencil" :disabled="!modalName" @click="fiilShortName()" />
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
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import type { DropdownChangeEvent } from "primevue/dropdown";

import { useMainStore } from "@/store/MainStore";
import EmployeesService from "@/services/EmployeesService";
import type { EmployeeDto } from "@/services/dto/employees.dto";

const props = defineProps({
    modelValue: String,
    company: String,
});

const emit = defineEmits(['update:modelValue']);

const store = useMainStore();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const employees = ref<EmployeeDto[]>();
const employeeSelected = ref("");
const showModal = ref(false);
const modalName = ref("");
const modalShortName = ref("");
const duplicate = ref(false);
let lastSelected = "";

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

const fiilShortName = async () => {
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
    const response = await EmployeesService.create({ name: modalName.value, name_short: modalShortName.value, company: { _id: props.company as string } });
    if (response) {
        loadEmployees(response._id);
        showModal.value = false;
    }
};

const loadEmployees = async (_id: string) => {
    const response = await EmployeesService.fetch({ company: { _id: props.company as string } });
    if (response) {
        employees.value = response.employees;
        lastSelected = props.modelValue as string;
        employeeSelected.value = _id;
        loading.value = false;
    }
};

const inputEvent = (event: DropdownChangeEvent) => {
    lastSelected = event.value;
    emit('update:modelValue', lastSelected);
};

const openAddDialog = async () => {
    modalName.value = "";
    modalShortName.value = "";
    showModal.value = true;
};


onMounted(async () => {
    if (store.checkPermission("investigations", "post")) {
        loadEmployees(props.modelValue as string);
    } else {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: "Доступ запрещен!", life: 5000 });
        router.push({ name: "Home" });
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
</style>@/services/dto/auth.dto@/services/dto/employees.dto