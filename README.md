# 몰입캠프 2주차 프로젝트  "Wordicle"

gemini를 기반으로 한 기사 생성 후, 해당 기사를 공부하며 모르는 단어를 추가, 해당 기사를 보며 단어 조회 및 단어 기반 퀴즈 기능까지 구현

### 개발기간: 24.07.03~24.07.10(몰입캠프 2주차)

# [1] 개발 환경

- 개발 언어 : Front - React Back - Node.js-express DataBase - MySQL
- 버전 및 이슈관리 : Github
- 협업 툴 : Github, Notion
- 디자인 : Figma

# [2] About the project (프로젝트 기능)
이 웹페이지는 크게 로그인 화면, 메인화면, 카테고리 선택화면, 기사 조회화면, 퀴즈화면 5개로 구분되어 있음.

### 화면1 - 로그인 화면
- 로그인 되지 않은 상태에 접속하면 들어가지는 화면
- 로그인 버튼 하나만 존재하며, 해당 버튼을 통해 카카오 로그인을 하면 Main화면으로 넘어가게됨
- 신규 유저나 로그아웃을 하지않으면 해당 페이지로는 연결되지 않음

### 화면 2 - 메인 화면
- 나머지 페이지로 연결되기 위한 버튼들과 여러가지 UI들이 있는 메인 페이지
- 크게 카테고리를 설정하는 페이지로 이동하는 버튼
- 새로운 기사를 생성하고 해당 기사를 공부하는 New_article 버튼류 (선호하는 카테고리 4개를 지정하여 만들어짐)
- 최근에 읽은 4개의 기사를 보거나, 해당 기사들에 있는 단어장을 기반으로 하는 퀴즈를 볼수있는 버튼
- 내가 읽은 모든 기사를 조회할수 있는 화면으로 이동하는 버튼 존재

- 마지막으로 내가 읽었던 모든 기사 수와 저장되어있는 모든 단어를 보여주는 화면 존재
### 화면 3 - 카테고리 선택 화면
- 8개 카테고리중 4개 카테고리를 선택하여 저장하면, 해당 user의 category에 저장하는 화면임
- 해당 카테고리는 기사 생성시 선택할수있는 범위에 해당함. 현재는 8개이나, 기본적으로 gemini기반이기에 카테고리 개수는 무한히 확장 가능

### 화면 4 - 기사 조회 화면
- 카테고리로 혹은 random으로 기사를 생성하면, gemini가 기사를 생성, 해당 기사를 화면에 띄워줌
- 해당 기사를 공부하면서 우측에 있는 단어장에 모르는 단어를 입력하면 해당 단어를 단어장에 저장하고, 해당 단어의 해석을 띄워줌 (gemini이용)
- 추가로 해당 기능으로 짧은 문장, 숙어등도 가능함 (다만 퀴즈풀때 효율적이지 않으므로 셀프 삭제 혹은 패스가 필요함)

### 화면 5 - 퀴즈 화면
- 특정 기사의 단어장을 기반으로 퀴즈를 볼 수 있으며, 버튼을 통해 영어를 가릴지, 한글을 가릴지 선택할 수 있음
- 채점 알고리즘의 부재로(유사한 답변을 전부 오답처리할수는 없으니까...) 직접 입력후 답을 볼수 있게 설정, 해당 답을 바탕으로 정답 오답을 표시하면 다음문제로 넘어감
- 마지막 문제가 되면 어떤 단어를 맞췄는지, 어떤 단어를 틀렸는지 확인 가능

# [3] 주요 사용 technology (배운 내용)
- kakao-login 구현
- gemini api 사용법
- aws 연동 및 aws 내에 mysql 설치 방법
- mysql db 사용법 및 query 사용법


# [4] 구동 방법
- git clone을 통해 해당 파일들을 다운 받고, 저장되어있는 mysql파일을 mysql에 넣어 해당 데이터베이스를 연결 (db.js의 db경로 수정)
- gemini api의 api key 본인 key로 수정 (gemini_ai 파일 API_KEY 수정)
- kakao-login의 client_id, redirecturi등 수정 (redirect uri는 그대로 만들경우 상관없음, 로그인 로그아웃 둘다 수정 필요, client_id는 본인 앱 기반으로 넣을것)

- aws나 다른 서버를 쓰지 않을경우 constant.js 의 backend_ip를 localhost로 교체, 사용할경우 해당 서버의 ip를 넣을것

- backend 의 경우 node index.js, 프론트의 경우 npm start로 실행


# [5] 개발 멤버

## 박지훈 <https://github.com/aksnd> - Backend Developer, Frontend support
- kakao login 구현, gemini api 연결, aws 연결, MySQL DB 및 API 작성, frontend 기능 구현 지원
## 주서현 <https://github.com/seohyj> -Frontend Developer, Designer
- 프론트 엔드 디자인, UI구성, 기능 구현, api 구현


# [6] 참고 자료
- Node.js - Express 사용법
- <https://hyojun.tistory.com/entry/Nodejs-Nodejs-express%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EC%84%9C%EB%B2%84-%EA%B5%AC%EC%84%B1-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0#google_vignette>
- kakao-login 구현
- <https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api> 공식문서와 chatgpt 이용
- gemini api 사용법
- <https://ai.google.dev/gemini-api/docs/get-started/tutorial?lang=node&hl=ko> 공식문서와 chatgpt이용
- aws 연동 및 aws 사용법
- <https://velog.io/@nara7875/AWS-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0-VScode%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%B4-Node.js-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B01>vscode로 접속까지 유용
-  <https://hanjungyo.tistory.com/48> aws 내에 node.js와 npm등 설치 방법 유용 (db관련은 다른 링크에서...)
- <https://woojin.tistory.com/37> aws서버내에 mysql 설치 후 이용 - 외부접속등
- <https://ittrue.tistory.com/297> 프리티어 메모리 부족 이슈 -swap memory 이용

