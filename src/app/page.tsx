'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import TestLoginModal from '@/components/auth/TestLoginModal';
import TestRegisterModal from '@/components/auth/TestRegisterModal';

export default function Home() {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  // 로그인 모달 표시 여부 제어
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // 1. 로딩이 끝났는데 유저 정보가 있다면 -> 길드 페이지로 강제 이동
    if (!isLoading && user) {
      router.replace('/guild');
    }
  }, [user, isLoading, router]);

  // 2. 로딩 중이면 스피너 표시 (깜빡임 방지)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg font-semibold text-gray-500">인증 정보 확인 중...</div>
      </div>
    );
  }

  // 3. 이미 로그인 된 상태라면 리다이렉트 중이므로 빈 화면
  if (user) {
    return null;
  }

  // 4. 비로그인 상태 -> 로그인/회원가입 랜딩 페이지 보여주기
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center mb-12 max-w-md">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-600 tracking-tight">Sena GM</h1>
        <p className="text-gray-600 text-lg break-keep">
          세븐나이츠 길드 관리자를 위한 통합 솔루션.<br />
          지금 바로 시작해보세요.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* 구글 로그인 버튼 */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition shadow-sm"
        >
          {/* 구글 아이콘 SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google로 계속하기
        </a>

        {/* 테스트 로그인 버튼 */}
        <button
          onClick={() => setShowLogin(true)}
          className="px-6 py-3.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-bold transition shadow-lg"
        >
          테스트 계정으로 로그인
        </button>

        {/* [추가됨] 테스트 회원가입 버튼 */}
        <button
          onClick={() => setShowRegister(true)}
          className="px-6 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition shadow-lg"
        >
          테스트 회원가입
        </button>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        © 2024 SenaGM. All rights reserved.
      </div>

      {/* 테스트 로그인 모달 */}
      {showLogin && (
        <TestLoginModal onClose={() => setShowLogin(false)} />
      )}

      {/* [추가됨] 테스트 회원가입 모달 */}
      {showRegister && (
        <TestRegisterModal onClose={() => setShowRegister(false)} />
      )}
    </main>
  );
}