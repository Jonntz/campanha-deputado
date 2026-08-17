"use client";

import Script from "next/script";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
  }
}

const VLIBRAS_APP = "https://vlibras.gov.br/app";

/**
 * Widget de acessibilidade em Libras do Governo Federal.
 *
 * O plugin procura por esta estrutura de atributos no DOM e a substitui pelo
 * próprio widget. O script carrega depois da hidratação: é um recurso auxiliar
 * e não deve competir com o carregamento do conteúdo principal.
 */
export function VLibras() {
  return (
    <>
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active" />
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>

      <Script
        src={`${VLIBRAS_APP}/vlibras-plugin.js`}
        strategy="afterInteractive"
        onReady={() => {
          if (window.VLibras) new window.VLibras.Widget(VLIBRAS_APP);
        }}
      />
    </>
  );
}
