export interface RegisterAndLoginResponse {
  email: string;
  role: { role: string }[];
  token: string;
}
