<template>
    <div v-if="pageReady" class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
        <div class="flex">
            <div class="flex flex-shrink-0 justify-content-start">
                <h2>Справочник - Должности</h2>
            </div>
        </div>

        <pDivider :pt="{ root: { class: 'mt-0' } }" />

        <label for="company">Компании: </label>

        <pDropdown v-model="selectedCompany" :options="companies" optionLabel="name" optionValue="id"
            placeholder="Выберите компанию" class="w-full lg:w-8 xl:w-6 mb-3" inputId="company"
            @change="changeCompany()" />

        <pDataTable :value="tableData" dataKey="id" editMode="cell" @cell-edit-complete="onCellEditComplete($event)"
            paginator :rows="10" v-model:selection="selected" :filters="filters"
            :rowsPerPageOptions="[2, 5, 10, 20, 50]" tableClass="editable-cells-table"
            :tableStyle="{ 'min-width': '50rem' }" showGridlines :pt="{ row: { style: 'height: 58px; ' } }"
            :rowClass="rowClass" :loading="loading">

            <template #header>
                <div class="flex justify-content-between">
                    <div>
                        <pButton v-if="UsersService.checkPermission('jobtitles', 'create')" label="Добавить"
                            icon="pi pi-plus" severity="success" class="mr-2" :disabled="disableCreate"
                            @click="addData" />
                        <pButton v-if="UsersService.checkPermission('jobtitles', 'delete')" label="Удалить"
                            icon="pi pi-trash" severity="danger"
                            :disabled="!selected || !selected.length || disableDelete" @click="deleteSelected()"
                            class="mr-4" />
                        <pButton
                            v-if="UsersService.checkPermission('jobtitles', 'create') || UsersService.checkPermission('jobtitles', 'delete') || UsersService.checkPermission('jobtitles', 'update')"
                            icon="pi pi-save" label="Сохранить изменения" :disabled="!dataChanged || !tableValid"
                            @click="saveData()" />
                    </div>
                    <div>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search mr-2" />
                            <pInputText v-model="filters['global'].value" placeholder="Поиск..." />
                        </span>
                    </div>
                </div>
            </template>
            <pColumn selectionMode="multiple" style="width: 3rem" :exportable="false"></pColumn>
            <pColumn v-for="col of tableColumns" :field="col.field" :hidden="col.hidden" :header="col.header"
                :sortable="col.sortable" v-model:style="col.style">
                <template #body="{ data, field }">
                    {{ field === 'user_created' ? data[field].first_name + '\n' + data[field].email : data[field] }}
                </template>
                <template v-if="UsersService.checkPermission('jobtitles', 'update') && col.field !== 'user_created'"
                    #editor="{ data, field }">
                    <pInputText v-model="data[field]" autofocus :pt="{ root: { style: 'width: 100%;' } }" />
                </template>
            </pColumn>

        </pDataTable>

    </div>
</template>

<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import type { DataTableCellEditCompleteEvent } from "primevue/datatable";

import UsersService from "@/services/UsersService";
import JobTitlesService from "@/services/JobTitlesService";
import type { CompanyDto } from "@/services/dto/companies.dto";
import type { JobTitleDto, CreateJobTitleDto, UpdateJobTitleDto } from "@/services/dto/jobtitles.dto";
import CompaniesService from '~/services/CompaniesService';


const store = useMainStore();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

const companies = ref<CompanyDto[]>();
const tableData = ref<JobTitleDto[]>([]);
const selectedCompany = ref(0);
const selected = ref<JobTitleDto[]>([]);
const deletedData = <number[]>[];
const updatedData = <number[]>[];
const disableCreate = ref(false);
const disableDelete = ref(false);
let lastId = 0;
let newId = 0;
const loading = ref(true);
const pageReady = ref(false);
const dataChanged = ref(false);
const tableValid = computed(() => !(tableData.value as CompanyDto[]).find(x => !x.name));

const tableColumns = ref([
    { field: 'id', header: 'Id', hidden: true },
    { field: 'name', header: 'Наименование должности', sortable: true, style: 'width: 60%;' },
    { field: 'name_short', header: 'Краткая форма', sortable: false, style: 'width: 40%;' },
]);
if (store.user?.role?.name && ["Publisher", "Administrator"].includes(store.user.role.name)) {
    tableColumns.value.push({ field: 'user_created', header: 'Пользователь', sortable: true, style: 'width: 30%;' });
}

const rowClass = (data: CompanyDto) => {
    return [{ 'bg-red-100': !data.name, 'bg-teal-50': updatedData.includes(Number(data.id)), 'bg-green-50': data.id > lastId, 'bg-blue-50': selected.value.find(x => x.id == data.id) }];
};
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'company.id': { value: 0, matchMode: FilterMatchMode.EQUALS },
});


const getData = async () => {
    const prevSelectedCompany = selectedCompany.value;
    loading.value = true;
    let res_companies = await CompaniesService.fetch();
    const res_jobtitles = await JobTitlesService.fetch();
    tableData.value = [];
    selected.value = [];
    if (res_companies && res_companies.length == 0) {
        $toast.warn("Нет созданных компаний!");
        res_companies = undefined;
        router.push({ name: "references-companies" });
    }
    if (res_companies && res_jobtitles) {
        companies.value = res_companies;
        selectedCompany.value = (prevSelectedCompany == 0) ? companies.value[0].id : prevSelectedCompany;
        filters.value['company.id'].value = selectedCompany.value;

        tableData.value = res_jobtitles;
        lastId = tableData.value.length ? Number(tableData.value[tableData.value.length - 1].id) : 0;
        newId = lastId + 1;
        loading.value = false;
        pageReady.value = true;
    }
};

const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
    let { data, value, newValue, field } = event;
    const d = Number(data.id);
    if (value != newValue) {
        if (d && d <= lastId && !updatedData.includes(d)) {
            updatedData.push(d);
        }
        dataChanged.value = true;
        data[field] = newValue.trim();
    }
};

const saveData = async () => {
    if (deletedData.length) {
        await JobTitlesService.deleteMany(deletedData);
    }

    for (const id of updatedData) {
        const item = tableData.value.find(x => x.id == id);
        if (item) {
            const ujt: UpdateJobTitleDto = {
                name: item.name,
                name_short: item.name_short,
                company: item.company.id,
            };
            await JobTitlesService.update(id, ujt);
        }
    }

    const newData = tableData.value?.filter(x => x.id > lastId);
    for (const item of newData) {
        const cjt: CreateJobTitleDto = {
            name: item.name,
            name_short: item.name_short,
            company: item.company.id,
        }
        await JobTitlesService.create(cjt);
    }

    await getData();
    deletedData.length = 0;
    updatedData.length = 0;
    dataChanged.value = false;
    $toast.success("Изменения сохранены");
};

const changeCompany = async () => {
    filters.value['company.id'].value = selectedCompany.value;
    const cid = companies.value?.find(x => x.id == selectedCompany.value);
    disableCreate.value = cid != undefined && cid.user_created?.id != store.user?.id;
};

const addData = () => {
    let ni: JobTitleDto = {
        id: newId,
        name: "",
        name_short: "",
        company: {
            id: selectedCompany.value,
        },
        user_created: { id: store.user?.id as string, email: store.user?.email as string, first_name: store.user?.first_name }
    };
    (tableData.value as JobTitleDto[]).push(ni);
    newId++;
    dataChanged.value = true;
};

const deleteSelected = () => {
    if (selected.value.length) {
        let m = selected.value.map(x => x.id);
        m.forEach(id => {
            let idx = tableData.value.findIndex(n => n.id == id);
            if (idx != -1) {
                if (id <= lastId) {
                    deletedData.push(id);
                }
                tableData.value.splice(idx, 1);
                dataChanged.value = true;
            }
        });
        selected.value.length = 0;
    }
};

onBeforeMount(async () => {
    if (UsersService.checkPermission("jobtitles", "read") && UsersService.checkPermission("companies", "read")) {
        await getData();
    } else {
        $toast.errors(new Error("Доступ запрещен!"));
        router.push({ name: "index" });
    }
});

onBeforeRouteLeave((to, from, next) => {
    if (dataChanged.value) {
        confirm.require({
            message: 'У вас остались несохраненные данные. Вы желаете уйти со страницы?',
            header: 'Предупреждение',
            icon: 'pi pi-times-circle',
            acceptClass: 'p-button-danger',
            accept: () => {
                next();
            },
            reject: () => {
                next(false);
            }
        });
    } else {
        next();
    }

});

</script>
