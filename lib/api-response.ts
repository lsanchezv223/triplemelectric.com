type ApiResponseLike = {
  ok?: boolean;
  error?: string;
  details?: string;
  message?: string;
};

export async function readApiResponse<T extends ApiResponseLike>(response: Response): Promise<{
  data: T | null;
  rawText: string;
  errorMessage: string | null;
}> {
  const rawText = await response.text();

  let data: T | null = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText) as T;
    } catch {
      data = null;
    }
  }

  const errorMessage =
    data?.error ||
    data?.details ||
    data?.message ||
    (rawText ? rawText.trim() : "") ||
    null;

  return { data, rawText, errorMessage };
}
