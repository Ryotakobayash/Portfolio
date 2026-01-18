import{r}from"./index.WFquGv8Z.js";function l(){return r.useEffect(()=>{document.querySelectorAll("pre").forEach(e=>{if(e.querySelector(".code-copy-btn"))return;const t=document.createElement("button");t.className="code-copy-btn",t.textContent="コピー",t.setAttribute("aria-label","コードをコピー"),t.style.cssText=`
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 8px;
        font-size: 0.75rem;
        background-color: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;
        opacity: 0;
      `,e.addEventListener("mouseenter",()=>{t.style.opacity="1"}),e.addEventListener("mouseleave",()=>{t.style.opacity="0"}),t.addEventListener("click",async()=>{const o=e.querySelector("code");if(o)try{await navigator.clipboard.writeText(o.textContent||""),t.textContent="コピーしました！",t.style.backgroundColor="var(--color-accent)",t.style.color="white",t.style.borderColor="var(--color-accent)",setTimeout(()=>{t.textContent="コピー",t.style.backgroundColor="var(--color-bg-secondary)",t.style.color="var(--color-text-secondary)",t.style.borderColor="var(--color-border)"},2e3)}catch{t.textContent="エラー",setTimeout(()=>{t.textContent="コピー"},2e3)}}),e.style.position="relative",e.appendChild(t)})},[]),null}export{l as default};
