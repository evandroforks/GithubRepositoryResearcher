import * as forge from 'node-forge';

export function createHashKeyFromMenuItems(menuItems: Array< any >) : string {
  let items: Array<string> = menuItems.map(
      (item: any) => {
        return item.text.props.children
      }
    )
  let md = forge.md.md5.create();
  items.forEach(element => {
    md.update(element);
  });
  return md.digest().toHex();
}

export function getEnvironmentVariable(variable_name: string, default_value: string) {
  let value_get: any = process.env[variable_name];
  if (value_get === undefined) {
    value_get = default_value;
  }
  // console.log('process.env', variable_name, value_get)
  return value_get;
}

// https://stackoverflow.com/questions/57997595/how-to-extend-the-built-in-array-type-on-typescript
export function extendArray(first: Array<any>, other: Array<any>) {
  other.forEach(function (element: any) { first.push(element) }, other);
}

export function prettyPrintError(error: any) {
  let message: string = `
      name: ${error.name}
      message: ${error.message}
      at: ${error.at}
      text: ${error.text}
    `;
  console.log(error, message);
  return message;
}

export interface Styles {
  white: any,
  black: any,
  topBarHeight: number,
  footerMenuHeight: number,
  windowWidth: number,
  isTitleCollapsed: boolean,
  showFooterMenuText: boolean,
  showSidebar: boolean,
  sidebarWidth: number,
  sidebarCollapsed: boolean,
}

export interface MenuItem {
  icon: any,
  text: any,
}

export interface Repository{
  nameWithOwner: string,
  description: string,
  stargazers: { totalCount: number },
}

export interface RepositoryResults{
  rateLimit: string,
  lastItemId: string | null,
  hasMorePages: boolean,
  repositoryCount: number,
  repositories: Array<Repository>,
}

export default createHashKeyFromMenuItems;
