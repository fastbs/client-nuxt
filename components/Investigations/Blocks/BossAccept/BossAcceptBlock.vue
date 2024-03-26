<template>
    <div class="col-12">
        <pCard v-if="!loading" :pt="{ root: { class: 'sm:col-12 md:col-12 lg:col-12 xl:col-12 mb-3' } }">
            <template #title>
                <div class="grid">
                    <div class="col-6">Компонент: {{ dc.name }} - {{ dc.type }}</div>
                    <div class="col-6 flex flex-wrap justify-content-end gap-3">
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
                        <span class="ml-2"><strong>Блок здесь</strong></span>
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
import UsersService from "@/services/UsersService";
import type { ContentBlockDto } from "@/services/dto/investigations.dto";

import { Investigation } from "@/models/Investigation";

const emit = defineEmits(["block-action"]);

const router = useRouter();
const { $toast } = useNuxtApp();

let invModel = defineModel<Investigation>("Inv", { type: Investigation, required: true });
let Inv = new Investigation();
//let Inv: Investigation = invModel.value;
const dc = ref<ContentBlockDto>(Inv.currentBlock);

const loading = ref(true);

const formState = computed(() => {
    return true;
});


onMounted(async () => {
    console.log(">>> Enter BossAcceptBlock - onMounted");

    if (UsersService.checkPermission("investigations", "update")) {
        if (invModel.value) {
            Inv = invModel.value;
            dc.value = Inv.currentBlock; //store.Inv.currentBlock;
            loading.value = false;
        } else {
            $toast.errors(new Error("Объект Investigation не содержит данных!"));
            router.push({ name: "index" });
        }
    } else {
        $toast.errors(new Error("Доступ запрещен - BossAcceptBlock!"));
        router.push({ name: "index" });
    }

});

const finishBlock = async () => {
    Inv.updateCurrentBlock(dc.value.data);
    //emit("block-action", { p1: "Next block", p2: "BossAcceptBlock" });
};


</script>
