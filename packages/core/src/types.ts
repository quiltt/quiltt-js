/** Utility types to extend default TS utilities */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type Mutable<Type> = { -readonly [Key in keyof Type]: Type[Key] }
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T
export type DeepReadonly<T> = T extends object ? { [P in keyof T]: DeepReadonly<T[P]> } : T
declare global {
  interface Window {
    expo: any
  }
}
