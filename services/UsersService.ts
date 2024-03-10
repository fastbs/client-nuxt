import { createUser, readMe } from '@directus/sdk';

import { useMainStore } from "@/stores/MainStore";
import type { Menu2ItemDto, Menu3ItemDto, UserDto, PermissionDto } from "./dto/users.dto";


export default {
  async create(name: string, email: string, password: string): Promise<UserDto> {
    const { $directus } = useNuxtApp();
    const user = {
      first_name: name,
      email: email,
      password: password,
      role: "de636685-39f5-4119-8368-4410df3656ab",
    }
    /*       const result = await $directus.query(`
          mutation createUser($data: create_directus_users_input!)
            {
              create_users_item(data: $data)
                {
                  id
                  first_name
                  email
                  role
                    {
                      id
                      name
                    }
                }
            }
          `, { "data": data }, "system"); */
    const result = await $directus.request(createUser(user));
    console.log("created user: ", result);
    return result as UserDto;
  },

  async login(email: string, password: string) { //}: Promise<UserDto | undefined> {
    const { $directus } = useNuxtApp();
    await $directus.login(email, password);
    await this.checkLogin();

    // admin ery6ggqyrVkUGWyRIHl172MTzzDytWuL
    // zais  Ymh2nvBPlY6C9HivFyZNY-asT4kZ3YKI
    // user  IRvVLC1ymGbzlq78wPMnkRGBU3kZ7tam
    // guest gLEGmZ9JMhiTsr6pnKwgWj_Z5RL9jFsi
  },

  async logout() {
    const { $directus } = useNuxtApp();
    await $directus.logout();
    await this.checkLogin();
  },

  async getSession() {
    const { $directus } = useNuxtApp();
    const result = await $directus.request(readMe({ fields: ['*.*'], }));
    console.log("getSession() result:", result);
    return result as UserDto;
  },

  async getPermissions(): Promise<[PermissionDto] | undefined> {
    const { $directus } = useNuxtApp();

    const result = await $directus.query(`
      query getPermissions{
        permissions(filter: { collection: { _nstarts_with: "directus" } }) {
          id
          collection
          action
        }
      }
    `, undefined, "system");

    console.log("getPermissions result: ", result);
    return result.permissions as [PermissionDto];
  },

  checkPermission(collection: string, action: string): boolean {
    const store = useMainStore();
    if (store.isAdmin) {
      return true;
    }
    if (store.permissions && store.permissions.find(item => item.collection == collection && item.action == action)) {
      return true;
    }
    return false;
  },

  async checkLogin(): Promise<boolean> {
    const store = useMainStore();
    try {
      store.user = await this.getSession() as UserDto;
      store.permissions = await this.getPermissions();
      store.isLogged = true;
      store.isAdmin = store.user.role?.admin_access ?? false;
      return true;
    } catch (err) {
      store.user = undefined;
      store.permissions = [];
      store.isLogged = false;
      store.isAdmin = false;
      window.localStorage.setItem("directus-data", `{"access_token":"gLEGmZ9JMhiTsr6pnKwgWj_Z5RL9jFsi"}`);
      return false;
    }
  },

  async getMenu(): Promise<Menu2ItemDto[] | undefined> {
    const { $directus } = useNuxtApp();
    const store = useMainStore();
    let menu: Menu3ItemDto[] | undefined = undefined;
    let ret: Menu2ItemDto[] | undefined = undefined;
    const filter = store.user?.role?.name == "Administrator" ? "roles: { _contains: \"Administrator\" }" : "";

    try {
      const result = await $directus.query(`
      query getMenu{
        menu(
          filter: { ${filter} }
        )  {
          id
          name
          parent
          route
          icon
        }
      }`);
      menu = result.menu as Menu3ItemDto[];

      if (menu) {
        ret = processMenuItem(null);
        function processMenuItem(parentId: number | null): Menu2ItemDto[] {
          let userMenu: Menu2ItemDto[] = [];
          menu?.forEach((item) => {
            if (item.parent == parentId) {
              let subMenu = processMenuItem(item.id);
              userMenu.push({
                label: item.name,
                to: item.route ? { name: item.route } : undefined,
                route: item.route,
                icon: item.icon,
                items: subMenu.length > 0 ? subMenu : undefined,
              });
            }
          });
          return userMenu;
        }
      }
    } catch (err) {
      console.log("getMenu error: ", err);
    }

    console.log("getMenu result:", ret);
    return ret;
  },

}
