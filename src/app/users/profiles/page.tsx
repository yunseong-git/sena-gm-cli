'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { apiClient } from '@/lib/apiClient';

// 백엔드 UserProfileResponseDto 대응 인터페이스
interface UserProfile {
  nickname: string;
  tag: string;
  email: string;
}

export default function UserProfilePage() {
  const { user, setUser } = useUserStore();
  const router = useRouter();

  // --- States ---
  const [profile, setProfile] = useState<UserProfile | null>(null); // [New] 서버에서 가져온 유저 정보
  const [nickname, setNickname] = useState('');
  const [tag, setTag] = useState('');

  // 태그 상태 관리
  const [isTagChecked, setIsTagChecked] = useState(false);
  const [isTagAvailable, setIsTagAvailable] = useState(false);

  // 로딩 상태
  const [isLoadingNick, setIsLoadingNick] = useState(false);
  const [isLoadingTag, setIsLoadingTag] = useState(false);

  // 초기값 설정 (백엔드 호출)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await apiClient('/user');
        setProfile(data);
        setNickname(data.nickname);
        setTag(data.tag);

        // 현재 내 태그는 이미 검증된 태그
        if (data.tag) {
          setIsTagChecked(true);
          setIsTagAvailable(true);
        }
      } catch (error) {
        console.error('유저 정보 로드 실패:', error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // 유저 정보 변경 후 재로그인 처리 함수
  const handleSuccessAndLogout = (message: string) => {
    alert(`${message}\n정보 갱신을 위해 다시 로그인해주세요.`);
    setUser(null);
    router.push('/');
  };

  // --- Handlers ---

  // 1. 닉네임 변경
  const handleUpdateNickname = async () => {
    if (!nickname || nickname.length < 2 || nickname.length > 10) {
      alert('닉네임은 2~10자여야 합니다.');
      return;
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
      alert('특수문자는 사용할 수 없습니다.');
      return;
    }
    // [변경] user.nickname 대신 profile.nickname 사용
    if (profile && nickname === profile.nickname) {
      alert('현재 닉네임과 동일합니다.');
      return;
    }

    setIsLoadingNick(true);
    try {
      await apiClient('/user/nickname', {
        method: 'PATCH',
        body: JSON.stringify({ nickname }),
      });
      handleSuccessAndLogout('닉네임이 변경되었습니다.');
    } catch (error: any) {
      alert(error.message || '닉네임 변경 실패');
    } finally {
      setIsLoadingNick(false);
    }
  };

  // 2. 태그 중복 확인
  const handleCheckTag = async () => {
    if (!tag || tag.length < 1 || tag.length > 8) {
      alert('태그는 1~8자여야 합니다.');
      return;
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(tag)) {
      alert('특수문자는 사용할 수 없습니다.');
      return;
    }

    try {
      await apiClient('/user/check-tag', {
        method: 'POST',
        body: JSON.stringify({ tag }),
      });
      setIsTagChecked(true);
      setIsTagAvailable(true);
      alert('사용 가능한 태그입니다.');
    } catch (error: any) {
      setIsTagChecked(true);
      setIsTagAvailable(false);
      alert(error.message || '이미 사용 중인 태그입니다.');
    }
  };

  // 3. 태그 변경
  const handleUpdateTag = async () => {
    if (!isTagChecked || !isTagAvailable) return;

    setIsLoadingTag(true);
    try {
      await apiClient('/user/tag', {
        method: 'PATCH',
        body: JSON.stringify({ tag }),
      });
      handleSuccessAndLogout('태그가 변경되었습니다.');
    } catch (error: any) {
      alert(error.message || '태그 변경 실패');
    } finally {
      setIsLoadingTag(false);
    }
  };

  // 태그 입력 변경 시 상태 초기화
  const handleChangeTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTag(val);
    // [변경] user.tag 대신 profile.tag 사용
    if (profile && val === profile.tag) {
      setIsTagChecked(true);
      setIsTagAvailable(true);
    } else {
      setIsTagChecked(false);
      setIsTagAvailable(false);
    }
  };

  // 프로필 데이터 로딩 중이면 로딩 표시
  if (!user || !profile) return <div className="flex h-screen items-center justify-center">로딩 중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* 헤더 섹션 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">내 정보 관리</h1>
          <p className="text-gray-500 mt-2">닉네임과 태그를 변경할 수 있습니다.</p>
        </div>

        {/* 현재 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
          {/* [변경] profile 데이터 사용 */}
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
            {profile.nickname.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {profile.nickname} <span className="text-gray-400 font-normal text-lg">#{profile.tag}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
        </div>

        {/* 닉네임 변경 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📝 닉네임 변경
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="새 닉네임 (2~10자)"
              className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              maxLength={10}
            />
            <button
              onClick={handleUpdateNickname}
              disabled={isLoadingNick || (profile && nickname === profile.nickname)}
              className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition ${isLoadingNick || (profile && nickname === profile.nickname)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {isLoadingNick ? '변경 중...' : '변경하기'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 ml-1">
            * 변경 시 재로그인이 필요합니다.
          </p>
        </div>

        {/* 태그 변경 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏷️ 태그 변경
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tag}
                onChange={handleChangeTagInput}
                placeholder="새 태그 (1~8자)"
                className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                maxLength={8}
              />
              <button
                onClick={handleCheckTag}
                disabled={profile && tag === profile.tag}
                className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition ${profile && tag === profile.tag
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isTagChecked && isTagAvailable
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
              >
                {profile && tag === profile.tag ? '사용중' : isTagChecked && isTagAvailable ? '확인완료' : '중복확인'}
              </button>
            </div>

            <button
              onClick={handleUpdateTag}
              disabled={isLoadingTag || !isTagChecked || !isTagAvailable || (profile && tag === profile.tag)}
              className={`w-full py-3 rounded-xl font-bold text-sm transition ${isLoadingTag || !isTagChecked || !isTagAvailable || (profile && tag === profile.tag)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              {isLoadingTag ? '변경 처리 중...' : '태그 변경하기'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 ml-1">
            * 중복 확인 후 변경 가능하며, 변경 시 재로그인이 필요합니다.
          </p>
        </div>

      </div>
    </main>
  );
}