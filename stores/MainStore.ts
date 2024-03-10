import { defineStore } from "pinia";

import { socket } from "@/services/socket";
import type { UserDto, PermissionDto } from "@/services/dto/users.dto";
//import { Investigation } from "@/models/Investigation";

export const useMainStore = defineStore("main", {
  state: () => ({
    config: {
      siteURL: "http://localhost:9000/",
      //ckeditorURL : "http://localhost:8300/ckeditor/ckeditor.js",
      postImagePath: "http://localhost:8055/assets/",
      attachmentsPath: "attachments/",
    },

    isLogged: false,
    isAdmin: false,
    user: <UserDto | undefined>undefined,
    permissions: <PermissionDto[] | undefined>undefined,

    //Inv: new Investigation,
    basis: [
      {
        name: "Устав",
        text: "действующий на основании Устава",
      }
      ,
      {
        name: "Доверенность",
        text: "действующий на основании доверенности №___ от __.__.20__",
      },
      {
        name: "Приказ",
        text: "действующий на основании приказа №___ от __.__.20__",
      },
      {
        name: "Положение",
        text: "действующий на основании положения о ____________  от __.__.20__",
      },

    ],

  }),

  getters: {
  },

  actions: {

    bindWsEvents() {
      const toast = useToast();

      socket.on('connect', function () {
        console.log('*** WS *** Connected');
        toast.add({ severity: 'success', summary: 'WS', detail: "WS connected", life: 5000 });
        socket.emit('events', { test: 'test' }, (response: any) =>
          console.log('*** WS *** events response:', response),
        );
        socket.emit('identity', 12345, (response: any) =>
          console.log('*** WS *** Identity:', response),
        );
        socket.emit('fbs', { num: 777, str: "my str" }, (response: any) =>
          console.log('*** WS *** FBS:', response),
        );
      });

      socket.on('events', function (data) {
        console.log('*** WS *** event', data);
        toast.add({ severity: 'success', summary: 'WS', detail: "WS event: " + data, life: 5000 });
      });

      socket.on('exception', function (data) {
        console.log('*** WS *** event', data);
      });

      socket.on('disconnect', function () {
        console.log('*** WS *** Disconnected');
        toast.add({ severity: 'error', summary: 'WS', detail: "WS disconnected", life: 5000 });

      });
    },

  },
});
