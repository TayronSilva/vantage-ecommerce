import React from 'react';

const PrivacyView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-black mb-8 tracking-tight">POLÍTICA DE PRIVACIDADE</h1>

            <div className="space-y-8 text-zinc-600 leading-relaxed font-medium">
                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">1. COMPROMISSO COM A LGPD</h2>
                    <p>
                        A **Vantage** valoriza sua privacidade. Processamos seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD). Seus dados pessoais são coletados exclusivamente para o processamento de pedidos e melhoria da sua experiência de compra.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">2. SEGURANÇA NO PAGAMENTO</h2>
                    <p>
                        Não armazenamos dados críticos de cartão de crédito. Todo o processamento de pagamento é realizado de forma segura através do **Mercado Pago**, garantindo criptografia de ponta a ponta.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">3. COOKIES E DADOS</h2>
                    <p>
                        Utilizamos cookies para lembrar suas preferências (como o carrinho de compras) e para análises anônimas de tráfego. Você pode desabilitar os cookies nas configurações do seu navegador a qualquer momento.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">4. SEUS DIREITOS</h2>
                    <p>
                        Você tem o direito de solicitar o acesso, correção ou exclusão de seus dados de nossa base. Basta entrar em contato com nosso encarregado de dados através de <span className="text-zinc-900 font-bold">privacy@vantage.com.br</span>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyView;
