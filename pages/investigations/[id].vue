<template>
  <div v-if="!loading" class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="grid">
      <div class="col-fixed" style="width:100px">
        <template v-if="Inv.source.image">
          <img v-if="Inv.source.image" :src="store.config.postImagePath + Inv.source.image.id" width="90"
            :alt="Inv.source.title" />
        </template>
        <template v-else>
          <img :src="`${store.config.siteURL}images/lupa80.jpg`" />
        </template>
      </div>
      <div class="col-8">
        <h3>Расследованиe: {{ Inv.source.title }} - Id: {{ Inv.source.id }}</h3>
        <h4>Компания: {{ Inv.source.company.name }}</h4>
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
          <pButton v-if="childNodes && (childNodes as Array<Node>).length > 1" severity="primary"
            :disabled="!childNodes" icon="pi pi-angle-down" iconPos="right" label="Вперед"
            :pt="{ root: { class: 'mr-2' } }" @click="menu.toggle($event)" />
          <pMenu v-if="childNodes && (childNodes as Array<Node>).length > 1" ref="menu" id="overlay_tmenu"
            :model="bmenu" :popup="true" />
          <pButton id="save-button" class="m-md-2" variant="primary" @click="saveInvestigation" label="Сохранить" />
        </div>
      </div>
      <pDivider :pt="{ root: { class: 'mt-0' } }" />
    </div>

    <div class="flex justify-content-center">
      <!-- <transition name="fade"> -->

      <component :is="components.get(currentComponent)" :id="Inv.currentBlock.id"
        v-on:block-action="blockAction($event)" v-model:Inv="Inv" />
      <!-- </transition> -->
    </div>
    <div>
      <pButton @click="upds()">Update source</pButton>
      <pre> {{ src }} </pre>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid';

const store = useMainStore();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

import { InitializationBlock } from '#components';
import { FixationBlock } from '#components';
import { BossAcceptBlock } from '#components';
import { FakeBlock } from '#components';

const components = new Map();
components.set("InitializationBlock", InitializationBlock);
components.set("FixationBlock", FixationBlock);
components.set("BossAcceptBlock", BossAcceptBlock);
components.set("FakeBlock", FakeBlock);

import UsersService from "@/services/UsersService";
import InvestigationsService from "@/services/InvestigationsService";
import type { InvestigationDto, BlockActionEventDto, ContentBlockDto } from "@/services/dto/investigations.dto";
import type { Node } from "@/services/dto/investigations.dto";
//import { InvInjectionKey } from "@/components/Keys";
import { Investigation } from '@/models/Investigation';


const Inv = new Investigation();
const currentComponent = ref("");
let currentBlock: ContentBlockDto = Inv.currentBlock;
/*
{
  id: "",
  name: "",
  type: "",
  is_ready: false,
  data: {},
  children: {},
};
*/

const loading = ref(true);
const parentNode = ref<Node | boolean>();
const childNodes = ref<Array<Node> | boolean>();

const bmenu = ref<object[]>([]);
const menu = ref();

const src = ref("");
const upds = async () => {
  src.value = JSON.stringify(Inv.source.content, null, 2);
}

const getInvestigation = async () => {
  loading.value = true;
  if (await Inv.load(Number(route.params.id))) {
    realSwitchBlock(Inv.currentNode);
    loading.value = false;
  };
};

onMounted(async () => {
  if (UsersService.checkPermission("investigations", "update")) {
    getInvestigation();
  } else {
    $toast.errors(new Error("Доступ запрещен - Investigations [id]!"));
    router.push({ name: "index" });
  }
});

const realSwitchBlock = async (path: string) => {
  console.log(">>>> realSwitchBlock > path: ", path);

  Inv.setCurrentNode(path);
  parentNode.value = Inv.getParentNode();
  childNodes.value = Inv.getChildNodes();

  /*  
    provide(InvInjectionKey, Inv);
    provide("Inv", Inv);
    const QQ = "very useful string";
    console.log("QQ in parent:", QQ);
    provide("QQ", QQ);
  */

  currentComponent.value = Inv.currentComponent;
  currentBlock = Inv.currentBlock;

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

const blockAction = async (event: BlockActionEventDto) => {
  console.log("blockAction: ", event);
  switch (event.p1) {
    case "Next block":
      Inv.createNode(event.p2);
      childNodes.value = Inv.getChildNodes();
      goForward(0);
      break;
  }
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
  if (await Inv.save()) {
    $toast.success("Расследование сохранено");
  }
};


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
