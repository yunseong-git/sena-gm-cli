// lib/apiClient.ts

// 백엔드 API의 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * SWR을 위한 기본 fetcher
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    // 쿠키 전송
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    // 4xx, 5xx 에러 발생 시 SWR의 error 객체로 전달
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(
      Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || 'API 요청에 실패했습니다.',
    );
    //error.status = res.status;
    throw error;
  }

  // 204 No Content (DELETE 등)
  if (res.status === 204) {
    return null;
  }

  // 성공 시 JSON 반환
  return res.json();
};