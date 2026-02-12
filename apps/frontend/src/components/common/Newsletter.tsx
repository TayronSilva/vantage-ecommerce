import React from 'react';

const Newsletter: React.FC = () => {
    return (
        <section className="bg-zinc-950 py-16 px-6 md:px-16 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left max-w-xl">
                    <h2 className="text-zinc-100 text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase">
                        Ganhe 15% OFF na primeira compra
                    </h2>
                    <p className="text-zinc-400 text-lg font-medium">
                        Descubra as novidades antes de todo mundo e receba ofertas exclusivas diretamente no seu e-mail.
                    </p>
                </div>

                <div className="w-full max-w-md">
                    <form className="flex flex-col sm:flex-row gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800">
                        <input
                            type="email"
                            placeholder="SEU E-MAIL"
                            className="bg-transparent text-zinc-100 px-6 py-4 outline-none flex-1 font-bold text-sm tracking-widest placeholder:text-zinc-600"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-zinc-100 text-zinc-950 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all active:scale-95"
                        >
                            Cadastrar
                        </button>
                    </form>
                    <p className="mt-4 text-zinc-600 text-[10px] uppercase tracking-widest text-center lg:text-left font-bold">
                        Ao se cadastrar você concorda com nossa política de privacidade.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
