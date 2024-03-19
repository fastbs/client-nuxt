<template>
  <div class="card mb-3" style="padding-top: 1.5rem;">
    <div class="flex">
      <div class="flex flex-shrink-0 justify-content-start">
        <h2>Карты - обработка изображений</h2>
      </div>
      <div class="flex flex-grow-1 justify-content-end ">
        <div style="align-content: center;">
          Масштаб: {{ scale }}%
          <PSlider v-model="scale" class="w-14rem mr-4 mt-2" :min="10" :max="100" />
        </div>
        <div>

          <PButton v-tooltip.bottom="{ value: 'Уменьшить масштаб', showDelay: 300, hideDelay: 300 }"
            icon="pi pi-search-minus" aria-label="Zoom out" outlined class="mr-1" @click="zoomClick(-1)" />
          <PButton v-tooltip.bottom="{ value: 'Масштаб 1:1', showDelay: 300, hideDelay: 300 }" icon="pi pi-search"
            aria-label="1:1" outlined class="mr-1" @click="zoomClick(0)" />
          <PButton v-tooltip.bottom="{ value: 'Увеличить масштаб', showDelay: 300, hideDelay: 300 }"
            icon="pi pi-search-plus" aria-label="Zoom in" outlined class="mr-1" @click="zoomClick(1)" />
          <PButton v-tooltip.bottom="{ value: 'Сохранить изменения', showDelay: 300, hideDelay: 300 }" icon="pi pi-save"
            :disabled="!isDataChanged" severity="success" aria-label="Save" outlined class="ml-1 mr-1"
            @click="saveData()" />
        </div>
        <div class="ml-3">
          <span>Изображение: </span>
          <PDropdown v-model="selectedMapImage" :options="mapImages" optionLabel="name" optionValue="id"
            placeholder="Выберите карту" inputId="company" @change="changeMapImage()" class="w-14rem" />
        </div>

      </div>
    </div>
    <pDivider :pt="{ root: { class: 'mt-0' } }" />
    <div id="map-container" style="position: relative;">
      <PCard id="map-commands"
        style="width: 35rem; overflow: hidden; position: absolute; z-index: 2; left: 20px; top: 20px;">
        <template #title>Добавление маркеров</template>

        <template #content>
          <table style="table-layout: fixed; margin: 0 auto;">
            <tr>
              <td style="width: 25px;">X:</td>
              <td style="width: 180px;">{{ clickPoint ? clickPoint.x : '' }}</td>
              <td style="width: 20px;"></td>
              <td style="width: 25px;">Y:</td>
              <td style="width: 180px;">{{ clickPoint ? clickPoint.y : '' }}</td>
            </tr>
            <tr>
              <td style="width: 25px;">Lat2:</td>
              <td style="width: 180px;">{{ clickPoint2 ? clickPoint2.lat : '' }}</td>
              <td style="width: 20px;"></td>
              <td style="width: 25px;">Lng2:</td>
              <td style="width: 180px;">{{ clickPoint2 ? clickPoint2.lng : '' }}</td>
            </tr>
          </table>
          <div class="flex justify-content-center gap-3 mt-2">
            <PInputGroup>
              <PInputText id="input-name" v-model="markerName" placeholder="Имя" @keydown="onKeyPress($event)" />
              <PInputGroupAddon>
                <i class="pi pi-tag"></i>
              </PInputGroupAddon>
            </PInputGroup>
            <PInputGroup>
              <PInputText id="input-extra" v-model="markerComment" placeholder="Информация"
                @keydown="onKeyPress($event)" />
              <PInputGroupAddon>
                <i class="pi pi-info-circle"></i>
              </PInputGroupAddon>
            </PInputGroup>
            <!-- <PInputText id="input-number" v-model="markerNumber" placeholder="Номер" @keydown="onKeyPress($event)" /> -->
          </div>
        </template>

        <template #footer>
          <div class="flex justify-content-center gap-3">
            <PButton :disabled="img == null || !markerName" label="Сохранить" class="w-full" @click="saveMarker()" />
            <PButton :disabled="img == null" label="Отмена" severity="secondary" class="w-full"
              @click="cancelMarker()" />
            <PButton :disabled="img == null" label="Копировать" severity="info" class="w-full" @click="copyPoint()" />
          </div>
        </template>
      </PCard>
      <PScrollPanel id="scroll" style="position: relative; width: 100%; height: 680px;"
        :pt="{ wrapper: { class: 'scroll-wrapper' }, content: { style: 'position: relative;' } }">
        <div id="map-wrapper" style="position: relative;">
          <img id="map-image" class="map-image" src="" style="cursor: crosshair;" @click="onClick($event)"
            @mousemove="onMove($event)" />

          <div id="hint">
            <p>Text here</p>
          </div>
        </div>
      </PScrollPanel>

      <POverlayPanel ref="op" id="opanel" append-to="body">
        <div class="flex flex-column gap-3 w-25rem">

          <template v-if="opMarker">
            <div>
              <span class="text-2xl font-bold text-900 block mb-2">Свойства маркера id={{ opMarker.id }}</span>
              <span class="font-medium text-900 block mb-2">Имя:</span>
              <PInputGroup>
                <PInputText v-model="opMarker.name" placeholder="Имя" />
                <PInputGroupAddon>
                  <i class="pi pi-tag"></i>
                </PInputGroupAddon>
              </PInputGroup>
            </div>
            <div>
              <span class="font-medium text-900 block mb-2">Информация:</span>
              <PInputGroup>
                <PInputText v-model="opMarker.comment" placeholder="Информация" />
                <PInputGroupAddon>
                  <i class="pi pi-info-circle"></i>
                </PInputGroupAddon>
              </PInputGroup>
            </div>
            <div class="flex justify-content-center gap-3">
              <PButton label="Сохранить" icon="pi pi-save" :disabled="!opChanged" @click="opSave($event)"></PButton>
              <PButton label="Закрыть" severity="secondary" icon="pi pi-times" @click="opHide($event)"></PButton>
              <PButton label="Удалить" severity="danger" icon="pi pi-trash" @click="opDelete($event)"></PButton>
            </div>
          </template>
        </div>
      </POverlayPanel>

    </div>

  </div>
</template>

<script lang="ts" setup>
import clamp from "lodash/clamp";
import cloneDeep from "lodash/cloneDeep";

import type { MapImageDto, MapPoint, MapRectangle, CreateMapMarkerDto, MapMarkerDto, UpdateMapMarkerDto } from '@/services/dto/maps.dto';
import UsersService from '@/services/UsersService';
import MapsService from '@/services/MapsService';
import { MapCalculator } from '@/models/Map';
import { xor } from "lodash";


const store = useMainStore();
const router = useRouter();
const confirm = useConfirm();
const { $toast } = useNuxtApp();

const mapImages = ref<MapImageDto[]>([]);
const selectedMapImage = ref(0);
const currentMapImage = ref<MapImageDto>();
const isDataChanged = ref(false);

const scale = ref(100);
const clickPoint = ref<MapPoint | null>(null);
const clickPoint2 = ref<MapPoint | null>(null);
let markers = <MapMarkerDto[]>[]; //new Map<number, MapMarker>();
let updatedMarkers = <number[]>[];
let deletedMarkers = <number[]>[];
//let newMarkers = <MapMarker[]>[]; //new Map<number, MapMarker>();
let target: MapPoint | null;
let rectangle: MapRectangle | null;
const op = ref();
let opId = 0;
const opMarker = ref<MapMarkerDto>();
const opMarkerInit = ref<MapMarkerDto>();
const opChanged = computed(() => opMarker && opMarkerInit && (opMarker.value?.name != opMarkerInit.value?.name || opMarker.value?.comment != opMarkerInit.value?.comment));

let lastId = 0;
let newId = 0;


let mi: HTMLImageElement | null = null;
let sc: HTMLElement | null = null;
let mw: HTMLElement | null = null;
let img: HTMLImageElement | null = null;
let rect: HTMLElement | null = null;
let iname: HTMLInputElement | null;
let iextra: HTMLInputElement | null;
let hint: HTMLElement | null;

const markerName = ref("");
const markerComment = ref("");


function transformDirect(v: number) {
  return Math.round(v * 100 / scale.value);
}

function transformRevert(v: number) {
  return Math.round(v * scale.value / 100);
}

function setTargetImage() {
  if (target && img) {
    img.id = "target";
    img.src = "/images/target4.png";
    img.style.position = "absolute";
    img.style.zIndex = "2";
    img.style.left = transformRevert(target.x) + "px"; // -15
    img.style.top = transformRevert(target.y) + "px"; // -15
    img.style.transform = `matrix(1, 0, 0, 1, -15, -15)`;
  }
}

function setSelectionRectangle() {
  if (rectangle && rect) {
    rect.id = "rect";
    rect.style.left = transformRevert(rectangle.x) + "px";
    rect.style.top = transformRevert(rectangle.y) + "px";
    rect.style.width = transformRevert(rectangle.w) + "px";
    rect.style.height = transformRevert(rectangle.h) + "px";
  }
}

function createMarkerImage(marker: MapMarkerDto) {
  const nmi = document.createElement("img");
  nmi.id = "marker-" + marker.id;
  nmi.style.position = "absolute";
  nmi.style.zIndex = "2";
  nmi.src = "/images/target5.png";
  nmi.style.cursor = "pointer";
  nmi.style.left = transformRevert(marker.x) + "px"; // -15
  nmi.style.top = transformRevert(marker.y) + "px"; // -15
  nmi.style.transform = `matrix(1, 0, 0, 1, -15, -15)`;
  mw!.appendChild(nmi); // sc


  nmi.addEventListener('click', (event: MouseEvent) => {
    hint!.style.visibility = "hidden";
    const el = event.target as HTMLElement;
    const id = Number(el.id.replace("marker-", ""));
    opId = markers.findIndex(m => m.id == id); //markers.get(id);
    if (opId != -1) {
      opMarker.value = cloneDeep(markers[opId]); //markers.get(id);
      opMarkerInit.value = cloneDeep(markers[opId]);
      op.value.toggle(event);
    }
  });

  nmi.addEventListener('mouseenter', (event: MouseEvent) => {
    if (hint && hint.style.visibility == "hidden" && !op.value.visible) {
      const el = event.target as HTMLElement;
      const id = Number(el.id.replace("marker-", ""));
      const marker = markers.find(m => m.id == id); //markers.get(id);
      if (marker) {
        hint.innerHTML = `<b>id= </b>${id}<br/><b>Имя: </b>${marker.name}<br/><b>Инфо:</b> ${marker.comment}`;
        hint.style.left = transformRevert(marker.x) + "px";
        hint.style.top = transformRevert(marker.y) + 18 + "px";
        hint.style.visibility = "visible";
      }
    }
  });

  nmi.addEventListener('mouseleave', (event: MouseEvent) => {
    if (hint && hint.style.visibility == "visible") {
      hint.style.visibility = "hidden";
    }
  });

};

watch(scale, (val) => {
  mi!.style.transformOrigin = "left top";
  mi!.style.transform = `matrix(${val / 100}, 0, 0, ${val / 100}, 0, 0)`;

  setTargetImage();
  setSelectionRectangle();

  markers.forEach((marker, key) => {
    const el = document.getElementById("marker-" + marker.id) as HTMLImageElement | null;
    if (el) {
      el.style.left = transformRevert(marker.x) + "px"; // -15
      el.style.top = transformRevert(marker.y) + "px"; // -15
      el.style.transform = `matrix(1, 0, 0, 1, -15, -15)`;
    }
  })
})

const mapCalculator = new MapCalculator();

onBeforeMount(async () => {
  if (!UsersService.checkPermission("map_images", "read")) {
    $toast.errors(new Error("Доступ запрещен!"));
    router.push({ name: "index" });
  }
});

onMounted(async () => {
  sc = document.getElementById("scroll_content") as HTMLImageElement | null;;
  mw = document.getElementById("map-wrapper");
  mi = document.getElementById("map-image") as HTMLImageElement | null;
  iname = document.getElementById("input-name") as HTMLInputElement | null;
  iextra = document.getElementById("input-extra") as HTMLInputElement | null;
  hint = document.getElementById("hint");

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    onKeyPress(event);
  });

  hint!.style.visibility = "hidden";

  mw!.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) {
      return;
    }
    event.preventDefault();
    scale.value = clamp(scale.value + (Math.sign(event.deltaY) > 0 ? -10 : 10), 10, 100);
  });

  let res_mi = await MapsService.fetchMapImages();
  if (res_mi) {
    mapImages.value = res_mi;
    loadData(mapImages.value[3].id);
  }
});

const loadData = async (mapImageId: number) => {
  const fi = mapImages.value.find(x => x.id == mapImageId);
  const res_mip = await MapsService.getMapImagePoints(mapImageId);
  if (fi && res_mip) {
    mapCalculator.multiBasis(res_mip);
    currentMapImage.value = fi;
    selectedMapImage.value = fi.id;
    mapCalculator.chahgeBasis(fi.point1, fi.point2);
    mi!.src = store.config.postImagePath + fi.image?.id;
    loadMarkers();
  }
};

const saveData = async () => {
  if (deletedMarkers.length) {
    await MapsService.deleteMapMarkers(deletedMarkers);
  }

  for (const id of updatedMarkers) {
    const item = markers.find(m => m.id == id);
    if (item) {
      const umm: UpdateMapMarkerDto = {
        name: item.name,
        comment: item.comment,
      };
      await MapsService.updateMapMarker(id, umm);
    }
  }

  const newData = markers.filter(m => m.id > lastId);
  for (const item of newData) {
    const cmm: CreateMapMarkerDto = {
      map_image: item.map_image.id,
      name: item.name,
      comment: item.comment,
      x: item.x,
      y: item.y,
      lat: item.lat,
      lng: item.lng,
    }
    await MapsService.createMapMarker(cmm);
  }

  //await loadData(currentMapImage.value!.id);
  await loadMarkers();
  $toast.success("Изменения сохранены");
}

const loadMarkers = async () => {
  if (currentMapImage.value) {
    markers.length = 0;
    updatedMarkers.length = 0;
    deletedMarkers.length = 0;

    var tags = document.querySelectorAll("*[id^='marker-']");
    tags.forEach(tag => tag.remove());

    const res_markers = await MapsService.getMapMarkers(currentMapImage.value.id);

    if (res_markers && res_markers.length) {
      markers = res_markers;
      markers.forEach(m => createMarkerImage(m));
      lastId = Number(res_markers[res_markers.length - 1].id);
      newId = lastId + 1;
    } else {
      lastId = 0;
      newId = 1;
    }
    isDataChanged.value = false;
  }
};

const zoomClick = (zoom: number) => {
  switch (zoom) {
    case 0:
      scale.value = 100;
      break;
    case -1:
      scale.value = clamp(scale.value - 10, 10, 100);
      break;
    case 1:
      scale.value = clamp(scale.value + 10, 10, 100);
      break;
  }
}

const changeMapImage = () => {
  if (currentMapImage.value && selectedMapImage.value != currentMapImage.value.id) {
    if (isDataChanged.value) {
      confirm.require({
        message: 'У вас остались несохраненные данные. Желаете продолжить?',
        header: 'Предупреждение',
        icon: 'pi pi-times-circle',
        acceptClass: 'p-button-danger',
        accept: () => {
          loadData(selectedMapImage.value);
        },
        reject: () => {
          selectedMapImage.value = currentMapImage.value!.id;
        }
      });
    } else {
      loadData(selectedMapImage.value);
    }
  }
};

const onMove = (event: MouseEvent) => {
  if (mi && img == null) {
    const x = Math.round((event.clientX - mi.x) * 100 / scale.value);
    const y = Math.round((event.clientY - mi.y) * 100 / scale.value);
    clickPoint.value = mapCalculator.calc(x, y);
    clickPoint2.value = mapCalculator.multiCalc(x, y).point;
  }
};

const onClick = (event: MouseEvent) => {
  if (target == null && mi && sc && mw) {
    const x = event.clientX - mi.x;
    const y = event.clientY - mi.y;
    const sx = transformDirect(x);
    const sy = transformDirect(y);
    clickPoint.value = mapCalculator.calc(sx, sy);
    const res = mapCalculator.multiCalc(sx, sy);
    target = res.point;
    rectangle = res.rectangle;
    clickPoint2.value = res.point;

    img = document.createElement("img");
    setTargetImage();
    mw.appendChild(img); // sc

    rect = document.createElement("div");
    setSelectionRectangle();
    mw.appendChild(rect);  // sc

    iname!.focus();
  }
};

const onKeyPress = (event: KeyboardEvent) => {
  if (target) {
    if (event.key == "Escape") {
      event.preventDefault();
      cancelMarker();
    }
    if (event.key == "Enter" || event.key == "NumpadEnter") {
      event.preventDefault();
      saveMarker();
    }
  }
}

const cancelMarker = () => {
  if (target) {
    clickPoint.value = null;
    clickPoint2.value = null;
    target = null;
    rectangle = null;
    img!.remove();
    rect!.remove();
    img = null;
    rect = null;
    blur();
  }
};

const copyPoint = () => {
  if (target) {
    const str = target.lng + ", " + target.lat;
    navigator.clipboard.writeText(str)
      .then(() => {
        $toast.success("Координаты скопированы: " + str);
      })
      .catch(error => {
        $toast.errors(error);
      })
  }
};

const saveMarker = () => {
  if (target && markerName.value != "") {
    const nm: MapMarkerDto = {
      id: newId,
      map_image: currentMapImage.value!,
      name: markerName.value.trim(),
      comment: markerComment.value.trim(),
      x: target.x,
      y: target.y,
      lat: target.lat,
      lng: target.lng,
    };

    markers.push(nm);
    createMarkerImage(nm);
    newId++;
    isDataChanged.value = true;

    target = null;
    rectangle = null;
    clickPoint.value = null;
    clickPoint2.value = null;
    img?.remove();
    img = null;
    rect?.remove();
    rect = null;

    blur();
  }
};

const opSave = (event: Event) => {
  if (opMarker.value) {
    markers[opId] = cloneDeep(opMarker.value);
    if (opMarker.value.id <= lastId && !updatedMarkers.includes(opMarker.value.id)) {
      updatedMarkers.push(opMarker.value.id);
    }
    opMarker.value = undefined;
    isDataChanged.value = true;
    opHide(event);
  }
}

const opDelete = (event: Event) => {
  if (opMarker.value) {
    let markerImage = document.getElementById("marker-" + opMarker.value.id) as HTMLImageElement | null;
    if (markerImage) {
      if (opMarker.value.id <= lastId) {
        deletedMarkers.push(opMarker.value.id);
      }
      markers.splice(opId, 1); //opMarker.value.id);  //markers.delete(opMarker.value.id);
      opMarker.value = undefined;
      isDataChanged.value = true;
      opHide(event);
      markerImage.remove();
    }
  }
};

const opHide = (event: Event) => {
  op.value.hide(event);
};

const blur = () => {
  markerName.value = "";
  markerComment.value = "";
  iname!.blur();
  iextra!.blur();
};

onBeforeRouteLeave((to, from, next) => {
  if (isDataChanged.value) {
    confirm.require({
      message: 'У вас остались несохраненные данные. Желаете выйти?',
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


<style>
#hint {
  position: absolute;
  z-index: 3;
  left: 600px;
  top: 100px;
  border: 1px solid #585858;
  background: #ffffff;
  padding: 4px;
  visibility: hidden;
}

#rect {
  position: absolute;
  z-index: 1;
  border: 1px solid #FF0000;
  background: #FFFF00;
  opacity: 30%;
}

.scroll-wrapper {
  border: 1px solid #edebe9a6;
}

.map-image {
  border: 1px solid #ff0000;
}
</style>