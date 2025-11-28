'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useUserStore } from '@/store/useUserStore';

export default function JoinGuildPage() {
  const [code, setCode] = useState('');
  const { setUser } = useUserStore();
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await apiClient('/guild/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      // [핵심] 가입 후 상태 갱신
      if (res.payload) {
        setUser(res.payload);
      }

      alert('길드 가입 성공! 환영합니다.');
      router.replace('/guild');

    } catch (error: any) {
      alert(error.message || '가입 실패 (코드를 확인해주세요)');
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto flex flex-col justify-center min-h-[50vh]">
      <h1 className="text-2xl font-bold mb-6 text-center">길드 가입</h1>
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-semibold">초대 코드</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())} // 대문자 자동 변환
            className="w-full border p-3 rounded text-center text-lg tracking-widest uppercase"
            placeholder="X7Z9A1"
            required minLength={6} maxLength={9}
          />
        </div>
        <button className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
          가입 신청
        </button>
      </form>
    </main>
  );
}