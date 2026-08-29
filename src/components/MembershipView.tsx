import React from 'react';
import { Crown, Gift, CheckCircle2, Infinity as InfinityIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STREAK_DAYS = [
  { day: 1, reward: '20 코인' },
  { day: 2, reward: '30 코인' },
  { day: 3, reward: '50 코인' },
  { day: 4, reward: '60 코인' },
  { day: 5, reward: '80 코인' },
  { day: 6, reward: '100 코인' },
  { day: 7, reward: '🎁 VIP 1일권' },
];

export const MembershipView: React.FC = () => {
  const { userProfile, claimDailyCheckIn, purchaseLifetimePass } = useApp();

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top VIP Status Card */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-600/30 via-purple-900/30 to-black border border-amber-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center gap-1 shadow">
                <Crown className="w-4 h-4 fill-black" />
                {userProfile.vipTier}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {userProfile.nickname} 님의 멤버십
              </h2>
            </div>
            <p className="text-xs text-amber-200/80">
              {userProfile.isLifetime
                ? '🎉 평생 이용권 적용 중 (만료 없음 · 모든 에피소드 무제한 무료)'
                : userProfile.isVip
                ? `혜택 유효 기간: ~ ${userProfile.vipExpiryDate} (모든 에피소드 무제한 무료)`
                : 'VIP 가입 시 전편 광고 없이 무제한으로 감상하실 수 있습니다.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-[11px] text-zinc-400">보유 코인</div>
              <div className="text-base font-bold text-amber-400">🪙 {userProfile.coins}</div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center px-2">
              <div className="text-[11px] text-zinc-400">보너스 P</div>
              <div className="text-base font-bold text-rose-400">⭐ {userProfile.bonusPoints}P</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Attendance Check-In Widget */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#181822] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              7일 연속 출석체크 보상
            </h3>
          </div>
          <span className="text-xs text-rose-400 font-semibold">
            {userProfile.checkInStreak}일 연속 출석 중!
          </span>
        </div>

        {/* 7 Days Row */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {STREAK_DAYS.map((item) => {
            const isCompleted = item.day <= userProfile.checkInStreak;
            const isToday = item.day === userProfile.checkInStreak + 1;

            return (
              <div
                key={item.day}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-between min-h-[64px] border ${
                  isCompleted
                    ? 'bg-rose-950/40 border-rose-600/40 text-rose-300'
                    : isToday
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-black/30 border-white/5 text-zinc-500'
                }`}
              >
                <span className="text-[10px] font-bold">{item.day}일차</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                ) : (
                  <span className="text-[10px] font-medium leading-tight">{item.reward}</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          id="btn-claim-attendance"
          onClick={() => claimDailyCheckIn()}
          disabled={userProfile.checkedInToday}
          className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
            userProfile.checkedInToday
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-rose-600/30 active:scale-95'
          }`}
        >
          {userProfile.checkedInToday ? '오늘의 출석 완료 ✓' : '오늘의 출석 보상 받기 (+50 코인)'}
        </button>
      </div>

      {/* Lifetime Pass — one-time payment, unlimited forever */}
      <div
        id="plan-card-lifetime"
        className="relative p-5 rounded-2xl bg-gradient-to-br from-rose-600/20 via-amber-500/10 to-black border border-amber-400/40 shadow-xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-500 to-amber-400 text-black shadow">
          역대 최저가 · 평생 단 1회
        </span>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-1.5">
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
              <InfinityIcon className="w-5 h-5 text-amber-400" />
              평생 이용권
            </h4>
            <p className="text-xs text-zinc-300">
              단 한 번 결제로 전편·전 회차를 <span className="text-amber-300 font-bold">평생 무제한</span>으로 시청하세요. 매달 결제할 필요가 없습니다.
            </p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-zinc-300 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                전편 평생 무제한 시청
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                광고 없는 몰입 시청
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                1080p 초고화질
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                재구매·갱신 필요 없음
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="text-center sm:text-right">
              <div className="text-xs text-zinc-500 line-through">₩ 69,000</div>
              <div className="text-2xl font-black text-amber-400">₩ 10,000</div>
              <div className="text-[10px] text-zinc-400">평생 1회 결제</div>
            </div>
            <button
              id="btn-buy-lifetime"
              onClick={() => purchaseLifetimePass()}
              disabled={userProfile.isLifetime}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-all whitespace-nowrap"
            >
              {userProfile.isLifetime ? '이용 중 ✓' : '평생 이용권 구매하기'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
