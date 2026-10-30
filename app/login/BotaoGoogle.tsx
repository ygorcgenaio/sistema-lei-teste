'use client';

import { useRef, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { loginComGoogleAction } from '@/app/actions/auth';

// Tipos mínimos do script do Google (só o que usamos).
type RespostaGoogle = { credential: string };

type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (resposta: RespostaGoogle) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (elemento: HTMLElement, opcoes: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

type Aviso = { titulo: string; mensagem: string };

const AVISO_FALHA: Aviso = {
  titulo: 'Não foi possível realizar a autenticação.',
  mensagem:
    'Tente novamente. Caso o problema persista, entre em contato com a equipe responsável pelo SiGPatri.',
};

export default function BotaoGoogle({ clientId }: { clientId: string }) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [processando, setProcessando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  async function aoReceberCredencial(resposta: RespostaGoogle) {
    setAviso(null);
    setProcessando(true);

    try {
      // A credencial é enviada ao servidor, que a valida com o Google.
      const resultado = await loginComGoogleAction(resposta.credential);

      if (resultado.ok) {
        router.replace('/');
        router.refresh();
        return;
      }

      setAviso({ titulo: resultado.titulo, mensagem: resultado.mensagem });
    } catch {
      setAviso(AVISO_FALHA);
    }

    setProcessando(false);
  }

  function iniciarBotao() {
    if (!window.google || !container.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      callback: aoReceberCredencial,
    });

    window.google.accounts.id.renderButton(container.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      locale: 'pt-BR',
      width: 280,
    });
  }

  return (
    <div className="w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={iniciarBotao}
        onError={() => setAviso(AVISO_FALHA)}
      />

      <div
        ref={container}
        className={`flex justify-center min-h-[44px] ${processando ? 'opacity-50 pointer-events-none' : ''}`}
      />

      {processando && (
        <p className="mt-3 text-center text-sm text-gray-500">Verificando acesso...</p>
      )}

      {aviso && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <p className="font-semibold">{aviso.titulo}</p>
          <p className="mt-1">{aviso.mensagem}</p>
        </div>
      )}
    </div>
  );
}
