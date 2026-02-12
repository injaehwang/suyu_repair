export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-8">
                <header className="border-b border-slate-100 pb-6">
                    <h1 className="text-2xl font-bold text-slate-900">환불 및 반품 규정</h1>
                    <p className="mt-2 text-slate-500 text-sm">최종 수정일: 2026년 2월 12일</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        1. 수선 서비스의 특성
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        수유수선(Suyu Repair)에서 제공하는 모든 서비스는 고객님의 요청에 따라 맞춤형으로 진행되는 <strong>주문제작(Customized) 성격의 용역 서비스</strong>입니다.
                        따라서 서비스가 완료된 후에는 원칙적으로 단순 변심에 의한 환불이나 원상 복구가 불가능합니다.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        2. 결제 취소 및 환불 안내
                    </h2>
                    <div className="space-y-3 text-slate-600 text-sm">
                        <p className="font-bold text-slate-700">A. 결제 취소 가능 시점</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>수거 전 (결제 완료):</strong> 마이페이지 또는 고객센터를 통해 즉시 전액 결제 취소가 가능합니다.</li>
                            <li><strong>수거 완료 ~ 수선 착수 전:</strong> 결제 취소는 가능하나, 발생한 <strong>왕복 배송비(6,000원)</strong>를 차감한 잔액이 환불됩니다.</li>
                        </ul>

                        <p className="font-bold text-slate-700 mt-4">B. 환불 처리 기간</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>신용카드:</strong> 취소 요청 후 3~5 영업일 이내에 카드사 승인이 취소됩니다.</li>
                            <li><strong>가상계좌/무통장입금:</strong> 취소 요청 시 입력하신 계좌로 1~3 영업일 이내에 입금됩니다.</li>
                        </ul>

                        <p className="font-bold text-slate-700 mt-4">C. 취소/환불 불가 사유</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>수선 진행 중 (Repairing) 이후:</strong> 이미 작업이 시작된 경우 원단 절개 등으로 원상 복구가 불가능하므로 취소가 불가능합니다.</li>
                            <li><strong>수선 완료 및 배송 중:</strong> 서비스 제공이 완료된 상태이므로 결제 취소가 불가능합니다.</li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        3. 재수선(A/S) 정책
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">
                        작업 완료일로부터 <strong>7일 이내</strong>에 다음과 같은 사유가 발생한 경우, 무상으로 재수선해 드립니다.
                    </p>
                    <ul className="list-disc list-inside text-slate-600 text-sm space-y-2 ml-2">
                        <li>요청하신 내용과 다르게 수선된 경우</li>
                        <li>수선 부위의 박음질 풀림, 부자재 탈락 등 작업 불량이 확인된 경우</li>
                        <li>치수 오차 범위(±1cm)를 초과하여 수선된 경우</li>
                    </ul>
                    <p className="text-slate-500 text-xs mt-4 bg-slate-50 p-3 rounded-lg">
                        ※ 단, 원단의 노후화로 인한 손상, 착용 후 발생한 훼손, 고객님의 치수 측정 오류로 인한 문제는 A/S 대상에서 제외됩니다.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        4. 환불 및 보상 제외 대상 (면책 사항)
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">
                        다음의 경우에는 회사의 귀책사유가 아니므로 <strong>환불 및 무상 A/S가 불가능</strong>합니다.
                    </p>
                    <ul className="list-disc list-inside text-slate-600 text-sm space-y-2 ml-2">
                        <li><strong>원단 노후화:</strong> 삭은 실, 원단의 경화 등 옷의 노후화로 인해 작업 중 불가피하게 발생한 파손.</li>
                        <li><strong>주관적 불만족:</strong> 객관적인 치수 오차(±1.5cm) 이내이나, 고객님의 주관적인 핏감(Fit)이나 디자인 선호도에 따른 불만족.</li>
                        <li><strong>소재 차이:</strong> 기존 원단/부자재와 100% 동일한 자재를 구할 수 없어 가장 유사한 자재로 대체한 경우.</li>
                        <li><strong>장기 미수령:</strong> 수선 완료 통지 후 <strong>3개월 이상</strong> 찾아가지 않아 폐기된 물품.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        5. 손해 배상
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        당사의 과실로 인해 의류가 분실되거나 착용이 불가능할 정도로 훼손된 경우,
                        소비자분쟁해결기준(공정거래위원회 고시)에 의거하여 감가상각 후 배상해 드립니다.
                    </p>
                </section>

                <div className="pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">
                        관련 문의사항은 <strong>[마이페이지 {'>'} 1:1 문의]</strong>를 이용해 주시기 바랍니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
