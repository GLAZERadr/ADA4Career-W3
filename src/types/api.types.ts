export interface ApiReturn<T> {
  data: T;
  message: string;
  code: number;
}

export interface ApiError {
  message: string;
  data: string;
  code: number;
}

export type UninterceptedApiError = {
  message: string | Record<string, string[]>;
};
