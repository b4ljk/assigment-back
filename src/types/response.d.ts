export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

export interface AccessToken {
  sub: number;
  iat: number;
  exp: number;
  type: string;
}
