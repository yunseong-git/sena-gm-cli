'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';
import type { User } from '@/types/user.type';
import { useSWRConfig } from 'swr';

/**Zustand를 구독하고, 로그인 API를 호출 */
export function Header() {
  // Zustand 스토어에서 '상태'를 읽어옴
  const user = useUserStore((state) => state.user);
  // 'Setter'도 가져옴
  const setUser = useUserStore((state) => state.setUser);

  const { mutate } = useSWRConfig(); // SWR 캐시 수동 조작
  const [testId, setTestId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;

    try {
      // 로그인 API 호출 (Mutation)
      const loggedInUser = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ testId }),
      });

      // 로그인 성공 시
      // (즉각 반응) Zustand 스토어 상태 변경
      setUser(loggedInUser);
      // (캐시 동기화) SWR 캐시(/auth/profile)를 새 유저 정보로 덮어쓰기
      // (false: 덮어쓴 후 SWR이 API를 재호출하지 않도록 함)
      mutate('/auth/profile', loggedInUser, false);

      setTestId(''); // 입력창 비우기

    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  // (로그아웃 핸들러도 비슷하게 구현 가능)
  // const handleLogout = async () => {
  //   await apiClient('/auth/logout', { method: 'POST' }); // (백엔드 구현 필요)
  //   setUser(null);
  //   mutate('/auth/profile', null, false);
  // };

  return (
    <header className="w-full max-w-lg mx-auto p-4 flex justify-between items-center">
      <h1 className="text-4xl font-bold">
        <a href="/">SenaDBs</a>
      </h1>
      <div>
        {user ? (
          // 4. Zustand 스토어에 유저가 있으면
          <div>
            <span className="font-semibold">{user.sub}</span>님
            {/* <button onClick={handleLogout} className="ml-2 text-sm text-gray-500">
              로그아웃
            </button> */}
          </div>
        ) : (
          // 5. 유저가 없으면 로그인 폼 표시
          <form onSubmit={handleLogin} className="flex gap-2">
            <input
              type="text"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="테스트 ID"
              className="border rounded px-2 py-1 text-sm w-24"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
            >
              로그인
            </button>
          </form>
        )}
      </div>
    </header>
  );
}