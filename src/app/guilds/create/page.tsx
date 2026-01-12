'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useUserStore } from '@/store/useUserStore';

export default function CreateGuildPage() {
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const { setUser } = useUserStore(); // 상태 갱신용
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`'${name}' 길드를 창설하시겠습니까?`)) return;

    try {
      // 1. API 호출
      const res = await apiClient('/guild', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      // 2. [핵심] 응답으로 받은 최신 유저 정보(payload)로 상태 갱신
      // (새 토큰은 쿠키에 이미 저장됨)
      if (res.payload) {
        setUser(res.payload);
      }

      alert('길드 창설 완료! 🎉');
      router.replace('/guild'); // 라운지로 이동

    } catch (error: any) {
      alert(error.message || '길드 창설 실패');
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">길드 창설</h1>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-semibold">길드 이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="2~12자 (특수문자 제외)"
            required minLength={2} maxLength={12}
          />
        </div>
        <button className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
          창설하기
        </button>
      </form>
    </main>
  );
}