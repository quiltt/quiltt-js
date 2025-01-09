import type { ComponentType, JSX } from 'react'

export type PropsOf<Tag> = Tag extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[Tag]
  : Tag extends ComponentType<infer Props>
    ? Props & JSX.IntrinsicAttributes
    : never
