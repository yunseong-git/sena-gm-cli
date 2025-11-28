// 백엔드 API의 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * SWR 및 일반 API 호출을 위한 Fetcher Wrapper
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    // 쿠키 전송 (httpOnly 쿠키 포함)
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    // 4xx, 5xx 에러 발생 시 처리
    // 에러 응답도 JSON이 아닐 수 있으므로 안전하게 처리
    const errorText = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = {};
    }

    const error = new Error(
      Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || 'API 요청에 실패했습니다.',
    );
    // 필요하다면 에러 객체에 상태 코드 추가
    // (error as any).status = res.status;
    throw error;
  }

  // 204 No Content (DELETE 등)는 바로 null 반환
  if (res.status === 204) {
    return null;
  }

  // 성공 시 JSON 반환 처리
  // 상태코드가 200이라도 body가 비어있을 수 있음 (예: 로그아웃)
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    // JSON 파싱 실패 시 (일반 텍스트 반환 등) 텍스트 자체를 반환하거나 null 처리
    console.warn('JSON parsing failed, returning null');
    return null;
  }
};