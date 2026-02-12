import React from 'react';

const TermsView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-black mb-8 tracking-tight">TERMOS DE USO</h1>

            <div className="space-y-8 text-zinc-600 leading-relaxed font-medium">
                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">1. ACEITAÇÃO DOS TERMOS</h2>
                    <p>
                        Ao acessar e utilizar o site da **Vantage**, você concorda com os termos e condições aqui descritos. Reservamo-nos o direito de atualizar estes termos periodicamente.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">2. DISPONIBILIDADE DE PRODUTOS</h2>
                    <p>
                        Embora busquemos manter o estoque sempre atualizado, a finalização da compra está sujeita à disponibilidade física do item no momento da separação. Caso ocorra falta de estoque, entraremos em contato para substituição ou estorno imediato.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">3. PAGAMENTOS</h2>
                    <p>
                        Aceitamos pagamentos via Cartão de Crédito, PIX e Boleto através do Mercado Pago. Pedidos via Boleto e PIX são cancelados automaticamente se não forem pagos dentro do prazo de vencimento (30 minutos para PIX).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">4. PROPRIEDADE INTELECTUAL</h2>
                    <p>
                        Todo o design, marca e conteúdo deste site são de propriedade exclusiva da **Vantage**. A reprodução sem autorização é proibida.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsView;
