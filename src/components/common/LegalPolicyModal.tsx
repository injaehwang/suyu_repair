'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LegalDocument } from '@/constants/legal';
import ReactMarkdown from 'react-markdown';

interface LegalPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: LegalDocument | null;
}

export function LegalPolicyModal({ isOpen, onClose, document }: LegalPolicyModalProps) {
    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-slate-50 flex-shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        {document.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {document.title} 내용
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <article className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:my-2 prose-h4:mt-6 prose-h4:mb-2 prose-ul:my-2">
                        <ReactMarkdown>{document.content}</ReactMarkdown>
                    </article>
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-end flex-shrink-0">
                    <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                        닫기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
