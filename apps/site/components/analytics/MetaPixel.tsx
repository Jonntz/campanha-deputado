"use client";

import Script from "next/script";

/**
 * Pixel da Meta (Facebook/Instagram Ads).
 *
 * Não existe componente oficial no `@next/third-parties`, então usamos o
 * snippet base da Meta via next/script — mesma estratégia `afterInteractive`
 * da tag do Google: carrega depois da hidratação, sem disputar banda com o
 * conteúdo principal.
 *
 * O site tem uma rota só e navega por âncoras, então o PageView dispara uma
 * vez. Se novas rotas forem criadas, será preciso refazer o track a cada
 * navegação (via usePathname).
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const id = JSON.stringify(pixelId);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${id});
fbq('track', 'PageView');`}
      </Script>

      <noscript>
        {/* Beacon de 1x1 para quem navega sem JavaScript. É um pixel de
            rastreamento, não uma imagem de conteúdo: next/image não se aplica. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
