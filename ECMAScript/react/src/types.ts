import { Component, ComponentType, FC } from 'react'

export type AnyTag = string | FC<any> | (new (props: any) => Component)

export type PropsOf<Tag> = Tag extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[Tag]
  : Tag extends ComponentType<infer Props>
  ? Props & JSX.IntrinsicAttributes
  : never
