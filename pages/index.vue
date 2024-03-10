<template>
  <div class="card mb-3 flex flex-column justify-content-center" style="padding-top: 1.5rem;">
    <div class="flex">
      <div class="flex flex-shrink-0 justify-content-start">
        <h2>Главная</h2>
      </div>
    </div>

    <pDivider :pt="{ root: { class: 'mt-0' } }" />

    <div class="grid">
      <div class="col-4" v-for="card in cards" :key="card.id">
        <pCard :pt="{ root: { style: 'overflow: hidden; height: 100%;' } }">
          <template #header>
            <img alt="header" :src="card.image" style="object-fit: cover; width: 100%;" height="200" />
          </template>
          <template #title>{{ card.title }}</template>
          <!-- <template #subtitle> Card subtitle </template> -->
          <template #content>
            <p style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;">{{
              card.text }}</p>
          </template>
          <template #footer>
            <pButton icon="pi pi-check" label="Primary" />
            <pButton icon="pi pi-times" label="Cancel" severity="secondary" style="margin-left: 0.5em" />
          </template>
        </pCard>
      </div>
    </div>

    <div class="card mt-2 mb-3">
      <!--<QuillEditor theme="snow" />-->
      <p>{{ editorData }}</p>
    </div>

    <div id="my-element" class="card flex justify-content-center flex-wrap gap-3 mt-2 mb-2">
      <pButton label="Primary" @click="ci()" />
      <pButton label="Secondary" severity="secondary" @click="sc()" />
      <pButton label="Success" severity="success" @click="handleAttachment()" />
      <pButton label="Info" severity="info" @click="wsQuery($event)" />
      <pButton label="Warning" severity="warning" @click="lgt()"/>
      <pButton label="Help" severity="help" />
      <pButton label="Danger" severity="danger" />
      <br />
      <input id="hiddenAttachment" class="hide" type="file" multiple @change.prevent="fileChange($event)" />
    </div>

  </div>
</template>

<script lang="ts" setup>
import EmployesService from "@/services/EmployeesService"
import { socket } from "@/services/socket";
import type { CreateJobTitleDto } from "@/services/dto/jobtitles.dto";
import JobTitlesService from "@/services/JobTitlesService";

const store = useMainStore();
const router = useRouter();
const editorData = ref("My Data 12345");

onBeforeMount(async () => {
});

onMounted(async () => {
});

const ci = async () => {
  const njt: CreateJobTitleDto ={
    name: "From Main",
    name_short: "fm",
    company: 81     // 81 - Zais   84 - Admin
  }
  const ret = await JobTitlesService.create(njt);
  console.log("JobTitlesService.create result:", ret);
}

const sc = async () => {
  //const ret = await EmployesService.delete("12345");
  router.push({ name: "user-login" });
}

const lgt = async () => {
  router.push({ name: "user-logout" });
}

const handleAttachment = () => {
  let node = document.getElementById("hiddenAttachment");
  if (node != null) {
    node.click();
  }
};

const fileChange = async (event: Event) => {
  if (event.target != null) {
    let vr = (event.target as HTMLInputElement)
    if (vr.files != null) {
      for (let i = 0; i < vr.files.length; i++) {
        console.log("file: ", i, "  name: ", vr.files[i].name);

        socket.emit('upload', { filename: vr.files[i].name, buffer: vr.files[i] }, (response: any) =>
          console.log('*** WS *** Upload:', response),
        );
      }
    }
  }
}

const wsQuery = async (event: Event) => {
  socket.emit("fbs", "Event type: " + event.type + " Timestamp: " + event.timeStamp,
    (response: any) => console.log("wsQuery response:", response));
}

const cards = [
  {
    id: 1,
    title: "Первый заголовок",
    descr: "Первый подзаголовок",
    text: "Над седой равниной моря ветер тучи собирает. Между тучами и морем гордо реет Буревестник, черной молнии подобный. То крылом волны касаясь, то стрелой взмывая к тучам, он кричит, и — тучи слышат радость в смелом крике птицы. В этом крике — жажда бури!",
    image: "/images/zai.jpg",
  },
  {
    id: 2,
    title: "Второй заголовок",
    descr: "Второй подзаголовок",
    text: "текст",
    image: "/images/volk.jpg",
  },
  {
    id: 3,
    title: "Третий заголовок",
    descr: "Третий подзаголовок",
    text: "текст",
    image: "/images/index.jpg",
  },
];

</script>

<style scoped>
.hide {
  position: absolute;
  top: -9999px;
  left: -9999px;
}
</style>