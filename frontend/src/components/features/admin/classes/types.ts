export type ClassModalMode = 'none' | 'create' | 'edit' | 'delete' | 'details'

export interface ClassHashState {
  mode: ClassModalMode
  classId?: number
}
