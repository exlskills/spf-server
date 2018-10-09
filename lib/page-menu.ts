export type IPageMenuList = IPageMenuItem[]

export interface IPageMenuItem {
    title: string
    href: string
    children?: IPageMenuList
}
