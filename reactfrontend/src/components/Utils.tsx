import * as forge from 'node-forge';

export function createHashKeyFromMenuItems(menuItems: Array< any >) : string {
  let items: Array<string> = menuItems.map(
      (item: any) => {
        return item.text
      }
    )
  let md = forge.md.md5.create();
  items.forEach(element => {
    md.update(element);
  });
  return md.digest().toHex();
}

export interface Styles {
  white: any,
  black: any,
  topBarHeight: number,
  footerMenuHeight: number,
  showFooterMenuText: boolean,
  showSidebar: boolean,
  sidebarWidth: number,
  sidebarCollapsed: boolean
}

export interface MenuItem {
  icon: string,
  text: string
}

export default createHashKeyFromMenuItems;
