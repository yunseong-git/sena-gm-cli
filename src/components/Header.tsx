'use client';

import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, setUser } = useUserStore();
  const router = useRouter();

  // 로그인하지 않은 유저에게는 헤더를 보여주지 않음
  if (!user) return null;

  const handleLogout = async () => {
    // 확인차 물어보기 (선택사항)
    if (!confirm('정말 로그아웃 하시겠습니까?')) return;

    try {
      // 1. 백엔드 로그아웃 API 호출 (쿠키 삭제)
      await apiClient('/auth/logout', { method: 'DELETE' });

      // 2. 클라이언트 상태 초기화
      setUser(null);

      // 3. 홈으로 이동 (홈에서 다시 로그인 화면이 보임)
      router.push('/');
      router.refresh(); // 데이터 갱신을 위해 리프레시
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="font-bold text-xl text-blue-600 cursor-pointer" onClick={() => router.push('/guild')}>
        SenaGM <span className="text-xs text-gray-500 font-normal text-black">Manager</span>
      </div>

      <div className="flex gap-3 items-center">
        <span className="text-sm mr-2">
          <span className="font-bold">환영합니다</span>
        </span>

        {/* 내 정보 변경 (UI만 존재) */}
        <button
          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          onClick={() => alert('아직 준비중인 기능입니다!')}
        >
          내 정보
        </button>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}