
<상태관리 흐름>
1. Zustand (useUserStore): user 객체와 isLoading 상태를 전역으로 관리함

2. SWR (useSWR): 앱이 로드될 때 GET /auth/profile API를 호출하여 실제 인증 상태를 확인함

3. AuthProvider: SWR의 요청이 끝나면 그 결과를 Zustand 스토어에 동기화시킴

4. Login (Header): 로그인 버튼을 누르면 POST /auth/login을 호출하고, 성공 시 Zustand 스토어와 SWR 캐시를 모두 업데이트함