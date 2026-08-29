// Real DramaBox catalog categories (from the live /api/proxy/dramabox/category
// endpoint). `id` is the category id the API expects; `native` is the
// original (Indonesian) label; `ko` is the Korean label shown in the UI.
export interface DramaCategory {
  id: number;
  native: string;
  ko: string;
}

export const DRAMA_CATEGORIES: DramaCategory[] = [
  { id: 458, native: 'Balas Dendam', ko: '복수' },
  { id: 450, native: 'Kelahiran Kembali', ko: '환생/회빙환' },
  { id: 451, native: 'Perjalanan Waktu', ko: '타임슬립' },
  { id: 445, native: 'Pengkhianatan', ko: '배신' },
  { id: 462, native: 'Melawan Balik', ko: '반격' },
  { id: 429, native: 'Kebangkitan', ko: '각성/부활' },
  { id: 438, native: 'Kembali Orang Kuat', ko: '강자의 귀환' },
  { id: 470, native: 'Orang Kuat', ko: '숨겨진 고수' },
  { id: 441, native: 'Identitas Rahasia', ko: '비밀 신분' },
  { id: 453, native: 'Identitas Tersembunyi', ko: '숨겨진 신분' },
  { id: 452, native: 'Identitas Tertukar', ko: '신분 교체' },
  { id: 440, native: 'Miliarder', ko: '재벌' },
  { id: 464, native: 'CEO Wanita', ko: '여성 CEO' },
  { id: 463, native: 'Wanita Tangguh', ko: '걸크러시' },
  { id: 447, native: 'Romansa', ko: '로맨스' },
  { id: 456, native: 'Nikah Dulu Cinta Belakangan', ko: '선결혼 후연애' },
  { id: 457, native: 'Pernikahan Kilat', ko: '초고속 결혼' },
  { id: 454, native: 'Kawin Kontrak', ko: '계약 결혼' },
  { id: 455, native: 'Kekasih Kontrak', ko: '계약 연애' },
  { id: 449, native: 'Cinta Pahit', ko: '애절한 사랑' },
  { id: 469, native: 'Cinta Sejati', ko: '찐사랑' },
  { id: 448, native: 'Manis', ko: '달달물' },
  { id: 461, native: 'Cinta Segitiga', ko: '삼각관계' },
  { id: 466, native: 'Salah Paham', ko: '오해물' },
  { id: 459, native: 'Reuni', ko: '재회' },
  { id: 689, native: 'Keluarga', ko: '가족' },
  { id: 460, native: 'Bayi', ko: '육아/아기' },
  { id: 444, native: 'Menantu Matrilineal', ko: '데릴사위' },
  { id: 435, native: 'Orang Kecil', ko: '소시민' },
  { id: 467, native: 'Realitas', ko: '현실주의' },
  { id: 427, native: 'Urban', ko: '현대물' },
  { id: 442, native: 'Naga', ko: '무협' },
  { id: 430, native: 'Dokter Dewa', ko: '신의' },
  { id: 433, native: 'Kekuatan Super', ko: '초능력' },
  { id: 434, native: 'Misteri', ko: '미스터리' },
  { id: 437, native: 'Ahli Turun Gunung', ko: '하산한 고수' },
  { id: 436, native: 'Kebangkitan Warisan', ko: '유산 각성' },
];
