import { Copy } from 'lucide-react';
import { useState } from 'react';

interface PixPaymentProps {
    qrCode: string;
    qrCodeBase64: string;
    total: number;
    onCopy: () => void;
}

export default function PixPayment({ qrCode, qrCodeBase64, total, onCopy }: PixPaymentProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(qrCode);
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 animate-in fade-in zoom-in duration-500">
            <div className="mb-6 text-center">
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter flex items-center justify-center gap-2">
                    Pagamento via
                    <svg viewBox="0 0 24 24" className="h-6 w-auto text-[#32BCAD]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156" />
                    </svg>
                </h3>
                <p className="text-zinc-500 font-medium">Escaneie o QR Code ou copie o código abaixo</p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-zinc-200 mb-8 border border-zinc-100">
                {qrCodeBase64 ? (
                    <img
                        src={`data:image/png;base64,${qrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-64 h-64 object-contain mix-blend-multiply"
                    />
                ) : (
                    <div className="w-64 h-64 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 font-bold">
                        QR Code Indisponível
                    </div>
                )}
            </div>

            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-4 flex items-center gap-3 mb-8 shadow-sm">
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">Código PIX</p>
                    <p className="font-mono text-sm truncate text-zinc-600">{qrCode}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}
                >
                    <Copy size={20} />
                </button>
            </div>

            <div className="bg-blue-50 text-blue-800 px-6 py-4 rounded-2xl text-sm font-bold text-center max-w-sm">
                <p>Após o pagamento, seu pedido será aprovado automaticamente em alguns instantes.</p>
            </div>

            <div className="mt-8 text-center">
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Valor Total</p>
                <p className="text-4xl font-black text-zinc-900">R$ {total.toFixed(2)}</p>
            </div>
        </div>
    );
}
