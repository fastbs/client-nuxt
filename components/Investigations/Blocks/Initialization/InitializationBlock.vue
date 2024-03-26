<template>
    <div class="col-12">
        <pCard v-if="!loading" :pt="{ root: { class: 'sm:col-12 md:col-12 lg:col-12 xl:col-12 mb-3' } }">
            <template #title>
                <div class="grid">
                    <div class="col-6">Компонент: {{ dc.name }} - {{ dc.type }}</div>
                    <div class="col-6 flex flex-wrap justify-content-end gap-3">
                        <!-- <pButton @click="createReport('pdf')" label="Создать отчет" severity="success" /> -->

                        <pButton severity="success" icon="pi pi-angle-down" iconPos="right" label="Создать отчет"
                            :pt="{ root: { class: 'mr-2' } }" @click="reportMenu.toggle($event)" />
                        <pMenu ref="reportMenu" id="overlay_tmenu" :model="bmenu" :popup="true" />


                        <pButton @click="finishBlock()" label="Завершить действие" severity="primary"
                            :disabled="!formState" />
                    </div>
                    <pDivider />
                </div>
            </template>
            <template #content>
                <div class="formgrid">
                    <div class="field grid pl-3">
                        <pInputSwitch v-model="dc.data.is_periodic" />
                        <span class="ml-2"><strong>Включить режим заместителей руководителя</strong></span>
                    </div>

                    <div v-if="!dc.data.is_periodic" class="field grid">
                        <label for="director" class="col-12 mt-2 mb-2"><strong>Руководитель компании:</strong></label>
                        <div class="col-12 pl-5">
                            <EmployeeSelect v-model="dc.data.director.employee" :company="Inv.source.company.id"
                                id="director" />
                        </div>

                        <label for="directorJobTitle" class="col-12 mt-1 mb-2"><strong>Должность руководителя
                                компании:</strong></label>
                        <div class="col-12 pl-5">
                            <JobTitleSelect v-model="dc.data.director.job_title" :company="Inv.source.company.id"
                                id="directorJobTitle" />
                        </div>

                        <label for="directorBasis" class="col-12 mt-1 mb-2"><strong>Основания
                                полномочий:</strong></label>
                        <div class="ml-3 mb-2">
                            <pButton v-for="(item, index) in store.basis" :key="index" class="mr-1" size="small"
                                severity="secondary" outlined @click="dc.data.director.basis = item.text"
                                :label="item.name" />
                        </div>
                        <div class="col-12">
                            <pInputText id="directorBasis" v-model="dc.data.director.basis" type="text"
                                :class="{ 'w-full': true, 'p-invalid': !directorBasisState }" />
                            <small v-if="!directorBasisState" class="p-error fadeinup animation-duration-200"
                                id="text-error">Не менее 5 символов</small>
                        </div>
                    </div>

                    <div v-if="dc.data.is_periodic" class="field grid">
                        <EmployeesTable v-model="dc.data.directors" :company="Inv.source.company.id"
                            v-model:readyState="employeesTableReadyState" id="directorsTable" />
                    </div>

                </div>
            </template>
        </pCard>
        <div>
            <pre> {{ JSON.stringify(dc, null, 2) }}</pre>
        </div>
    </div>
</template>

<script lang="ts" setup>
import find from "lodash/find"
import dayjs from "dayjs";
import "dayjs/locale/ru.js";
import { saveAs } from 'file-saver';
//import { ConvertToPdf } from "docx2pdfmaker"; 

import UsersService from "@/services/UsersService";
import EmployeesService from "@/services/EmployeesService";
import JobTitlesService from "@/services/JobTitlesService";
import type { ContentBlockDto } from "@/services/dto/investigations.dto";
import type { EmployeeDto } from "@/services/dto/employees.dto";
import type { JobTitleDto } from "@/services/dto/jobtitles.dto";
import type { EmployeesTableItemDto } from "@/services/dto/employees.dto";

import { exportDocx } from "@/utils/exportDocx.js";
import { Investigation } from "@/models/Investigation";

const emit = defineEmits(["block-action"]);

const store = useMainStore();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

let invModel = defineModel<Investigation>("Inv", { type: Investigation, required: true });
let Inv = new Investigation();
//let Inv: Investigation = invModel.value;
const dc = ref<ContentBlockDto>(Inv.currentBlock);

const employees = ref<EmployeeDto[]>();
const jobTitles = ref<JobTitleDto[]>();
const loading = ref(true);
const employeesTableReadyState = ref(false);

const bmenu = ref<object[]>([
    { label: "Сохранить в PDF", command: () => { createReport("pdf"); }, },
    { label: "Сохранить в Word", command: () => { createReport("docx"); }, }
]);
const reportMenu = ref();


const directorEmployeeState = computed(() => (dc.value.data.director.employee ? true : false));
const directorJobTitleState = computed(() => (dc.value.data.director.job_title ? true : false));
const directorBasisState = computed(() => (dc.value.data.director.basis.length >= 5 ? true : false));

const formState = computed(() => {
    if (!dc.value.data.is_periodic) {
        return directorJobTitleState && directorEmployeeState.value && directorBasisState.value;
    }
    else {
        return employeesTableReadyState.value;
    }
});

onMounted(async () => {
    console.log(">>> Enter InitializationBlock - onMounted");

    if (UsersService.checkPermission("investigations", "update")) {
        if (invModel.value) {
            Inv = invModel.value;
            dc.value = Inv.currentBlock; //store.Inv.currentBlock;
            if (await loadData()) {
                loading.value = false;
            } else {
                $toast.errors(new Error("Ошибка загрузки данных - InitializationBlock!"));
                router.push({ name: "index" });
            }
        } else {
            $toast.errors(new Error("Объект Investigation не содержит данных!"));
            router.push({ name: "index" });
        }
    } else {
        $toast.errors(new Error("Доступ запрещен - InitializationBlock!"));
        router.push({ name: "index" });
    }
});

const loadData = async () => {
    const resEmployees = await EmployeesService.fetch({ "filter": { "company": { "id": { "_eq": Inv.source.company.id } } } });
    const resJobTitles = await JobTitlesService.fetch({ "filter": { "company": { "id": { "_eq": Inv.source.company.id } } } });

    if (resEmployees && resJobTitles) {
        employees.value = resEmployees;
        jobTitles.value = resJobTitles;
        return true;
    }

    return false;
};

const finishBlock = async () => {
    Inv.updateCurrentBlock(dc.value.data);
    emit("block-action", { p1: "Next block", p2: "FixationBlock" });
};

const createReport = async (format: string) => {
    console.log("createReport  format: ", format);
    //loadData();

    //let blob = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
    //saveAs(blob, "hello world.txt");
    dayjs.locale("ru");

    const employee = find(employees.value, { '_id': dc.value.data.director.employee }) as EmployeeDto;
    const jobTitle = find(jobTitles.value, { '_id': dc.value.data.director.job_title }) as JobTitleDto;
    let director = {
        employee: employee ? employee.name : "",
        job_title: jobTitle ? jobTitle.name : "",
        basis: dc.value.data.director.basis,
    };

    let directors = <object[]>[];
    (dc.value.data.directors as [EmployeesTableItemDto]).forEach(item => {
        const employee = find(employees.value, { '_id': item.employee }) as EmployeeDto;
        const jobTitle = find(jobTitles.value, { '_id': item.job_title }) as JobTitleDto;

        let nd = {
            employee: employee ? employee.name : "",
            job_title: jobTitle ? jobTitle.name : "",
            starts_at: dayjs(item.starts_at).format("DD.MM.YYYY"),
            ends_at: dayjs(item.ends_at).format("DD.MM.YYYY"),
            basis: item.basis,
        };

        directors.push(nd);
    })


    let data = {
        reportType: dc.value.type as string,
        reportTitle: dc.value.name as string,
        reportTime: dayjs().format("DD.MM.YYYY HH:mm:ss"),

        companyName: Inv.source.company.name,
        investigationTitle: Inv.source.title,
        is_periodic: dc.value.data.is_periodic as boolean, // ? 1 : 0,
        director: director,
        directors: directors,

        "people": [
            {
                "number": "1",
                "FIO": "Зайчище",
                "bdate": "20.01.1976"
            },
            {
                "number": "2",
                "FIO": "Ежидзе",
                "bdate": "08.10.1977"
            }
        ],
    }

    console.log("data: ", data);

    if (format == "docx") {
        exportDocx("/reports/InitializationBlock.docx", data, `Report - ${Inv.source.title} - ${dc.value.name}.docx`);
    } else if (format == "pdf") {
        let doc = await exportDocx("/template.docx", data);
        console.log(">>>>> doc: ", doc);
        //const convertedToPdfMaker = await ConvertToPdf(doc, 'buffer');
        //console.log(">>>>> convertedToPdfMaker: ", convertedToPdfMaker) ;
    }

};



</script>
