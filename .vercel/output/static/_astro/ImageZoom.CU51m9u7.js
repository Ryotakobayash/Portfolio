import{r as m}from"./index.WFquGv8Z.js";function c(){return m.useEffect(()=>{document.querySelectorAll(".prose img").forEach(s=>{const e=s;e.dataset.zoomEnabled||(e.dataset.zoomEnabled="true",e.style.cursor="zoom-in",e.style.transition="transform 150ms ease",e.addEventListener("click",()=>{const t=document.createElement("div");t.style.cssText=`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: zoom-out;
          padding: 20px;
        `;const n=document.createElement("img");if(n.src=e.src,n.alt=e.alt,n.style.cssText=`
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
          animation: zoomIn 200ms ease;
        `,!document.getElementById("zoom-styles")){const o=document.createElement("style");o.id="zoom-styles",o.textContent=`
            @keyframes zoomIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `,document.head.appendChild(o)}t.appendChild(n),document.body.appendChild(t),document.body.style.overflow="hidden",t.addEventListener("click",()=>{document.body.removeChild(t),document.body.style.overflow=""});const d=o=>{o.key==="Escape"&&(document.body.removeChild(t),document.body.style.overflow="",document.removeEventListener("keydown",d))};document.addEventListener("keydown",d)}))})},[]),null}export{c as default};
