/**
 * Utility type for type-guarding the existence of a property.
 * Required<Pick<T, Key>> requires only the specified key, and
 * declaration merging handles the rest.
 */
type RequiredField<T, Key extends keyof T> = T & Required<Pick<T, Key>>;
