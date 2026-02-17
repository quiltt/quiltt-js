// ============================================================================
// TypeScript Utility Types
// ============================================================================
// Extended utility types to complement TypeScript's built-in utilities.
// These are commonly used throughout the Quiltt SDK for type safety.
// ============================================================================

/** Represents a value that can be T or null */
export type Maybe<T> = T | null

/** Input variant of Maybe for function parameters */
export type InputMaybe<T> = Maybe<T>

/** Ensures all properties of T are exactly their declared types */
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }

/** Makes specific keys K optional and nullable in type T */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }

/** Makes specific keys K nullable (but still required) in type T */
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }

/** Makes all properties of T nullable */
export type Nullable<T> = { [K in keyof T]: T[K] | null }

/** Removes readonly modifier from all properties of Type */
export type Mutable<Type> = { -readonly [Key in keyof Type]: Type[Key] }

/** Recursively makes all properties of T optional */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T

/** Recursively makes all properties of T readonly */
export type DeepReadonly<T> = T extends object ? { [P in keyof T]: DeepReadonly<T[P]> } : T
