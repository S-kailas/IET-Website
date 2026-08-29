const root=document.documentElement;
const toggle=document.getElementById('themeToggle');
if(localStorage.getItem('iet-theme')==='dark') root.dataset.theme='dark';
if(toggle) toggle.addEventListener('click',()=>{const dark=root.dataset.theme==='dark';root.dataset.theme=dark?'light':'dark';localStorage.setItem('iet-theme',dark?'light':'dark');toggle.textContent=dark?'◐':'◑'});
const menu=document.getElementById('menuToggle'), links=document.querySelector('.nav-links'), navBar=document.querySelector('.navbar');
if(menu) menu.addEventListener('click',()=>{
    const open=links.dataset.open==='1';
    links.dataset.open=open?'0':'1';
    links.style.display=open?'':'flex';
    if(!open){
        // Position just below the floating pill navbar, wherever it currently sits
        const navRect=navBar.getBoundingClientRect();
        links.style.position='fixed';
        links.style.top=(navRect.bottom+10)+'px';
        links.style.left='14px';
        links.style.right='14px';
        links.style.padding='18px 22px';
        links.style.flexDirection='column';
        links.style.borderRadius='16px';
        links.style.border='1px solid color-mix(in srgb, var(--border-strong) 45%, transparent)';
        links.style.background='color-mix(in srgb, var(--bg) 82%, transparent)';
        links.style.backdropFilter='blur(18px) saturate(180%)';
        links.style.webkitBackdropFilter='blur(18px) saturate(180%)';
        links.style.boxShadow='0 12px 30px rgba(0, 0, 0, 0.25)';
    }
});

// Scroll-triggered fade-up reveals (sections, cards, forms)
// Gated behind the js-reveal class so content stays visible if this fails.
if('IntersectionObserver' in window){
    document.documentElement.classList.add('js-reveal');
    const revealEls=document.querySelectorAll('.split, .section-head, .event-card, .person, .value, .contact-item, .form-wrap');
    const revealObserver=new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
            if(entry.isIntersecting){
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    },{threshold:0.15,rootMargin:'0px 0px -60px 0px'});
    revealEls.forEach((el)=>revealObserver.observe(el));
}

// Thin scroll-progress bar, continuing the loader's progress bar
const scrollProgress=document.getElementById('scrollProgress');
if(scrollProgress){
    const updateScrollProgress=()=>{
        const scrollTop=window.scrollY||document.documentElement.scrollTop;
        const height=document.documentElement.scrollHeight-document.documentElement.clientHeight;
        const pct=height>0?(scrollTop/height)*100:0;
        scrollProgress.style.width=pct+'%';
    };
    window.addEventListener('scroll',updateScrollProgress,{passive:true});
    updateScrollProgress();
}