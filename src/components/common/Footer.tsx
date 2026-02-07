'use client';

import { useState } from "react";
import { LEGAL_DOCUMENTS, LegalDocType } from "@/constants/legal";
import { LegalPolicyModal } from "./LegalPolicyModal";

export function Footer() {
    const [openModal, setOpenModal] = useState<LegalDocType | null>(null);

    const handleOpen = (type: LegalDocType) => {
        setOpenModal(type);
    };

    const handleClose = () => {
        setOpenModal(null);
    };

    return (
        <footer className="border-t bg-slate-50 pt-6 pb-12 text-[11px] md:text-sm text-slate-500">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Customer Center Info */}
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 mb-3 text-base">고객센터</h3>
                        <p>운영시간: 평일 10:00 - 18:00 (주말/공휴일 휴무)</p>
                        <p>점심시간: 12:00 - 13:00</p>
                        <div className="mt-4">
                            <button
                                onClick={() => window.location.href = '/inquiries/new'}
                                className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-700 transition-colors"
                            >
                                문의하기
                            </button>
                        </div>
                    </div>

                    {/* Legal Links Buttons */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end content-start">
                        <button onClick={() => handleOpen('privacy')} className="hover:text-slate-900 transition-colors font-bold">개인정보처리방침</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleOpen('terms')} className="hover:text-slate-900 transition-colors">이용약관</button>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <p className="font-bold text-slate-700">수유리페어</p>
                        <p>대표자: 한양순 | 사업자등록번호: 609-06-69939</p>
                        <p>주소: 경상남도 창원시 의창구 동읍 신방로 17-24, 102호</p>
                    </div>
                    <p className="text-slate-400">© 2026 Suyu Repair. All rights reserved.</p>
                </div>
            </div>

            <LegalPolicyModal
                isOpen={!!openModal}
                document={openModal ? LEGAL_DOCUMENTS[openModal] : null}
                onClose={handleClose}
            />
        </footer>
    );
}
