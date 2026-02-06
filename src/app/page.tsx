
import { RepairRequestForm } from "@/components/request/RepairRequestForm";
import { CheckCircle2, ClipboardList, Shirt, Truck } from "lucide-react";
import ActiveOrders from "@/components/active-orders";

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
          <div className="flex flex-col items-center justify-center gap-6">

            {/* Hero Text - Compacted for better fit */}
            <div className="text-center text-white max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-sm">
                Expert Repair at <br className="hidden md:block" />
                Your Doorstep
              </h1>
              <p className="text-blue-100/90 text-base md:text-lg mb-4 leading-relaxed font-medium">
                Professional clothing care made simple.<br />
                집에서 편하게 전문가의 수선을 경험하세요.
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

      {/* "What happens next?" Section */}
      <section className="w-full pb-20 px-4 mt-12 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-snug">
              3단계로 간편하게 진행되는 <br className="md:hidden" /> 프리미엄 수선 프로세스
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              icon={<ClipboardList className="w-8 h-8" />}
              step="01"
              title="무료 견적 서비스"
              desc="수선하고 싶은 옷의 사진을 찍어 올리시면, 수선 전문가가 24시간 이내에 무료로 정확한 견적을 제안해 드립니다."
            />
            <StepCard
              icon={<Truck className="w-8 h-8" />}
              step="02"
              title="편리한 수거와 배송"
              desc="문 앞에 내놓으시면 비대면으로 안전하게 수거하고, 수선이 완료되면 집 앞까지 깔끔하게 포장하여 배송해 드립니다."
            />
            <StepCard
              icon={<Shirt className="w-8 h-8" />}
              step="03"
              title="고품질 마감"
              desc="30년 경력의 마스터가 원단의 특성을 고려하여 브랜드 퀄리티에 걸맞은 프리미엄 마감으로 완벽하게 복원해 드립니다."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 flex flex-col items-center text-center group">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400 tracking-wider mb-2">STEP {step}</span>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

