
import { RepairRequestForm } from "@/components/request/RepairRequestForm";
import { CheckCircle2, ClipboardList, Shirt, Truck } from "lucide-react";
import ActiveOrders from "@/components/active-orders";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50">

      {/* Hero Section Container - Now controlling the background */}
      <section className="relative w-full bg-[#093495cf] rounded-b-[40px] md:rounded-b-[80px] overflow-hidden pb-6 md:pb-32">

        {/* Background Image & Overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bg-main.webp"
          alt="Background Pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#093495cf]/0 to-[#093495cf]/80 pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-4 pt-24 md:pt-32 relative z-10">
          <div className="flex flex-col items-center justify-center gap-4">

            {/* Hero Text - Compacted for better fit */}
            <div className="text-center text-white max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-sm">
                Expert Repair at <br className="hidden md:block" />Your Doorstep
              </h1>
              <p className="text-blue-100/90 text-base md:text-lg mb-4 leading-relaxed font-medium">
                서울에서 제주까지 손쉬운 비대면 수거 수선<br />
                집에서 편안하게 전문가의 손길을 느껴보세요.
              </p>

              {/* Features - Compacted */}
              <div className="hidden md:flex gap-6 text-blue-100/80 justify-center text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>24h Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  <span>Free Pickup</span>
                </div>
              </div>
            </div>

            {/* Request Form Card - Wider for Split Layout */}
            <div className="w-full max-w-6xl">
              <RepairRequestForm />
            </div>

          </div>
        </div>
      </section>

      <section className="w-full pb-10 px-4 mt-12 relative z-20 sr-only">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight leading-snug">
              어떤 옷이든 수선해 드려요
            </h2>
            <p className="text-slate-500">
              가죽자켓, 코트, 패딩부터 청바지, 정장까지 모든 의류 수선 가능합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CategoryCard title="가죽/모피" services={["가죽자켓", "무스탕", "가죽염색"]} />
            <CategoryCard title="패딩/아웃도어" services={["패딩수선", "충전재보강", "지퍼교체"]} />
            <CategoryCard title="코트/자켓" services={["코트기장", "소매수선", "안감교체"]} />
            <CategoryCard title="바지/데님" services={["청바지기장", "허리수선", "통줄임"]} />
            <CategoryCard title="정장/셔츠" services={["정장리폼", "셔츠카라", "소매기장"]} />
            <CategoryCard title="명품/리폼" services={["명품수선", "전체리폼", "디자인변경"]} />
          </div>
        </div>
      </section>

      {/* "What happens next?" Section */}
      <section className="w-full pb-10 px-4 mt-12 relative z-20 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-snug">
              세 단계로 끝나는 간편한 수선, <br className="md:hidden" /> 함께 보실까요?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            <StepCard
              icon={<ClipboardList className="w-8 h-8" />}
              step="01"
              title="부담 없는 무료 견적"
              desc="수선하고 싶은 옷의 사진을 찍어 올려주세요. 24시간 이내에 무료로 견적을 알려드릴게요."
            />
            <StepCard
              icon={<Truck className="w-8 h-8" />}
              step="02"
              title="편하게 보내고 받으세요"
              desc="문 앞에 두시면 안전하게 수거하고, 수선이 끝나면 깔끔하게 포장해서 보내드려요."
            />
            <StepCard
              icon={<Shirt className="w-8 h-8" />}
              step="03"
              title="새 옷처럼 꼼꼼하게"
              desc="30년 경력의 장인이 꼼꼼하게 수선해 드려요. 새 옷 같은 기분을 느껴보세요!"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 flex flex-row md:flex-col items-center md:items-center text-left md:text-center group gap-4 md:gap-0">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-0 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
        {icon}
      </div>
      <div>
        <span className="text-xs font-bold text-slate-400 tracking-wider mb-1 md:mb-2 block">STEP {step}</span>
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-3">{title}</h3>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function CategoryCard({ title, services }: { title: string; services: string[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all text-center">
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <ul className="text-sm text-slate-500 space-y-1">
        {services.map((service, idx) => (
          <li key={idx} className="bg-slate-50 rounded-md py-0.5 px-2 inline-block m-0.5">{service}</li>
        ))}
      </ul>
    </div>
  )
}

