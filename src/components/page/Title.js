// Title.jsx  (reemplaza por completo tu Title actual)
import React, { useEffect, useState } from 'react';
import ExternalLink from './ExternalLink';

function ErrorSubTitle() {
  return 'Something went wrong!';
}

/**
 * DungeonMasterSubTitle
 * - usa battleLinkFromState si viene (preferido)
 * - si no, construye origin + /battle/<id>
 * - pone el link completo en title="" para poder verlo al hover (evita depender de CSS)
 * - añade botón para copiar el link al portapapeles (sin tocar estilos)
 */
function DungeonMasterSubTitle({ battleId, battleLinkFromState }) {
  const [playerLink, setPlayerLink] = useState({ url: null, copied: false });

  useEffect(() => {
    if (!battleId && !battleLinkFromState) {
      setPlayerLink({ url: null, copied: false });
      return;
    }

    const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    const url = battleLinkFromState || `${origin}/battle/${battleId}`;

    setPlayerLink({ url, copied: false });

    // Intentamos copiar automáticamente solo si lo preferís; ahora lo dejamos en false
    // para no forzar permisos. Si querés copia automática, descomenta:
    // try { navigator.clipboard.writeText(url); setPlayerLink({ url, copied: true }); } catch(e) {}
  }, [battleId, battleLinkFromState]);

  const { url, copied } = playerLink;

  if (!url) {
    return <>. . .</>; // mantengo tu placeholder original
  }

  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      setPlayerLink((s) => ({ ...s, copied: true }));
      // reset mensaje copiado a los 2s para no quedar fijo
      setTimeout(() => setPlayerLink((s) => ({ ...s, copied: false })), 2000);
    } catch (err) {
      // si falla la API de clipboard (viejo navegador), intentamos fallback con prompt
      // (no modificamos estilos, solo mostramos prompt como fallback)
      // eslint-disable-next-line no-alert
      window.prompt('Copia el enlace manualmente (Ctrl+C, Enter):', url);
    }
  };

  return (
    <span>
      {/* title contiene la URL completa: aunque el CSS muestre "..." el tooltip mostrará el link */}
      <ExternalLink url={url} title={url} aria-label={`Player session ${battleId}`}>
        Player session {battleId}
      </ExternalLink>

      {/* Botón para copiar (sin estilos nuevos). Lo colocamos junto al link; conservará tu CSS */}
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar enlace de la batalla"
        style={{ marginLeft: '8px' }} // pequeño espaciado inline, no requiere cambios CSS
      >
        Copiar
      </button>

      {copied && <span style={{ marginLeft: '6px' }}>(copiado)</span>}
    </span>
  );
}

function SubTitle({
  error,
  playerSession,
  battleId,
  battleLinkFromState,
}) {
  if (error) return (<ErrorSubTitle />);

  if (playerSession) return `Player Session ${battleId}`;

  return (<DungeonMasterSubTitle battleId={battleId} battleLinkFromState={battleLinkFromState} />);
}

export default function Title({
  shareEnabled, battleId, playerSession, error, battleLink,
}) {
  const showSubtitle = error || shareEnabled || playerSession;
  const titleClasses = `main-title ${showSubtitle ? 'main-title__short' : ''}`;

  return (
    <>
      <h1 className={titleClasses}>
        <ExternalLink url="/">D&D Battle Tracker</ExternalLink>
      </h1>

      {showSubtitle && (
        <h2 className="sub-title">
          <SubTitle
            error={error}
            playerSession={playerSession}
            battleId={battleId}
            battleLinkFromState={battleLink}
          />
        </h2>
      )}
    </>
  );
}
