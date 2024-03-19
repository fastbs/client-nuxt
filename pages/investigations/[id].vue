<template>
  <div v-if="!loading" class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="grid">
      <div class="col-fixed" style="width:100px">
        <template v-if="store.Inv.source.image">
          <img :src="`${store.config.siteURL}images/${store.Inv.source.image}`" width="90" />

        </template>
        <template v-else>
          <img :src="`${store.config.siteURL}images/lupa80.jpg`" />
        </template>
      </div>
      <div class="col-8">
        <h3>Расследованиe: {{ store.Inv.source.title }} - Id: {{ store.Inv.source._id }}</h3>
        <h4>Компания: {{ store.Inv.source.company.name }}</h4>
      </div>
      <div class="col ">
        <div class="flex justify-content-end flex-wrap">
          <pButton id="back-button" severity="primary" @click="goBackward" :disabled="!parentNode" label="Назад"
            :pt="{ root: { class: 'mr-2' } }" />
          <!--           <b-popover v-if="(parentNode as boolean)" target="back-button" title="Popover title" triggers="hover" placement="bottom">{{ (parentNode as Node).name }}</b-popover>
 -->
          <pButton v-if="!childNodes" class="m-md-2" severity="primary" disabled label="Вперед"
            :pt="{ root: { class: 'mr-2' } }" />
          <pButton v-if="childNodes && (childNodes as Array<Node>).length == 1" class="m-md-2" severity="primary"
            @click="goForward(0)" :disabled="!childNodes" label="Вперед" :pt="{ root: { class: 'mr-2' } }" />
          <pButton v-if="childNodes && (childNodes as Array<Node>).length > 1" severity="primary" :disabled="!childNodes"
            icon="pi pi-angle-down" iconPos="right" label="Вперед" :pt="{ root: { class: 'mr-2' } }"
            @click="menu.toggle($event)" />
          <pMenu v-if="childNodes && (childNodes as Array<Node>).length > 1" ref="menu" id="overlay_tmenu" :model="bmenu"
            :popup="true" />
          <pButton id="save-button" class="m-md-2" variant="primary" @click="saveInvestigation" label="Сохранить" />
        </div>
      </div>
      <pDivider :pt="{ root: { class: 'mt-0' } }" />
    </div>

    <div class="flex justify-content-center">
      <transition name="fade">
        <component :is="currentComponent" :id="store.Inv.currentBlock._id" v-on:block-action="blockAction($event)">
        </component>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, computed } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { v4 as uuidv4 } from 'uuid';

import { useMainStore } from "@/store/MainStore";
import type { Node } from "@/services/dto/investigations.dto";

import BossAcceptBlock from "./Blocks/BossAccept/BossAcceptBlock.vue";
import InitializationBlock from "./Blocks/Initialization/InitializationBlock.vue";
import FixationBlock from './Blocks/Fixation/FixationBlock.vue';

import type { BlockActionEventDto } from "./dto/events.dto";

const InvestigationView = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },

  components: {
    InitializationBlock,
    FixationBlock,
    BossAcceptBlock,
  },

  setup(props) {
    const router = useRouter();
    const confirm = useConfirm();
    const toast = useToast();

    const store = useMainStore();
    const currentComponent = ref("");
    const loading = ref(true);
    const parentNode = ref<Node | boolean>();
    const childNodes = ref<Array<Node> | boolean>();

    const bmenu = ref<object[]>([]);
    const menu = ref();

    const getInvestigation = async () => {
      loading.value = true;
      store.Inv.load(props.id,
        result => {
          realSwitchBlock(store.Inv.currentNode);
          //currentComponent.value = store.Inv.currentComponent;
          loading.value = false;
        },
        error => {
          toast.add({ severity: 'error', summary: 'Ошибка', detail: error.message, life: 5000 });
        }
      );
    };

    onMounted(async () => {
      if (store.checkPermission("investigations", "get")) {
        getInvestigation();
      } else {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: "Доступ запрещен!", life: 5000 });
        router.push({ name: "Home" });
      }
    });

    const realSwitchBlock = async (path: string) => {
      console.log(">>>> realSwitchBlock > path: ", path);

      store.Inv.setCurrentNode(path);
      currentComponent.value = store.Inv.currentComponent;
      parentNode.value = store.Inv.getParentNode();
      childNodes.value = store.Inv.getChildNodes();

      console.log("** currentComponent: ", currentComponent.value)
      console.log("** parentNode: ", parentNode.value)
      console.log("** childNodes: ", childNodes.value)

      bmenu.value = [];
      if ((childNodes.value as Array<Node>).length) {
        (childNodes.value as Array<Node>).forEach((item, index) => {
          bmenu.value.push({ label: item.name, command: () => { goForward(index); }, });
        })
      }
    };

    /*     const switchBlock = async () => {
          store.increment();
          if (store.Inv.currentComponent == "InitializationBlock") {
            realSwitchBlock("children.0");
          } else if (currentComponent.value == "FixationBlock") {
            realSwitchBlock("children.0.children.0");
          } else {
            realSwitchBlock("");
          }
        }; */

    const blockAction = async (event: Event) => {
      console.log("blockAction: ", event);
      let v = (event as unknown) as BlockActionEventDto;
      store.Inv.createNode(v.p2);
      childNodes.value = store.Inv.getChildNodes();
      goForward(0);
    };

    const goBackward = async () => {
      if (parentNode.value) {
        realSwitchBlock((parentNode.value as Node).path);
      }
    };

    const goForward = async (index: number) => {
      if ((childNodes.value as Node[])[index]) {
        realSwitchBlock((childNodes.value as Node[])[index].path);
      }
    };

    const saveInvestigation = async () => {
      store.Inv.save2(
        result => {
          toast.add({ severity: 'info', summary: 'Подтверждено', detail: 'Расследование сохранено', life: 5000 });
        },
        error => {
          toast.add({ severity: 'error', summary: 'Ошибка', detail: "Расследование не сохранено! " + error.message, life: 5000 });
        }
      );
/*       if (await store.Inv.save()) {
        toast.add({ severity: 'info', summary: 'Подтверждено', detail: 'Расследование сохранено', life: 5000 });
      } else {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: "Расследование не сохранено!", life: 5000 });
      } */
    };

    return { router, loading, store, currentComponent, blockAction, goBackward, goForward, saveInvestigation, parentNode, childNodes, bmenu, menu };
  },
});

export default InvestigationView;

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
