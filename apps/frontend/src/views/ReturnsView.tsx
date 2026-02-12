import React from 'react';

const ReturnsView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-black mb-8 tracking-tight">POLÍTICA DE TROCAS E DEVOLUÇÕES</h1>

            <div className="space-y-8 text-zinc-600 leading-relaxed font-medium">
                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">1. DIREITO DE ARREPENDIMENTO</h2>
                    <p>
                        Em conformidade com o Artigo 49 do Código de Defesa do Consumidor, o cliente tem o direito de desistir da compra em até 7 (sete) dias corridos após o recebimento do produto, sem necessidade de justificativa. O reembolso será total, incluindo o frete.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">2. CONDIÇÕES PARA TROCA OU DEVOLUÇÃO</h2>
                    <p>
                        O produto deve ser devolvido em sua embalagem original, sem indícios de uso e acompanhado de todos os acessórios e nota fiscal.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">3. PRODUTO COM DEFEITO</h2>
                    <p>
                        Caso o produto apresente qualquer defeito de fabricação, o cliente tem até 90 (noventa) dias para solicitar a troca ou reparo. A **Vantage** se compromete a resolver o problema em no máximo 30 dias após o recebimento do item em nosso centro de distribuição.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">4. COMO SOLICITAR</h2>
                    <p>
                        Para iniciar o processo, acesse seu histórico de pedidos e clique em "Solicitar Troca" ou entre em contato pelo e-mail: <span className="text-zinc-900 font-bold">contato@vantage.com.br</span>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ReturnsView;
