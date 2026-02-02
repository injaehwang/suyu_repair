
import { RepairRequestForm } from "@/components/request/RepairRequestForm";
import { CheckCircle2, ClipboardList, Shirt, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50">

      {/* Hero Section Container - Now controlling the background */}
      <section className="relative w-full bg-blue-600 rounded-b-[40px] md:rounded-b-[80px] overflow-hidden pb-20 md:pb-32">

        {/* Background Image & Overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bg-main.webp"
          alt="Background Pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/0 to-blue-600/60 pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-4 pt-24 md:pt-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">

            {/* Hero Text */}
            <div className="text-center md:text-left text-white max-w-lg">
              <span className="text-blue-200 font-semibold tracking-wider text-sm mb-4 block uppercase">suyu repair</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-sm">
                Expert Repair at <br />
                Your Doorstep
              </h1>
              <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed opacity-90 font-medium">
                Professional clothing care made simple.<br />
                집에서 편하게 전문가의 수선을 경험하세요.
              </p>
              <div className="hidden md:flex gap-6 text-blue-100 opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>24h Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  <span>Free Pickup</span>
                </div>
              </div>
            </div>

            {/* Request Form Card */}
            <div className="w-full max-w-md">
              <RepairRequestForm />
            </div>

          </div>
        </div>
      </section>

      {/* "What happens next?" Section */}
      <section className="w-full pb-20 px-4 mt-12 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">3단계로 간편하게 진행되는 프리미엄 수선 프로세스</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              icon={<ClipboardList className="w-8 h-8 text-blue-600" />}
              step="01"
              title="검토 및 견적 매칭"
              desc="24시간 내에 전문가가 사진을 확인하고 정확한 견적을 보내드립니다."
            />
            <StepCard
              icon={<Truck className="w-8 h-8 text-blue-600" />}
              step="02"
              title="편리한 수거"
              desc="원하는 시간에 집 앞으로 수거하러 방문하며, 안전하게 이동합니다."
            />
            <StepCard
              icon={<Shirt className="w-8 h-8 text-blue-600" />}
              step="03"
              title="수선 및 배송"
              desc="수선이 완료되면 전용 패키지에 담아 깨끗하게 배송해 드립니다."
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

