'use client';

import useSWR from 'swr';
import { apiClient } from '@/lib/apiClient';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/user.type';
import { useEffect } from 'react';


/**
 * AuthProvideer
 * SWR과 Zustand를 연결
 * 앱이 로드될 때 useSWR로 /auth/profile을 호출하고, 그 결과를 useUserStore에 반영
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Zustand 스토어에서 Setter 함수와 isLoading 상태를 가져옴
  const { setUser, setLoading, isLoading } = useUserStore();

  // SWR을 사용해 /auth/profile 엔드포인트에 요청
  // (쿠키가 있으면 유저 정보가, 없으면 401 에러가 반환됨)
  const { data: user, error } = useSWR<User>(
    '/auth/profile', // API 엔드포인트
    async (url) => {
      const res = await apiClient(url);
      // 서버 응답 구조가 { payload: User } 라면 res.payload를 반환해야 합니다.
      return res.payload || res;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // 3. SWR의 결과(data, error)가 변경될 때마다 Zustand 스토어 업데이트
  useEffect(() => {
    if (user) {
      setUser(user); // SWR 성공 -> Zustand에 유저 저장
    }
    if (error) {
      setUser(null); // SWR 실패 (401) -> Zustand 유저 제거
    }

    // SWR 요청이 (성공이든 실패든) 끝나면 로딩 상태 해제
    if (user || error) {
      setLoading(false);
    }

  }, [user, error, setUser, setLoading]);

  // Zustand의 isLoading이 true이면 (최초 로딩 중)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 로딩 완료 후 실제 자식 페이지 렌더링
  return <>{children}</>;
}