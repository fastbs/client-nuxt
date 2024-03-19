<template>
    <div class="field grid mx-3 w-full" v-if="!loading">
        <pDataTable :value="tableData" editMode="cell" @cell-edit-complete="onCellEditComplete($event)" paginator :rows="5"
            v-model:selection="selected" :filters="filters" :rowsPerPageOptions="[2, 5, 10, 20, 50]" :rowClass="rowClass"
            tableClass="editable-cells-table" showGridlines
            :pt="{ root: { class: 'flex-grow-1' }, row: { style: 'height: 58px; ' } }">
            <template #header>
                <div class="flex justify-content-between">
                    <div>
                        <pButton label="Добавить" icon="pi pi-plus" severity="success" class="mr-2" @click="addRow()" />
                        <pButton label="Удалить" icon="pi pi-trash" severity="danger"
                            :disabled="!selected || !selected.length" @click="confirmDeleteSelected()" class="mr-4" />
                    </div>
                    <div>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <pInputText v-model="filters['global'].value" placeholder="Поиск..." />
                        </span>
                    </div>
                </div>
            </template>
            <pColumn selectionMode="multiple" style="width: 3rem" :exportable="false"></pColumn>
            <pColumn v-for="col of tableColumns" :key="col.field" :field="col.field" :header="col.header"
                :sortable="col.sortable" v-model:style="col.style">
                <template #body="{ data, field }">
                    <template v-if="field == 'employee'">
                        {{ data[field] ? employees.find(x => x._id === data[field])!.name : '' }}
                    </template>
                    <template v-if="field == 'job_title'">
                        {{ data[field] ? jobTitles.find(x => x._id === data[field])!.name : '' }}
                    </template>
                    <template v-if="field == 'starts_at' || field == 'ends_at'">
                        {{ dayjs(data[field]).format("DD.MM.YYYY") }}
                    </template>
                    <template v-if="!['employee', 'job_title', 'starts_at', 'ends_at'].includes(field)">
                        {{ data[field] }}
                    </template>
                </template>
                <template #editor="{ data, field }">
                    <template v-if="field == 'employee'">
                        <div class="flex">
                            <pDropdown v-model="data['employee']" :options="employees" optionLabel="name" optionValue="_id"
                                placeholder="Выберите сотрудника" :pt="{ root: { class: 'flex flex-grow-1' } }"></pDropdown>
                            <pButton icon="pi pi-plus" severity="primary" v-tooltip.bottom="'Добавить сотрудника'"
                                :pt="{ root: { class: 'flex ml-1' } }" @click="openAddEmployeeDialog(data)" />
                        </div>
                    </template>
                    <template v-if="field == 'job_title'">
                        <div class="flex">
                            <pDropdown v-model="data['job_title']" :options="jobTitles" optionLabel="name" optionValue="_id"
                                placeholder="Выберите должность" :pt="{ root: { class: 'flex flex-grow-1' } }">
                            </pDropdown>
                            <pButton icon="pi pi-plus" severity="primary" v-tooltip.bottom="'Добавить должность'"
                                :pt="{ root: { class: 'flex ml-1' } }" @click="openAddJobTitleDialog(data)" />
                        </div>
                    </template>
                    <template v-if="field == 'starts_at' || field == 'ends_at'">
                        <div class="flex">
                            <pCalendar v-model="data[field]" showIcon showButtonBar dateFormat="dd.mm.yy"
                                :pt="{ root: { class: 'flex flex-grow-1' } }" />
                        </div>
                    </template>
                    <template v-if="!['employee', 'job_title', 'starts_at', 'ends_at'].includes(field)">
                        <pInputText v-model="data[field]" autofocus :pt="{ root: { style: 'width: 100%;' } }" />
                        <pButton v-for="(item, index) in store.basis" :key="index" class="mr-1 mt-1" size="small"
                            severity="secondary" outlined @click="data[field] = item.text" :label="item.name" />
                    </template>

                </template>
            </pColumn>
        </pDataTable>
    </div>

    <pDialog v-model:visible="showEmployeeModal" modal header="Добавление сотрудника" :style="{ width: '50vw' }">
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
                    <pButton class="mx-1 mt-2" severity="secondary" @click="showEmployeeModal = false" label="Отмена" />
                </div>
            </div>

        </div>
    </pDialog>

    <pDialog v-model:visible="showJobTitleModal" modal header="Добавление должности" :style="{ width: '50vw' }">
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
                    <pButton class="mx-1 mt-2" severity="secondary" @click="showJobTitleModal = false" label="Отмена" />
                </div>
            </div>

        </div>
    </pDialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";
import { FilterMatchMode } from 'primevue/api';
import type { DataTableCellEditCompleteEvent } from "primevue/datatable";
//import type { DropdownChangeEvent } from "primevue/dropdown";

import { useMainStore } from "@/store/MainStore";
import EmployeesService from "@/services/EmployeesService";
import JobTitlesService from "@/services/JobTitlesService";
import type { EmployeeDto } from "@/services/dto/employees.dto";
import type { JobTitleDto } from "@/services/dto/jobtitles.dto";
import type { EmployeesTableItemDto } from "../dto/employees.dto";


const props = defineProps({
    modelValue: Array,
    company: String,
    readyState: Boolean,
});

const emit = defineEmits(['update:modelValue', 'update:readyState']);


const router = useRouter();
const toast = useToast();

const store = useMainStore();
const loadEmployees = ref(false);
const loadJobTitles = ref(false);
const employees = ref<EmployeeDto[]>([]);
const jobTitles = ref<JobTitleDto[]>([]);
const showEmployeeModal = ref(false);
const showJobTitleModal = ref(false);
const modalName = ref("");
const modalShortName = ref("");
let duplicate = ref(false);

const tableData = ref<EmployeesTableItemDto[]>();
const selected = ref<EmployeesTableItemDto[]>();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const dataChanged = ref(false);


const loading = computed(() => !(loadEmployees.value && loadJobTitles.value));
const modalNameState = computed(() => modalName.value.length >= 5 && !duplicate.value);
const invalidModalNameFeedback = computed(() => {
    if (duplicate.value) { return "Ф.И.О. уже зарегистрировано" }
    else { return "Минимум 5 символов"; }
});
const invalidModalShortNameFeedback = computed(() => "Минимум 5 символов");
const modalShortNameState = computed(() => modalShortName.value.length >= 5 ? true : false);
const modalState = computed(() => modalNameState.value && modalShortNameState.value);
const readyState = computed({
    get() {
        return props.readyState
    },
    set(value) {
        emit('update:readyState', value)
    }
});
const rowClass = (data: EmployeesTableItemDto) => {
    return [{ 'bg-red-100': Object.values(data).some(x => !x) }];
};


const tableColumns = ref([
    { field: 'employee', header: 'Ф.И.О. руководителя', sortable: true, style: 'width: 20%;' },
    { field: 'job_title', header: 'Должность', sortable: true, style: 'width: 20%;' },
    { field: 'basis', header: 'Основание полномочий', sortable: true, style: 'width: 20%;' },
    { field: 'starts_at', header: 'Дата начала', sortable: true, style: 'width: 20%;' },
    { field: 'ends_at', header: 'Дата окончания', sortable: true, style: 'width: 20%;' },
]);

const validateTable = () => {
    let result = true;
    if ((tableData.value as EmployeesTableItemDto[]).length == 0) {
        result = false;
    } else {
        (tableData.value as EmployeesTableItemDto[]).forEach(item => {
            if (Object.values(item).some(x => !x)) {
                result = false;
            }
        })
    }
    readyState.value = result;
};


const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
    let { data, value, newValue, field } = event;

    if (value != newValue) {
        switch (field) {
            case 'starts_at':
                if (!newValue) {
                    toast.add({ severity: 'error', summary: 'Некорректный ввод', detail: "Неверная дата!", life: 5000 });
                } else if (newValue > data['ends_at']) {
                    toast.add({ severity: 'error', summary: 'Некорректный ввод', detail: "Дата начала полномочий позже даты окончания!", life: 5000 });
                } else {
                    data[field] = newValue;
                    dataChanged.value = true;
                }
                break;
            case 'ends_at':
                if (!newValue) {
                    toast.add({ severity: 'error', summary: 'Некорректный ввод', detail: "Неверная дата!", life: 5000 });
                } else if (newValue < data['starts_at']) {
                    toast.add({ severity: 'error', summary: 'Некорректный ввод', detail: "Дата окончания полномочий раньше даты начала!", life: 5000 });
                } else {
                    data[field] = newValue;
                    dataChanged.value = true;
                }
                break;

            default:
                data[field] = newValue.trim();
                dataChanged.value = true;
                break;
        }
    }
    validateTable();
};

const addRow = () => {
    let ni: EmployeesTableItemDto = {
        employee: "",
        job_title: "",
        basis: "",
        starts_at: new Date(),
        ends_at: new Date()
    };
    (tableData.value as EmployeesTableItemDto[]).push(ni);
    dataChanged.value = true;
    readyState.value = false;
};

const openAddEmployeeDialog = (data: any) => {
    modalName.value = "";
    modalShortName.value = "";
    showEmployeeModal.value = true;
};

const openAddJobTitleDialog = (data: any) => {
    modalName.value = "";
    modalShortName.value = "";
    showJobTitleModal.value = true;
};

const confirmDeleteSelected = () => {
    if (selected.value) {
        selected.value.forEach(item => {
            if (tableData.value) {
                let idx = tableData.value.findIndex(n => n.employee == item.employee);
                if (idx != -1) {
                    tableData.value.splice(idx, 1);
                    dataChanged.value = true;
                }
            }
        })
    }
    validateTable();
};

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
        loadData(response._id as string);
        showEmployeeModal.value = false;
    }
};

const createJobTitle = async () => {
    const response = await JobTitlesService.create({ name: modalName.value, name_short: modalShortName.value, company: { _id: props.company as string } });
    if (response) {
        loadData("");
        showJobTitleModal.value = false;
    }
};

const decodeDirectors = () => {
    tableData.value = [];

    if (props.modelValue) {
        tableData.value = props.modelValue as EmployeesTableItemDto[];
        readyState.value = true;
        //emit('update:readyState', true);
        /*         let ds = props.modelValue as EmployeeField[];
        
                if (ds.length > 0) {
                    ds.forEach(item => {
                        const em = (employees.value as Employee[]).find(x => x._id == item.employee);
                        const jt = (jobTitles.value as JobTitle[]).find(x => x._id == item.job_title);
                        if (em && jt) {
                            let dt: EmployeesTableItemDto = {
                                //isActive: true,
                                employee: em._id as string,
                                //employee_name: em.name,
                                job_title: jt._id as string,
                                //job_title_name: jt.name,
                                basis: item.basis,
                                starts_at: new Date(item.starts_at), //moment(item.starts_at).format("DD.MM.YYYY"),
                                ends_at: new Date(item.ends_at), //moment(item.ends_at).format("DD.MM.YYYY"),
                            };
                            (tableData.value as EmployeesTableItemDto[]).push(dt);
                        }
                    });
        
                } */
    }
};

const loadData = async (ps: string) => {
    const res1 = await EmployeesService.fetch({ company: { _id: props.company as string } });
    if (res1) {
        employees.value = res1.employees;
        loadEmployees.value = true;
    }
    const res2 = await JobTitlesService.fetch({ company: { _id: props.company as string } });
    if (res2) {
        jobTitles.value = res2.jobTitles;
        loadJobTitles.value = true;
    }

    decodeDirectors();
    validateTable();
};

onMounted(async () => {
    if (store.checkPermission("investigations", "post")) {
        loadData("") //props.modelValue as string);
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
</style>