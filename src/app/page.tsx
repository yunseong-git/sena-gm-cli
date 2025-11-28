'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TestLoginModal from '@/components/auth/TestLoginModal';
import TestRegisterModal from '@/components/auth/TestRegisterModal';

export default function LoginPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* 타이틀 */}
      <h1 className="text-4xl font-bold mb-12 text-gray-800">Guild Manager</h1>

      <div className="w-full max-w-xs flex flex-col gap-4">
        {/* 구글 로그인 버튼 (디자인만) */}
        <button
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          onClick={() => alert('준비 중입니다.')}
        >
          {/* 구글 아이콘 (SVG) */}
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
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google 계정으로 로그인
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">Test Options</span>
          </div>
        </div>

        {/* 테스트 로그인 버튼 */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          테스트 로그인
        </button>

        {/* 테스트 회원가입 버튼 */}
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          테스트 회원가입
        </button>
      </div>

      {/* 모달 컴포넌트들 */}
      {isLoginModalOpen && (
        <TestLoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
      {isRegisterModalOpen && (
        <TestRegisterModal onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </main>
  );
}