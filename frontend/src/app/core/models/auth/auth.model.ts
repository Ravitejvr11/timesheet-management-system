export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}

export interface JwtPayload {
  userId: string;
  userName: string;
  role: string;
  exp: number;
}
