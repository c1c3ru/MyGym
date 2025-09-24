// 🛠️ Utilitários de tipos
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : any;

// Tipos para Zustand stores
export interface StoreActions<T> {
  reset: () => void;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
}

// Tipos para React Native
export interface ScreenProps {
  navigation: any;
  route: any;
}

export interface ComponentProps {
  style?: any;
  testID?: string;
}