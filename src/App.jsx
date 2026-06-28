import React, { useState, useEffect, useCallback, useRef } from "react";
import { Check, Flame, RotateCcw, Volume2, ChevronLeft, ChevronRight } from "lucide-react";

// Claude 아티팩트의 window.storage API를 일반 브라우저의 localStorage로 대체한 shim입니다.
// (Vercel/Netlify 등 일반 웹사이트에서는 window.storage가 없기 때문에 필요합니다.)
const storage = {
  get: async (key) => {
    const value = window.localStorage.getItem(key);
    if (value === null) {
      throw new Error("not found");
    }
    return { key, value };
  },
  set: async (key, value) => {
    window.localStorage.setItem(key, value);
    return { key, value };
  },
};

const THEME_BANK = [
  {
    title: "Sports",
    emoji: "⚽",
    sentences: [
      { en: "I play soccer with my friends.", ko: "나는 친구들과 축구를 해.", pron: "아이 플레이 사커 위드 마이 프렌즈." },
      { en: "I like basketball.", ko: "나는 농구를 좋아해.", pron: "아이 라이크 배스킷볼." },
      { en: "Let's play badminton.", ko: "배드민턴 치자.", pron: "렛츠 플레이 배드민턴." },
      { en: "I can run fast.", ko: "나는 빨리 달릴 수 있어.", pron: "아이 캔 런 패스트." },
      { en: "I want to win the game.", ko: "나는 경기에서 이기고 싶어.", pron: "아이 원트 투 윈 더 게임." },
      { en: "He is a good player.", ko: "그는 훌륭한 선수야.", pron: "히 이즈 어 굿 플레이어." },
      { en: "We practice every day.", ko: "우리는 매일 연습해.", pron: "위 프랙티스 에브리 데이." },
      { en: "I scored a goal!", ko: "나는 골을 넣었어!", pron: "아이 스코어드 어 골!" },
      { en: "Let's go to the gym.", ko: "체육관에 가자.", pron: "렛츠 고우 투 더 짐." },
    ],
    wordGroups: [
      [
        { en: "play", ko: "(운동을) 하다", pos: "verb" },
        { en: "soccer", ko: "축구", pos: "noun" },
        { en: "like", ko: "좋아하다", pos: "verb" },
        { en: "basketball", ko: "농구", pos: "noun" },
        { en: "badminton", ko: "배드민턴", pos: "noun" },
      ],
      [
        { en: "run", ko: "달리다", pos: "verb" },
        { en: "fast", ko: "빠른", pos: "adj" },
        { en: "win", ko: "이기다", pos: "verb" },
        { en: "game", ko: "경기", pos: "noun" },
        { en: "player", ko: "선수", pos: "noun" },
      ],
      [
        { en: "practice", ko: "연습하다", pos: "verb" },
        { en: "scored", ko: "득점했다", pos: "verb" },
        { en: "goal", ko: "골", pos: "noun" },
        { en: "go", ko: "가다", pos: "verb" },
        { en: "gym", ko: "체육관", pos: "noun" },
      ],
    ],
  },
  {
    title: "Art",
    emoji: "🎨",
    sentences: [
      { en: "I like to paint.", ko: "나는 그림 그리기를 좋아해.", pron: "아이 라이크 투 페인트." },
      { en: "This is my drawing.", ko: "이건 내 그림이야.", pron: "디스 이즈 마이 드로잉." },
      { en: "Can I use this crayon?", ko: "이 크레용 써도 돼?", pron: "캔 아이 유즈 디스 크레용?" },
      { en: "I made a clay bird.", ko: "나는 찰흙으로 새를 만들었어.", pron: "아이 메이드 어 클레이 버드." },
      { en: "What a beautiful color!", ko: "정말 예쁜 색이다!", pron: "왓 어 뷰티풀 컬러!" },
      { en: "Let's draw together.", ko: "같이 그림 그리자.", pron: "렛츠 드로우 투게더." },
      { en: "I need scissors.", ko: "나는 가위가 필요해.", pron: "아이 니드 시저스." },
      { en: "This is my favorite painting.", ko: "이건 내가 가장 좋아하는 그림이야.", pron: "디스 이즈 마이 페이버릿 페인팅." },
      { en: "I want to be an artist.", ko: "나는 화가가 되고 싶어.", pron: "아이 원트 투 비 언 아티스트." },
    ],
    wordGroups: [
      [
        { en: "like", ko: "좋아하다", pos: "verb" },
        { en: "paint", ko: "그리다", pos: "verb" },
        { en: "drawing", ko: "그림", pos: "noun" },
        { en: "use", ko: "사용하다", pos: "verb" },
        { en: "crayon", ko: "크레용", pos: "noun" },
      ],
      [
        { en: "made", ko: "만들었다", pos: "verb" },
        { en: "clay", ko: "찰흙", pos: "noun" },
        { en: "beautiful", ko: "아름다운", pos: "adj" },
        { en: "color", ko: "색깔", pos: "noun" },
        { en: "draw", ko: "그리다", pos: "verb" },
      ],
      [
        { en: "need", ko: "필요하다", pos: "verb" },
        { en: "scissors", ko: "가위", pos: "noun" },
        { en: "favorite", ko: "가장 좋아하는", pos: "adj" },
        { en: "painting", ko: "그림(작품)", pos: "noun" },
        { en: "artist", ko: "화가", pos: "noun" },
      ],
    ],
  },
  {
    title: "Shopping",
    emoji: "🛒",
    sentences: [
      { en: "Let's go shopping.", ko: "장보러 가자.", pron: "렛츠 고우 샤핑." },
      { en: "How much is this?", ko: "이거 얼마예요?", pron: "하우 머치 이즈 디스?" },
      { en: "I need some milk.", ko: "나는 우유가 필요해.", pron: "아이 니드 썸 밀크." },
      { en: "Can I have this one?", ko: "이거 가질 수 있어요?", pron: "캔 아이 해브 디스 원?" },
      { en: "This is too expensive.", ko: "이건 너무 비싸.", pron: "디스 이즈 투 익스펜시브." },
      { en: "Put it in the cart.", ko: "카트에 넣어줘.", pron: "풋 잇 인 더 카트." },
      { en: "We need eggs and bread.", ko: "우리는 계란과 빵이 필요해.", pron: "위 니드 에그스 앤 브레드." },
      { en: "I have my own money.", ko: "나는 내 돈이 있어.", pron: "아이 해브 마이 오운 머니." },
      { en: "Let's pay at the counter.", ko: "계산대에서 돈을 내자.", pron: "렛츠 페이 앳 더 카운터." },
    ],
    wordGroups: [
      [
        { en: "go", ko: "가다", pos: "verb" },
        { en: "shopping", ko: "쇼핑", pos: "noun" },
        { en: "much", ko: "얼마나", pos: "adj" },
        { en: "need", ko: "필요하다", pos: "verb" },
        { en: "milk", ko: "우유", pos: "noun" },
      ],
      [
        { en: "have", ko: "가지다", pos: "verb" },
        { en: "too", ko: "너무", pos: "adj" },
        { en: "expensive", ko: "비싼", pos: "adj" },
        { en: "put", ko: "넣다", pos: "verb" },
        { en: "cart", ko: "카트", pos: "noun" },
      ],
      [
        { en: "eggs", ko: "계란", pos: "noun" },
        { en: "bread", ko: "빵", pos: "noun" },
        { en: "money", ko: "돈", pos: "noun" },
        { en: "pay", ko: "지불하다", pos: "verb" },
        { en: "counter", ko: "계산대", pos: "noun" },
      ],
    ],
  },
  {
    title: "Music",
    emoji: "🎵",
    sentences: [
      { en: "I like this song.", ko: "나는 이 노래가 좋아.", pron: "아이 라이크 디스 쏭." },
      { en: "Can you play the piano?", ko: "너 피아노 칠 수 있어?", pron: "캔 유 플레이 더 피아노?" },
      { en: "Let's sing together.", ko: "같이 노래 부르자.", pron: "렛츠 씽 투게더." },
      { en: "This music is so fun.", ko: "이 음악은 정말 재미있어.", pron: "디스 뮤직 이즈 쏘 펀." },
      { en: "I have a recorder.", ko: "나는 리코더가 있어.", pron: "아이 해브 어 리코더." },
      { en: "Turn up the volume.", ko: "소리를 키워줘.", pron: "턴 업 더 볼륨." },
      { en: "She sings very well.", ko: "그녀는 노래를 정말 잘해.", pron: "쉬 씽즈 베리 웰." },
      { en: "I want to learn the guitar.", ko: "나는 기타를 배우고 싶어.", pron: "아이 원트 투 런 더 기타." },
      { en: "Let's listen to music.", ko: "음악을 듣자.", pron: "렛츠 리슨 투 뮤직." },
    ],
    wordGroups: [
      [
        { en: "like", ko: "좋아하다", pos: "verb" },
        { en: "song", ko: "노래", pos: "noun" },
        { en: "play", ko: "연주하다", pos: "verb" },
        { en: "piano", ko: "피아노", pos: "noun" },
        { en: "sing", ko: "노래하다", pos: "verb" },
      ],
      [
        { en: "fun", ko: "재미있는", pos: "adj" },
        { en: "recorder", ko: "리코더", pos: "noun" },
        { en: "turn", ko: "조절하다", pos: "verb" },
        { en: "volume", ko: "음량", pos: "noun" },
        { en: "have", ko: "가지다", pos: "verb" },
      ],
      [
        { en: "sings", ko: "노래하다", pos: "verb" },
        { en: "well", ko: "잘", pos: "adj" },
        { en: "learn", ko: "배우다", pos: "verb" },
        { en: "guitar", ko: "기타", pos: "noun" },
        { en: "listen", ko: "듣다", pos: "verb" },
      ],
    ],
  },
  {
    title: "Transportation",
    emoji: "🚌",
    sentences: [
      { en: "I go to school by bus.", ko: "나는 버스로 학교에 가.", pron: "아이 고우 투 스쿨 바이 버스." },
      { en: "The train is fast.", ko: "기차는 빨라.", pron: "더 트레인 이즈 패스트." },
      { en: "Let's take a taxi.", ko: "택시를 타자.", pron: "렛츠 테이크 어 택시." },
      { en: "I like riding my bike.", ko: "나는 자전거 타는 걸 좋아해.", pron: "아이 라이크 라이딩 마이 바이크." },
      { en: "The airplane is in the sky.", ko: "비행기가 하늘에 있어.", pron: "더 에어플레인 이즈 인 더 스카이." },
      { en: "We walked to the park.", ko: "우리는 공원까지 걸어갔어.", pron: "위 워크드 투 더 파크." },
      { en: "The bus stop is over there.", ko: "버스 정류장은 저쪽이야.", pron: "더 버스 스탑 이즈 오버 데어." },
      { en: "I want to ride a ship.", ko: "나는 배를 타고 싶어.", pron: "아이 원트 투 라이드 어 십." },
      { en: "Be careful crossing the street.", ko: "길을 건널 때 조심해.", pron: "비 케어풀 크로싱 더 스트리트." },
    ],
    wordGroups: [
      [
        { en: "go", ko: "가다", pos: "verb" },
        { en: "bus", ko: "버스", pos: "noun" },
        { en: "fast", ko: "빠른", pos: "adj" },
        { en: "take", ko: "타다", pos: "verb" },
        { en: "taxi", ko: "택시", pos: "noun" },
      ],
      [
        { en: "riding", ko: "타는 것", pos: "verb" },
        { en: "bike", ko: "자전거", pos: "noun" },
        { en: "airplane", ko: "비행기", pos: "noun" },
        { en: "sky", ko: "하늘", pos: "noun" },
        { en: "walked", ko: "걸었다", pos: "verb" },
      ],
      [
        { en: "stop", ko: "정류장", pos: "noun" },
        { en: "ride", ko: "타다", pos: "verb" },
        { en: "ship", ko: "배", pos: "noun" },
        { en: "careful", ko: "조심하는", pos: "adj" },
        { en: "crossing", ko: "건너기", pos: "verb" },
      ],
    ],
  },
  {
    title: "Body Parts",
    emoji: "🙌",
    sentences: [
      { en: "I have two hands.", ko: "나는 손이 두 개 있어.", pron: "아이 해브 투 핸즈." },
      { en: "My eyes are brown.", ko: "내 눈은 갈색이야.", pron: "마이 아이즈 아 브라운." },
      { en: "Touch your nose.", ko: "코를 만져 봐.", pron: "터치 유어 노즈." },
      { en: "My head hurts a little.", ko: "머리가 조금 아파.", pron: "마이 헤드 헐츠 어 리틀." },
      { en: "Wash your hands first.", ko: "먼저 손을 씻어.", pron: "워시 유어 핸즈 퍼스트." },
      { en: "I hurt my knee.", ko: "나는 무릎을 다쳤어.", pron: "아이 헐트 마이 니." },
      { en: "Stand on one foot.", ko: "한 발로 서 봐.", pron: "스탠드 온 원 풋." },
      { en: "My ears are big.", ko: "내 귀는 커.", pron: "마이 이어즈 아 빅." },
      { en: "Open your mouth, please.", ko: "입을 벌려 주세요.", pron: "오픈 유어 마우스, 플리즈." },
    ],
    wordGroups: [
      [
        { en: "have", ko: "가지다", pos: "verb" },
        { en: "hands", ko: "손", pos: "noun" },
        { en: "brown", ko: "갈색의", pos: "adj" },
        { en: "touch", ko: "만지다", pos: "verb" },
        { en: "nose", ko: "코", pos: "noun" },
      ],
      [
        { en: "head", ko: "머리", pos: "noun" },
        { en: "hurts", ko: "아프다", pos: "verb" },
        { en: "wash", ko: "씻다", pos: "verb" },
        { en: "hands", ko: "손", pos: "noun" },
        { en: "knee", ko: "무릎", pos: "noun" },
      ],
      [
        { en: "stand", ko: "서다", pos: "verb" },
        { en: "foot", ko: "발", pos: "noun" },
        { en: "big", ko: "큰", pos: "adj" },
        { en: "open", ko: "열다", pos: "verb" },
        { en: "mouth", ko: "입", pos: "noun" },
      ],
    ],
  },
  {
    title: "Clothes",
    emoji: "👕",
    sentences: [
      { en: "I'm wearing a red shirt.", ko: "나는 빨간 셔츠를 입고 있어.", pron: "아임 웨어링 어 레드 셔트." },
      { en: "Put on your shoes.", ko: "신발을 신어.", pron: "풋 온 유어 슈즈." },
      { en: "This hat is so cute.", ko: "이 모자는 정말 귀여워.", pron: "디스 햇 이즈 쏘 큐트." },
      { en: "I need a warm coat.", ko: "나는 따뜻한 코트가 필요해.", pron: "아이 니드 어 웜 코트." },
      { en: "These pants are too big.", ko: "이 바지는 너무 커.", pron: "디즈 팬츠 아 투 빅." },
      { en: "Can I try this on?", ko: "이거 입어 봐도 돼요?", pron: "캔 아이 트라이 디스 온?" },
      { en: "My socks don't match.", ko: "내 양말 짝이 안 맞아.", pron: "마이 삭스 돈트 매치." },
      { en: "I like your dress.", ko: "네 드레스 예쁘다.", pron: "아이 라이크 유어 드레스." },
      { en: "Take off your jacket inside.", ko: "안에서는 재킷을 벗어.", pron: "테이크 오프 유어 재킷 인사이드." },
    ],
    wordGroups: [
      [
        { en: "wearing", ko: "입고 있는", pos: "verb" },
        { en: "shirt", ko: "셔츠", pos: "noun" },
        { en: "shoes", ko: "신발", pos: "noun" },
        { en: "hat", ko: "모자", pos: "noun" },
        { en: "cute", ko: "귀여운", pos: "adj" },
      ],
      [
        { en: "warm", ko: "따뜻한", pos: "adj" },
        { en: "coat", ko: "코트", pos: "noun" },
        { en: "pants", ko: "바지", pos: "noun" },
        { en: "big", ko: "큰", pos: "adj" },
        { en: "try", ko: "입어 보다", pos: "verb" },
      ],
      [
        { en: "socks", ko: "양말", pos: "noun" },
        { en: "match", ko: "어울리다", pos: "verb" },
        { en: "dress", ko: "드레스", pos: "noun" },
        { en: "jacket", ko: "재킷", pos: "noun" },
        { en: "inside", ko: "안에서", pos: "adj" },
      ],
    ],
  },
  {
    title: "Weather",
    emoji: "☀️",
    sentences: [
      { en: "It's sunny today.", ko: "오늘은 맑아.", pron: "잇츠 써니 투데이." },
      { en: "It's raining outside.", ko: "밖에 비가 와.", pron: "잇츠 레이닝 아웃사이드." },
      { en: "It's very cold.", ko: "정말 추워.", pron: "잇츠 베리 콜드." },
      { en: "It's hot in summer.", ko: "여름엔 더워.", pron: "잇츠 핫 인 썸머." },
      { en: "I like snow.", ko: "나는 눈을 좋아해.", pron: "아이 라이크 스노우." },
      { en: "The wind is strong today.", ko: "오늘은 바람이 세.", pron: "더 윈드 이즈 스트롱 투데이." },
      { en: "Take an umbrella.", ko: "우산을 챙겨.", pron: "테이크 언 엄브렐라." },
      { en: "It's a nice day.", ko: "날씨가 좋은 날이야.", pron: "잇츠 어 나이스 데이." },
      { en: "I love spring.", ko: "나는 봄을 좋아해.", pron: "아이 러브 스프링." },
    ],
    wordGroups: [
      [
        { en: "sunny", ko: "화창한", pos: "adj" },
        { en: "raining", ko: "비가 오는", pos: "verb" },
        { en: "outside", ko: "밖에", pos: "adj" },
        { en: "cold", ko: "추운", pos: "adj" },
        { en: "very", ko: "매우", pos: "adj" },
      ],
      [
        { en: "hot", ko: "더운", pos: "adj" },
        { en: "summer", ko: "여름", pos: "noun" },
        { en: "snow", ko: "눈", pos: "noun" },
        { en: "wind", ko: "바람", pos: "noun" },
        { en: "strong", ko: "강한", pos: "adj" },
      ],
      [
        { en: "take", ko: "가져가다", pos: "verb" },
        { en: "umbrella", ko: "우산", pos: "noun" },
        { en: "nice", ko: "좋은", pos: "adj" },
        { en: "love", ko: "좋아하다", pos: "verb" },
        { en: "spring", ko: "봄", pos: "noun" },
      ],
    ],
  },
  {
    title: "Feelings",
    emoji: "😊",
    sentences: [
      { en: "I am happy.", ko: "나는 기뻐.", pron: "아이 앰 해피." },
      { en: "I feel sad today.", ko: "오늘 슬퍼.", pron: "아이 필 새드 투데이." },
      { en: "Don't worry.", ko: "걱정하지 마.", pron: "돈트 워리." },
      { en: "I am so excited!", ko: "나 너무 신나!", pron: "아이 앰 쏘 익사이티드!" },
      { en: "I'm a little tired.", ko: "나 좀 피곤해.", pron: "아임 어 리틀 타이어드." },
      { en: "I'm proud of you.", ko: "네가 자랑스러워.", pron: "아임 프라우드 오브 유." },
      { en: "That makes me angry.", ko: "그건 나를 화나게 해.", pron: "댓 메이크스 미 앵그리." },
      { en: "I'm scared of the dark.", ko: "나는 어둠이 무서워.", pron: "아임 스케어드 오브 더 다크." },
      { en: "Everything is okay.", ko: "다 괜찮아.", pron: "에브리띵 이즈 오케이." },
    ],
    wordGroups: [
      [
        { en: "happy", ko: "기쁜", pos: "adj" },
        { en: "feel", ko: "느끼다", pos: "verb" },
        { en: "sad", ko: "슬픈", pos: "adj" },
        { en: "worry", ko: "걱정하다", pos: "verb" },
        { en: "today", ko: "오늘", pos: "noun" },
      ],
      [
        { en: "excited", ko: "신난", pos: "adj" },
        { en: "tired", ko: "피곤한", pos: "adj" },
        { en: "proud", ko: "자랑스러운", pos: "adj" },
        { en: "little", ko: "조금", pos: "adj" },
        { en: "so", ko: "너무", pos: "adj" },
      ],
      [
        { en: "angry", ko: "화난", pos: "adj" },
        { en: "scared", ko: "무서운", pos: "adj" },
        { en: "dark", ko: "어둠", pos: "noun" },
        { en: "okay", ko: "괜찮은", pos: "adj" },
        { en: "everything", ko: "모든 것", pos: "noun" },
      ],
    ],
  },
  {
    title: "Daily Routine",
    emoji: "⏰",
    sentences: [
      { en: "I wake up at seven.", ko: "나는 일곱 시에 일어나.", pron: "아이 웨이크 업 앳 세븐." },
      { en: "I brush my teeth.", ko: "나는 이를 닦아.", pron: "아이 브러시 마이 티스." },
      { en: "I go to bed early.", ko: "나는 일찍 자러 가.", pron: "아이 고우 투 베드 얼리." },
      { en: "I do my homework.", ko: "나는 숙제를 해.", pron: "아이 두 마이 홈워크." },
      { en: "I wash my hands.", ko: "나는 손을 씻어.", pron: "아이 워시 마이 핸즈." },
      { en: "I clean my room.", ko: "나는 방을 청소해.", pron: "아이 클린 마이 룸." },
      { en: "I watch TV at night.", ko: "나는 밤에 TV를 봐.", pron: "아이 와치 티비 앳 나잇." },
      { en: "I have a great day.", ko: "나는 멋진 하루를 보내.", pron: "아이 해브 어 그레이트 데이." },
      { en: "Thank you for today.", ko: "오늘 고마워.", pron: "땡큐 포 투데이." },
    ],
    wordGroups: [
      [
        { en: "wake", ko: "일어나다", pos: "verb" },
        { en: "brush", ko: "닦다", pos: "verb" },
        { en: "teeth", ko: "치아", pos: "noun" },
        { en: "bed", ko: "침대", pos: "noun" },
        { en: "early", ko: "일찍", pos: "adj" },
      ],
      [
        { en: "homework", ko: "숙제", pos: "noun" },
        { en: "wash", ko: "씻다", pos: "verb" },
        { en: "hands", ko: "손", pos: "noun" },
        { en: "clean", ko: "청소하다", pos: "verb" },
        { en: "room", ko: "방", pos: "noun" },
      ],
      [
        { en: "watch", ko: "보다", pos: "verb" },
        { en: "night", ko: "밤", pos: "noun" },
        { en: "great", ko: "멋진", pos: "adj" },
        { en: "thank", ko: "감사하다", pos: "verb" },
        { en: "today", ko: "오늘", pos: "noun" },
      ],
    ],
  },
];

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const keyToDate = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDaysToKey = (k, delta) => {
  const d = keyToDate(k);
  d.setDate(d.getDate() + delta);
  return toKey(d);
};
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDateLabel = (k) => {
  const d = keyToDate(k);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const POS_STYLES = {
  verb: { bg: "#F4DCDC", text: "#963030" },
  adj: { bg: "#F6E9C9", text: "#7A5A12" },
  noun: { bg: "#DCE7ED", text: "#2F4A5C" },
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gaegu:wght@400;700&family=Nunito:wght@400;700;800;900&family=Nanum+Pen+Script&display=swap');

  .desk-bg { background: #DCE6DA; min-height: 100vh; }

  .notice-page {
    font-family: 'Gaegu', sans-serif;
    background-color: #EFF4EC;
    background-image: repeating-linear-gradient(to bottom, transparent, transparent 37px, rgba(199,214,201,0.55) 38px);
    color: #2F3E46;
  }

  .holes {
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 28px 0;
  }
  .hole {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #EFF4EC;
    box-shadow: inset 0 1px 3px rgba(47,62,70,0.35), 0 0 0 2px #DBE6DC;
  }

  .display-font { font-family: 'Black Han Sans', sans-serif; }
  .sentence-en { font-family: 'Nunito', sans-serif; font-weight: 800; }
  .pencil-note { font-family: 'Nanum Pen Script', cursive; color: #8B8378; }

  .stamp-badge {
    border: 3px double #BD4242;
    color: #BD4242;
    transform: rotate(-10deg);
    background: rgba(255,255,255,0.75);
  }
  @keyframes stampDrop {
    0% { transform: scale(2.2) rotate(-26deg); opacity: 0; }
    60% { transform: scale(0.9) rotate(-6deg); opacity: 1; }
    100% { transform: scale(1) rotate(-10deg); opacity: 1; }
  }
  .stamp-animate { animation: stampDrop 0.55s ease-out; }

  .toast-pop { animation: toastIn 0.25s ease-out; }
  @keyframes toastIn {
    0% { transform: translate(-50%, 12px); opacity: 0; }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }

  @keyframes cardIn {
    0% { opacity: 0; transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }
  .card-anim { animation: cardIn 0.18s ease-out; }

  .send-btn { background: linear-gradient(135deg, #D9684F, #BD4242); }
  .send-btn:active { transform: scale(0.98); }

  .loading-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EFF4EC;
    font-family: 'Gaegu', sans-serif;
    color: #5B6B63;
  }
`;

export default function DailyEnglishNotice() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [toast, setToast] = useState("");
  const [justStamped, setJustStamped] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [view, setView] = useState("words");
  const [wordIndex, setWordIndex] = useState(0);

  const todayKey = toKey(new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let data = null;
      try {
        const res = await storage.get("progress");
        if (res && res.value) {
          data = JSON.parse(res.value);
        }
      } catch (e) {
        data = null;
      }
      if (!data) {
        data = { dayIndex: 0, lastDate: todayKey, stampedDates: [] };
      } else if (data.lastDate !== todayKey) {
        data = { ...data, dayIndex: data.dayIndex + 1, lastDate: todayKey };
      }
      try {
        await storage.set("progress", JSON.stringify(data));
      } catch (e) {
        // 저장 실패해도 화면은 보여준다
      }
      if (!cancelled) {
        setProgress(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text, idx) => {
    if (!("speechSynthesis" in window)) {
      showToast("Audio playback isn't supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang === "en-US") || voices.find((v) => v.lang && v.lang.startsWith("en"));
    if (enVoice) utter.voice = enVoice;
    utter.onstart = () => setSpeakingIndex(idx);
    utter.onend = () => setSpeakingIndex(null);
    utter.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utter);
  };

  const goPrevWord = () => setWordIndex((i) => Math.max(0, i - 1));
  const goNextWord = () => {
    if (isLastWord) {
      setView("sentences");
    } else {
      setWordIndex((i) => Math.min(todayWords.length - 1, i + 1));
    }
  };

  const pointerStartRef = useRef(null);
  const handleCardPointerDown = (e) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleCardPointerUp = (e) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) {
      goNextWord();
    } else {
      goPrevWord();
    }
  };

  const handleSentencesPointerUp = (e) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (dx > 40 && Math.abs(dx) > Math.abs(dy)) {
      setView("words");
    }
  };

  const cycleLen = THEME_BANK.length * 3;
  const cycle = progress ? progress.dayIndex % cycleLen : 0;
  const themeIndex = Math.floor(cycle / 3);
  const dayWithinTheme = cycle % 3;
  const theme = THEME_BANK[themeIndex];
  const sentences = theme ? theme.sentences.slice(dayWithinTheme * 3, dayWithinTheme * 3 + 3) : [];
  const todayWords = theme ? theme.wordGroups[dayWithinTheme] : [];
  const currentWord = todayWords[wordIndex] || todayWords[0];
  const isLastWord = wordIndex === todayWords.length - 1;
  const dayNumber = progress ? progress.dayIndex + 1 : 1;
  const stampedToday = progress ? progress.stampedDates.includes(todayKey) : false;

  const streak = (() => {
    if (!progress) return 0;
    const set = new Set(progress.stampedDates);
    let cursor = stampedToday ? todayKey : addDaysToKey(todayKey, -1);
    let count = 0;
    while (set.has(cursor)) {
      count++;
      cursor = addDaysToKey(cursor, -1);
    }
    return count;
  })();

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = addDaysToKey(todayKey, -(6 - i));
    const d = keyToDate(key);
    return {
      key,
      weekday: WEEKDAY_LETTER[d.getDay()],
      filled: progress ? progress.stampedDates.includes(key) : false,
      isToday: key === todayKey,
    };
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const handleMarkDone = useCallback(() => {
    if (stampedToday) return;
    setJustStamped(true);
    setTimeout(() => setJustStamped(false), 900);
    setProgress((prev) => {
      if (!prev) return prev;
      if (prev.stampedDates.includes(todayKey)) return prev;
      const next = { ...prev, stampedDates: [...prev.stampedDates, todayKey] };
      storage.set("progress", JSON.stringify(next)).catch(() => {});
      return next;
    });
    showToast("Great job! Today's sentences are done 🎉");
  }, [stampedToday, todayKey]);

  const handleReset = async () => {
    const data = { dayIndex: 0, lastDate: todayKey, stampedDates: [] };
    try {
      await storage.set("progress", JSON.stringify(data));
    } catch (e) {
      // ignore
    }
    setProgress(data);
    setConfirmReset(false);
    showToast("Starting over from Day 1!");
  };

  if (loading || !progress) {
    return (
      <div className="loading-wrap">
        <style>{STYLE}</style>
        <p>Preparing today's sentences...</p>
      </div>
    );
  }

  return (
    <div className="desk-bg min-h-screen flex items-center justify-center p-4">
      <style>{STYLE}</style>
      <div className="relative w-full max-w-md notice-page rounded-2xl shadow-xl pl-9 pr-5 py-6 sm:pl-11 sm:pr-7 sm:py-8">
        <div className="holes">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="hole" />
          ))}
        </div>

        {stampedToday && (
          <div
            className={`stamp-badge display-font absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold ${
              justStamped ? "stamp-animate" : ""
            }`}
          >
            DONE
          </div>
        )}

        <p className="pencil-note text-sm mb-1">Grade 3 English Notice</p>
        <h1 className="display-font text-2xl sm:text-3xl mb-1" style={{ color: "#2F3E46" }}>
          {view === "words" ? "Today's Key Words" : "Today's English Phrases"}
        </h1>
        <p className="text-sm mb-4" style={{ color: "#5B6B63" }}>
          {formatDateLabel(todayKey)} · Day {dayNumber}
        </p>

        <div
          className="inline-flex items-center gap-1 mb-5 px-3 py-1 rounded-full text-sm"
          style={{ background: "#D9A441", color: "#3A2C0D" }}
        >
          <span>{theme.emoji}</span>
          <span>Theme: {theme.title}</span>
        </div>

        {view === "words" ? (
          <div className="mb-2">
            <p className="pencil-note text-sm mb-3" style={{ color: "#5B6B63" }}>
              Learn these key words before today's sentences:
            </p>

            <div
              key={wordIndex}
              onPointerDown={handleCardPointerDown}
              onPointerUp={handleCardPointerUp}
              className="card-anim rounded-2xl p-6 text-center"
              style={{ background: "#fff", border: "2px solid #C7D6C9", touchAction: "pan-y", cursor: "grab" }}
            >
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3"
                style={{
                  background: POS_STYLES[currentWord.pos].bg,
                  color: POS_STYLES[currentWord.pos].text,
                }}
              >
                {currentWord.pos}
              </span>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="sentence-en text-3xl" style={{ color: "#2F3E46" }}>
                  {currentWord.en}
                </p>
                <button
                  onClick={() => speak(currentWord.en, "word")}
                  aria-label="Listen to native pronunciation"
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: speakingIndex === "word" ? "#BD4242" : "#fff",
                    border: "2px solid #C7D6C9",
                    color: speakingIndex === "word" ? "#fff" : "#2F3E46",
                  }}
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <p className="text-base" style={{ color: "#5B6B63" }}>
                {currentWord.ko}
              </p>
            </div>

            <p className="text-center text-xs mt-2" style={{ color: "#9AA9A0" }}>
              Swipe the card, or use the arrows
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-4 mb-4">
              {todayWords.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === wordIndex ? "10px" : "7px",
                    height: i === wordIndex ? "10px" : "7px",
                    background: i === wordIndex ? "#BD4242" : "#C7D6C9",
                  }}
                />
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={goPrevWord}
                disabled={wordIndex === 0}
                className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  border: "2px solid #C7D6C9",
                  color: wordIndex === 0 ? "#C7D6C9" : "#2F3E46",
                  background: "#fff",
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNextWord}
                className="send-btn flex-1 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold shadow-md"
              >
                <span className="display-font text-sm sm:text-base">
                  {isLastWord ? "See Today's Sentences" : "Next Word"}
                </span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div onPointerDown={handleCardPointerDown} onPointerUp={handleSentencesPointerUp} style={{ touchAction: "pan-y" }}>
            <button
              onClick={() => setView("words")}
              className="text-xs underline mb-3 inline-flex items-center gap-1"
              style={{ color: "#5B6B63" }}
            >
              <ChevronLeft size={12} /> Review Words
            </button>

            <div className="space-y-5 mb-6">
              {sentences.map((s, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div
                    className="display-font flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{ background: "#fff", border: "2px solid #C7D6C9", color: "#2F3E46" }}
                  >
                    {i + 1}
                  </div>
                  <p className="sentence-en text-lg leading-snug flex-1" style={{ color: "#2F3E46" }}>
                    {s.en}
                  </p>
                  <button
                    onClick={() => speak(s.en, i)}
                    aria-label="Listen to native pronunciation"
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: speakingIndex === i ? "#BD4242" : "#fff",
                      border: "2px solid #C7D6C9",
                      color: speakingIndex === i ? "#fff" : "#2F3E46",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleMarkDone}
              disabled={stampedToday}
              className="send-btn w-full text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold shadow-md"
              style={stampedToday ? { opacity: 0.6, cursor: "default" } : undefined}
            >
              <Check size={18} />
              <span className="display-font text-sm sm:text-base">
                {stampedToday ? "Done for Today" : "Mark Today as Done"}
              </span>
            </button>

            {stampedToday && (
              <p className="text-center text-xs mt-2" style={{ color: "#5B6B63" }}>
                Great job today! 🎉
              </p>
            )}
          </div>
        )}

        <div className="mt-7 pt-5" style={{ borderTop: "1px dashed #C7D6C9" }}>
          <p className="pencil-note text-base flex items-center gap-1 mb-3" style={{ color: "#2F3E46" }}>
            <Flame size={16} color="#BD4242" /> {streak} day streak
          </p>
          <div className="flex justify-between">
            {last7.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs display-font"
                  style={{
                    background: d.filled ? "#BD4242" : "transparent",
                    border: `2px ${d.isToday ? "solid" : "dashed"} ${d.filled ? "#BD4242" : "#C7D6C9"}`,
                    color: d.filled ? "#fff" : "#9AA9A0",
                  }}
                >
                  {d.filled ? "✓" : ""}
                </div>
                <span className="text-xs" style={{ color: d.isToday ? "#2F3E46" : "#9AA9A0" }}>
                  {d.weekday}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs underline inline-flex items-center gap-1"
              style={{ color: "#9AA9A0" }}
            >
              <RotateCcw size={12} /> Start over
            </button>
          ) : (
            <div className="text-xs" style={{ color: "#5B6B63" }}>
              Start over from Day 1?
              <button onClick={handleReset} className="ml-2 underline font-bold" style={{ color: "#BD4242" }}>
                Yes
              </button>
              <button onClick={() => setConfirmReset(false)} className="ml-2 underline">
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          className="toast-pop fixed bottom-5 left-1/2 px-4 py-2 rounded-full text-sm text-white shadow-lg"
          style={{ background: "#2F3E46", transform: "translate(-50%, 0)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
