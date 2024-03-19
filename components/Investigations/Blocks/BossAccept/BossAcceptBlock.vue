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
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";

import { useMainStore } from "@/store/MainStore";


const props = defineProps({
    id: {
        type: String,
        data: Object,
    },
});
const emit = defineEmits(["block-action"]);


const store = useMainStore();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dc = ref<any>();
const loading = ref(true);


const formState = computed(() => {
    return true;
});


onMounted(async () => {
    dc.value = store.Inv.currentBlock;
    loading.value = false;
});

const finishBlock = async () => {
    store.Inv.updateCurrentBlock(dc.value.data);
    //emit("block-action", { p1: "Next block", p2: "" });
};


</script>
