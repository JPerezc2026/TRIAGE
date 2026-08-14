/**
 * triage-auth.js
 * Incluir en todos los módulos protegidos con:
 * <script src="triage-auth.js"></script>
 * ANTES de cualquier otro script.
 */
(function(){
  const STORAGE_SESION = 'triage_sesion';

  function getSesion(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_SESION)||'null'); }
    catch(e){ return null; }
  }

  function sesionValida(){
    const s=getSesion();
    if(!s||!s.expira) return false;
    return Date.now()<s.expira;
  }

  if(!sesionValida()){
    const dest=encodeURIComponent(window.location.href);
    window.location.href='triage-acceso.html?dest='+dest;
    return;
  }

  window.addEventListener('DOMContentLoaded',()=>{
    const s=getSesion();
    if(!s) return;

    const header=document.querySelector('header');
    if(!header) return;

    const badge=document.createElement('div');
    badge.id='sesion-badge';
    badge.style.cssText=`
      display:flex;align-items:center;gap:8px;
      font-family:'IBM Plex Mono',monospace;font-size:10px;
      color:rgba(255,255,255,.75);cursor:pointer;margin-left:auto;
    `;
    badge.title='Cerrar sesión';
    badge.onclick=()=>{
      if(confirm('¿Cerrar sesión?')){
        localStorage.removeItem(STORAGE_SESION);
        window.location.href='triage-acceso.html';
      }
    };
    header.appendChild(badge);

    function actualizarBadge(){
      const s=getSesion();
      if(!s) return;
      const restante=Math.max(0,Math.floor((s.expira-Date.now())/60000));
      const horas=Math.floor(restante/60);
      const mins=restante%60;
      const tiempoStr=horas>0?`${horas}h ${mins}m`:`${mins}m`;
      badge.innerHTML=`
        <div style="width:6px;height:6px;border-radius:50%;background:#C4A96A;"></div>
        <span>${s.nombre} · ${tiempoStr}</span>
        <span style="opacity:.5">🔒</span>
      `;
      if(restante<15){
        badge.style.color='#F4C842';
        badge.title='Sesión por expirar — Click para renovar';
        badge.onclick=()=>{
          window.location.href='triage-acceso.html?dest='+encodeURIComponent(window.location.href);
        };
      }
      if(restante<=0){
        localStorage.removeItem(STORAGE_SESION);
        window.location.href='triage-acceso.html?dest='+encodeURIComponent(window.location.href);
      }
    }
    actualizarBadge();
    setInterval(actualizarBadge,30000);
  });
})();
