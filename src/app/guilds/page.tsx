'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';
import GuildMemberListModal from '@/components/guild/GuildMemberListModal';
import GuildManageModal from '@/components/guild/GuildManageModal';
import GuildArchiveModal from '@/components/archive/GuildArchiveModal';

// 길드 정보 타입
interface GuildInfo {
  name?: string;
  fullName: string;
  notice: string;
  tag: string;
}

export default function GuildPage() {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);

  // 모달 상태들
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // 길드 정보 가져오기
  const fetchGuildInfo = useCallback(async () => {
    if (user?.guildId) {
      try {
        const data = await apiClient('/guild');
        setGuildInfo(data.payload || data);
      } catch (err) {
        console.error('길드 정보 로드 실패:', err);
      }
    }
  }, [user?.guildId]);

  // 초기 로딩
  useEffect(() => {
    fetchGuildInfo();
  }, [fetchGuildInfo]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  if (!user) return <div className="flex h-screen items-center justify-center">로그인이 필요합니다.</div>;

  // --- [Case A] 길드가 없는 경우 ---
  if (!user.guildId) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-4">
        <h1 className="text-2xl font-bold text-gray-800">아직 소속된 길드가 없습니다.</h1>
        <p className="text-gray-500 -mt-4">길드에 가입하거나 새로운 길드를 만들어보세요!</p>
        <div className="flex gap-4 mt-4">
          <Link href="/guild/create" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-1">
            🏰 길드 창설
          </Link>
          <Link href="/guild/join" className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 shadow-md transition transform hover:-translate-y-1">
            👋 길드 가입
          </Link>
        </div>
      </main>
    );
  }

  // --- [Case B] 길드가 있는 경우 ---
  const userRole = user.guildRole?.toUpperCase() || 'MEMBER';
  const isAdmin = ['MASTER', 'SUBMASTER'].includes(userRole);

  return (
    <main className="p-6 max-w-2xl mx-auto min-h-screen">
      <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100">

        {/* 헤더 섹션 */}
        <div className="mb-8 text-center pb-6 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight flex items-baseline justify-center gap-2">
            {guildInfo ? (
              <>
                <span>{guildInfo.name || guildInfo.fullName.split('#')[0]}</span>
                <span className="text-xl text-gray-400 font-medium">#{guildInfo.tag}</span>
              </>
            ) : (
              '길드 정보를 불러오는 중...'
            )}
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
            <span className="text-sm text-gray-500">내 직책</span>
            <span className={`text-sm font-bold ${userRole === 'MASTER' ? 'text-red-600' :
              userRole === 'SUBMASTER' ? 'text-orange-600' :
                userRole === 'MANAGER' ? 'text-blue-600' : 'text-gray-600'
              }`}>
              {user.guildRole}
            </span>
          </div>
        </div>

        {/* 공지사항 카드 */}
        <div className="bg-blue-50 p-6 rounded-2xl mb-8 relative overflow-hidden min-h-[120px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" /></svg>
          </div>
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            📢 오늘의 공지
          </h3>
          <p className="text-blue-800 text-sm whitespace-pre-wrap leading-relaxed relative z-10">
            {guildInfo?.notice || '등록된 공지사항이 없습니다.\n관리자는 길드 관리 메뉴에서 공지를 등록해보세요!'}
          </p>
        </div>

        {/* 메뉴 영역 */}
        <div className="space-y-4">
          {/* 상단 2개 버튼 (기존) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex flex-col items-center justify-center p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition">
                👥
              </div>
              <span className="font-bold text-gray-700 group-hover:text-blue-700">길드원 목록</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setIsManageModalOpen(true)}
                className="flex flex-col items-center justify-center p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-purple-200 hover:bg-purple-50 transition group"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:rotate-45 transition">
                  ⚙️
                </div>
                <span className="font-bold text-gray-700 group-hover:text-purple-700">길드 관리</span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center p-5 border border-gray-100 rounded-2xl bg-gray-50 opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-2xl mb-3">
                  🔒
                </div>
                <span className="font-bold text-gray-400">관리 메뉴</span>
              </div>
            )}
          </div>

          {/* [New] 하단 길드 아카이브 버튼 (꽉 차게) */}
          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-yellow-200 hover:bg-yellow-50 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition">
                🏰
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-800 text-lg group-hover:text-yellow-700">길드 아카이브</div>
                <div className="text-xs text-gray-500">방어덱 검색 및 공략 공유</div>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-yellow-400 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        </div>
      </div>

      {/* 모달 컴포넌트들 */}
      <GuildMemberListModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />

      {/* 길드 관리 모달 */}
      {guildInfo && (
        <GuildManageModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          initialNotice={guildInfo.notice || ''}
          initialTag={guildInfo.tag || ''}
          onUpdate={fetchGuildInfo}
        />
      )}

      {/* [New] 길드 아카이브 모달 */}
      <GuildArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        userRole={userRole}
      />
    </main>
  );
}