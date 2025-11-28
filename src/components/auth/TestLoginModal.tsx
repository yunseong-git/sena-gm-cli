'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useUserStore } from '@/store/useUserStore';

interface Props {
  onClose: () => void;
}

export default function TestLoginModal({ onClose }: Props) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUserStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient('/auth/test/login', {
        method: 'POST',
        body: JSON.stringify({ nickname, password }),
      });

      if (res.payload) {
        setUser(res.payload);
        router.push('/guild'); // 로그인 성공 시 길드 페이지로 이동
      }
    } catch (error: any) {
      alert(error.message || '로그인 실패');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">테스트 로그인</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}