<template>
    <div class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
        <div class="flex">
            <div class="flex flex-shrink-0 justify-content-start">
                <h2>Справочник - Компании</h2>
            </div>
        </div>

        <pDivider :pt="{ root: { class: 'mt-0' } }" />

        <pDataTable :value="tableData" dataKey="id" editMode="cell" @cell-edit-complete="onCellEditComplete($event)"
            paginator :rows="10" v-model:selection="selected" :filters="filters" :rowsPerPageOptions="[2, 5, 10, 20, 50]"
            tableClass="editable-cells-table" tableStyle="min-width: 50rem" showGridlines
            :pt="{ row: { style: 'height: 58px; ' } }" :rowClass="rowClass" :loading="loading">
            <template #header>
                <div class="flex justify-content-between">
                    <div>
                        <pButton v-if="UsersService.checkPermission('companies', 'create')" label="Добавить"
                            icon="pi pi-plus" severity="success" class="mr-2" @click="addData" />
                        <pButton v-if="UsersService.checkPermission('companies', 'delete')" label="Удалить"
                            icon="pi pi-trash" severity="danger" :disabled="!selected || !selected.length"
                            @click="deleteSelected()" class="mr-4" />
                        <pButton
                            v-if="UsersService.checkPermission('companies', 'create') || UsersService.checkPermission('companies', 'delete') || UsersService.checkPermission('companies', 'update')"
                            icon="pi pi-save" label="Сохранить изменения" :disabled="!dataChanged || !tableValid"
                            @click="saveData()" />
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
            <pColumn v-for="col of tableColumns" :field="col.field" :hidden="col.hidden" :header="col.header"
                :sortable="col.sortable" v-model:style="col.style">
                <template #body="{ data, field }">
                    {{ field === 'user_created' ? data[field].first_name + '\n' + data[field].email : data[field] }}
                </template>
                <template v-if="UsersService.checkPermission('companies', 'update') && col.field !== 'user_created'"
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
import CompaniesService from "@/services/CompaniesService";
import type { CompanyDto, CreateCompanyDto, UpdateCompanyDto } from "@/services/dto/companies.dto";

const store = useMainStore();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

const tableData = ref<CompanyDto[]>([]);
const selected = ref<CompanyDto[]>([]);
const deletedData = <number[]>[];
const updatedData = <number[]>[];
let lastId = 0;
let newId = 0;
const loading = ref(true);
const dataChanged = ref(false);
const tableValid = computed(() => !(tableData.value as CompanyDto[]).find(x => !x.name));

const tableColumns = ref([
    { field: 'id', header: 'Id', hidden: true },
    { field: 'name', header: 'Наименование', sortable: true, style: 'width: 45%;' },
    { field: 'name_short', header: 'Краткое наименование', sortable: false, style: 'width: 30%;' },
    { field: 'inn', header: 'ИНН', sortable: true, style: 'width: 25%;' },
]);
if (store.user?.role?.name && ["Publisher", "Administrator"].includes(store.user.role.name)) {
    tableColumns.value.push({ field: 'user_created', header: 'Пользователь', sortable: true, style: 'width: 30%;' });
}

const rowClass = (data: CompanyDto) => {
    return [{ 'bg-red-100': !data.name, 'bg-teal-50': updatedData.includes(Number(data.id)), 'bg-green-50': data.id > lastId, 'bg-blue-50': selected.value.find(x => x.id == data.id) }];
};

const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});


const getData = async () => {
    loading.value = true;
    const response = await CompaniesService.fetch();
    tableData.value = [];
    selected.value = [];
    if (response) {
        tableData.value = response;
        lastId = tableData.value.length ? Number(tableData.value[tableData.value.length - 1].id) : 0;
        newId = lastId + 1;
        loading.value = false;
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
        await CompaniesService.deleteMany(deletedData);
    }

    for (const id of updatedData) {
        const item = tableData.value.find(x => x.id == id);
        if (item) {
            const uc: UpdateCompanyDto = {
                name: item.name,
                name_short: item.name_short,
                inn: item.inn,
            };
            await CompaniesService.update(id, uc);
        }
    }

    const newData = tableData.value?.filter(x => x.id > lastId);
    for (const item of newData) {
        const cc: CreateCompanyDto = {
            name: item.name,
            name_short: item.name_short,
            inn: item.inn,
        }
        await CompaniesService.create(cc);
    }

    await getData();
    deletedData.length = 0;
    updatedData.length = 0;
    dataChanged.value = false;
    $toast.success("Изменения сохранены");
};

const addData = () => {
    let ni: CompanyDto = {
        id: newId,
        name: "",
        name_short: "",
        inn: "",
        user_created: { id: store.user?.id as string, email: store.user?.email as string, first_name: store.user?.first_name }
    };
    (tableData.value as CompanyDto[]).push(ni);
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
    if (UsersService.checkPermission("companies", "read")) {
        getData();
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
