'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

// 간단한 길드 정보 타입
interface GuildInfo {
  fullName: string;
  notice: string;
}

export default function GuildPage() {
  const { user, isLoading } = useUserStore();
  const router = useRouter();
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);

  // 1. 길드 정보 조회 (길드가 있는 경우만)
  useEffect(() => {
    if (user?.guildId) {
      apiClient('/guild') // GET /guild (MemberController)
        .then((data) => setGuildInfo(data))
        .catch((err) => console.error(err));
    }
  }, [user?.guildId]);

  if (isLoading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;

  // --- [Case A] 길드가 없는 경우 ---
  if (!user.guildId) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
        <h1 className="text-2xl font-bold">아직 소속된 길드가 없습니다.</h1>
        <div className="flex gap-4">
          <Link
            href="/guild/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            길드 창설
          </Link>
          <Link
            href="/guild/join"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
          >
            길드 가입
          </Link>
        </div>
      </main>
    );
  }

  // --- [Case B] 길드가 있는 경우 (라운지) ---
  return (
    <main className="p-6 max-w-lg mx-auto">
      <div className="bg-white shadow rounded-lg p-6 border">
        <h1 className="text-3xl font-bold mb-2">{guildInfo?.fullName || '길드 이름 로딩 중...'}</h1>
        <p className="text-gray-500 mb-4">
          내 직책: <span className="font-semibold text-blue-600 uppercase">{user.guildRole}</span>
        </p>

        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <h3 className="font-bold mb-1">📢 공지사항</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {guildInfo?.notice || '등록된 공지사항이 없습니다.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/guild/members" className="p-3 text-center border rounded hover:bg-gray-50">
            👥 길드원 목록
          </Link>
          {/* 관리자만 보이는 메뉴 */}
          {(user.guildRole === 'master' || user.guildRole === 'submaster') && (
            <Link href="/guild/manage" className="p-3 text-center border rounded hover:bg-gray-50 text-blue-600 font-semibold">
              ⚙️ 길드 관리
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}