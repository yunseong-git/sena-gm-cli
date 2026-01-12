'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';

// useSearchParams를 쓰려면 Suspense로 감싸야 합니다.
function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useUserStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. URL에 코드가 있는지 확인
    const urlCode = searchParams.get('code');

    if (urlCode) {
      if (!user) {
        // 2-A. 비로그인 상태 -> 코드 저장 후 메인(로그인)으로 이동
        localStorage.setItem('pending_invite_code', urlCode);
        alert('로그인이 필요합니다. 로그인 후 자동으로 가입 화면으로 이동합니다.');
        router.push('/');
      } else {
        // 2-B. 로그인 상태 -> 코드 자동 입력
        setCode(urlCode);
      }
    } else if (user) {
      // 3. URL 코드는 없는데, 로컬스토리지에 저장된 코드가 있는지 확인 (로그인 직후 상황)
      const pendingCode = localStorage.getItem('pending_invite_code');
      if (pendingCode) {
        setCode(pendingCode);
        localStorage.removeItem('pending_invite_code'); // 사용했으니 삭제
      }
    }
  }, [user, searchParams, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 9) {
      alert('올바른 초대 코드를 입력해주세요 (9자리)');
      return;
    }

    setLoading(true);
    try {
      // POST /guild/join
      const res = await apiClient('/guild/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      // 가입 성공 시 백엔드가 새 토큰 payload를 줌 -> 상태 업데이트
      if (res.payload) {
        setUser(res.payload);
        alert(`가입을 환영합니다!`);
        router.push('/guilds'); // 길드 페이지로 이동
      }
    } catch (error: any) {
      // 409 Conflict (이미 가입됨 등)
      alert(error.message || '가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">길드 가입</h1>
          <p className="text-gray-500 mt-2">공유받은 초대 코드를 입력하세요.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              초대 코드
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} // 대문자 자동 변환
              placeholder="XXXXXXXXX (9자리)"
              maxLength={9}
              className="w-full p-4 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 9}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-md ${loading || code.length !== 9
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {loading ? '가입 처리 중...' : '가입하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinContent />
    </Suspense>
  );
}