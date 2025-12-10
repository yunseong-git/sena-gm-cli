'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useUserStore } from '@/store/useUserStore';

export default function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useUserStore();
  const router = useRouter();

  // [New] 이미 로그인 된 유저가 접근하면 길드 페이지로 이동
  useEffect(() => {
    if (user) {
      router.replace('/guild');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. 프론트엔드 유효성 검사 (백엔드 DTO 기준)
    if (nickname.length < 2 || nickname.length > 10) {
      setError('닉네임은 2~10글자여야 합니다.');
      return;
    }
    // 특수문자 제외 정규식 (한글, 영문, 숫자만 허용)
    if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
      setError('특수문자나 공백은 사용할 수 없습니다.');
      return;
    }

    setLoading(true);

    try {
      // 2. 가입 요청 (쿠키에 있는 registerToken이 자동으로 전송됨)
      const res = await apiClient('/auth/google/register', {
        method: 'POST',
        body: JSON.stringify({ nickname }),
      });

      // 3. 성공 시 로그인 처리
      if (res.payload) {
        setUser(res.payload);
        alert(`환영합니다, ${nickname}님!`);
        router.push('/guild'); // 길드 페이지(또는 메인)로 이동
      }
    } catch (err: any) {
      // 401 Unauthorized (토큰 만료 등) or 400 Bad Request
      console.error(err);
      setError(err.message || '회원가입 처리에 실패했습니다. 다시 시도해주세요.');

      // 만약 토큰이 만료되었다면 다시 로그인하도록 유도
      if (err.message?.includes('만료')) {
        setTimeout(() => router.push('/'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그인 된 상태라면 화면을 그리지 않음 (깜빡임 방지)
  if (user) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
            👋
          </div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-500 mt-2">
            SenaGM에서 사용할 닉네임을 설정해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="한글, 영문, 숫자 (2~10자)"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-lg"
              maxLength={10}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2 ml-1">
              * 특수문자는 사용할 수 없습니다.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-md ${loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 transform'
              }`}
          >
            {loading ? '가입 처리 중...' : 'SenaGM 시작하기'}
          </button>
        </form>
      </div>
    </main>
  );
}