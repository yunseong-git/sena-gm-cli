// 백엔드 API의 기본 URL (환경 변수로 관리하는 것이 좋습니다)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Next.js 14의 fetch를 활용한 기본 페처
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // (나중에 구현) 여기에 accessToken을 헤더에 추가하는 로직
  // const token = localStorage.getItem('accessToken');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    // API 에러 처리
    const errorData = await res.json().catch(() => ({}));
    console.error('API Error:', errorData);

    // --- 수정된 부분 ---
    // message가 배열이면 첫 번째 메시지만 사용하거나, join으로 합칩니다.
    let errorMessage = 'API 요청에 실패했습니다.';
    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message.join(', '); // 또는 errorData.message[0]
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
    throw new Error(errorMessage);
    // --- 여기까지 ---
  }

  // 204 No Content (DELETE 요청 등) 같이 body가 없는 경우
  if (res.status === 204) {
    return null;
  }

  return res.json();
};