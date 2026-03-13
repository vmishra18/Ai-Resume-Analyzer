export interface CreateAnalysisSessionResponse {
  sessionId: string;
  redirectTo: string;
  status: "PENDING";
  title: string;
}

export interface UploadErrorResponse {
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
