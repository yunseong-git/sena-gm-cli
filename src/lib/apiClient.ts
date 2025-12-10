// lib/apiClient.ts

// 백엔드 API의 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * SWR 및 일반 API 호출을 위한 Fetcher Wrapper
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // 1. 첫 번째 요청 시도
  let res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // 2. 에러 처리 (401인 경우 토큰 갱신 시도)
  if (!res.ok) {
    if (res.status === 401) {
      // 401 에러 발생 시 Refresh Token으로 갱신 시도
      try {
        // 이미 갱신 요청 중이면 중복 요청 방지 (선택 사항이지만 권장)
        // 여기서는 간단하게 바로 갱신 요청
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'PATCH', // 백엔드 AuthController에 @Patch('refresh')로 정의됨
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshRes.ok) {
          // 토큰 갱신 성공! 원래 요청 재시도
          res = await fetch(url, {
            ...options,
            credentials: 'include', // 갱신된 쿠키 사용
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
        } else {
          // 토큰 갱신 실패 (Refresh Token도 만료됨) -> 로그아웃 처리
          throw new Error('Session expired');
        }
      } catch (refreshError) {
        // 갱신 실패 시 브라우저인 경우 메인으로 이동
        if (typeof window !== 'undefined') {
          // [수정] 무한 루프 방지 & 회원가입 페이지에서는 튕기지 않음
          const path = window.location.pathname;
          if (path !== '/' && path !== '/register') { // '/register' 추가
            window.location.href = '/';
          }
        }
        // 에러를 던져서 호출부에서 알 수 있게 함 (또는 null 반환)
        // throw refreshError; 
        // 401 에러를 그대로 던져서 SWR 등이 처리하게 하거나, null 반환
        return null;
      }
    }

    // 401이 아니거나 재시도 후에도 실패한 경우 에러 처리
    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP Error ${res.status}` };
      }

      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || 'API 요청에 실패했습니다.';

      const error = new Error(errorMessage);
      throw error;
    }
  }

  // 204 No Content (DELETE 등)는 바로 null 반환
  if (res.status === 204) {
    return null;
  }

  // 성공 시 JSON 반환 처리
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    console.warn('JSON parsing failed, returning null');
    return null;
  }
};