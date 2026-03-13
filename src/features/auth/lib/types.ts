export interface AuthSuccessResponse {
  redirectTo: string;
}

export interface AuthErrorResponse {
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
