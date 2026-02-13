export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}
