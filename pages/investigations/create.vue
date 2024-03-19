<template>
  <div class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="flex">
      <div class="flex flex-shrink-0 justify-content-start">
        <h2>Расследования</h2>
      </div>
    </div>

    <pDivider :pt="{ root: { class: 'mt-0' } }" />

    <div class="flex justify-content-center">
      <pCard v-if="!loading" :pt="{ root: { class: 'sm:col-12 md:col-12 lg:col-8 xl:col-6 mb-3' } }">
        <template #title>
          <div class="grid">
            <div class="col-6">Новое расследование</div>
            <div class="col-6 flex flex-wrap justify-content-end gap-3">
              <pButton @click="addInvestigation()" label="Создать" severity="success" :disabled="!formState" />
            </div>
            <pDivider />
          </div>
        </template>
        <template #content>
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <label for="company">Компания: </label>
              <pDropdown v-model="inv.company._id" :options="companies" optionLabel="name" optionValue="_id"
                placeholder="Выберите компанию" :class="{ 'p-invalid': !companyState }" inputId="company" />
              <small v-if="!companyState" class="p-error fadeinup animation-duration-200" id="text-error">Необходимо
                выбрать компанию</small>
            </div>


            <div class="field col-12">
              <label for="title">Заголовок</label>
              <pInputText id="title" v-model="inv.title" type="text" :class="{ 'p-invalid': !titleState }" />
              <small v-if="!titleState" class="p-error fadeinup animation-duration-200" id="text-error">Заголовок длиной
                не менее 5 символов</small>
            </div>
            <div class="field col-12">
              <label for="description">Описание</label>
              <pInputText id="description" v-model="inv.description" type="text"
                :class="{ 'p-invalid': !descriptionState }" />
              <small v-if="!descriptionState" class="p-error fadeinup animation-duration-200" id="text-error">Описание
                длиной не менее 5 символов</small>
            </div>
          </div>
        </template>
      </pCard>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { ref, reactive, computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import { useMainStore } from "@/store/MainStore";
import CompaniesService from "@/services/CompaniesService";
import InvestigationsService from "@/services/InvestigationsService";
import type { CompanyDto } from "@/services/dto/companies.dto";
import type { CreateInvestigationDto } from "@/services/dto/investigations.dto";


const store = useMainStore();
const router = useRouter();
const toast = useToast();

const inv = reactive<CreateInvestigationDto>({ title: "", description: "", company: { _id: "" } });
const loading = ref(true);
const companies = ref<CompanyDto[]>();

const companyState = computed(() => (inv.company._id ? true : false));
const titleState = computed(() => (inv.title.length >= 5));
const descriptionState = computed(() => (inv.description.length >= 5));
const formState = computed(() => (titleState.value && descriptionState.value));


const addInvestigation = async () => {
  if (formState) {
    InvestigationsService.create(inv,
      result => {
        router.push({ name: "InvestigationView", params: { id: result._id } });
        toast.add({ severity: 'success', summary: 'Подтверждено', detail: 'Создано новое расследование', life: 5000 });
      },
      error => {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: error.message, life: 5000 });
        router.push({ name: "Home" });
      }
    );
  }
};

onBeforeMount(async () => {
  if (store.checkPermission("investigations", "post")) {
    CompaniesService.fetch(
      result => {
        companies.value = result;
        loading.value = false;
      },
      error => {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: error.message, life: 5000 });
        router.push({ name: "Home" });
      }
    );
  } else {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: "Доступ запрещен!", life: 5000 });
    router.push({ name: "Home" });
  }
});


</script>
  
<style scoped>
.hide {
  position: absolute;
  top: -9999px;
  left: -9999px;
}
</style>
