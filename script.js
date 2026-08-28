const root=document.documentElement;
const toggle=document.getElementById('themeToggle');
if(localStorage.getItem('iet-theme')==='dark') root.dataset.theme='dark';
if(toggle) toggle.addEventListener('click',()=>{const dark=root.dataset.theme==='dark';root.dataset.theme=dark?'light':'dark';localStorage.setItem('iet-theme',dark?'light':'dark');toggle.textContent=dark?'◐':'◑'});
const menu=document.getElementById('menuToggle'), links=document.querySelector('.nav-links');
if(menu) menu.addEventListener('click',()=>{const open=links.dataset.open==='1';links.dataset.open=open?'0':'1';links.style.display=open?'':'flex';if(!open){links.style.position='absolute';links.style.top='70px';links.style.left='0';links.style.right='0';links.style.padding='18px 32px';links.style.flexDirection='column';links.style.background='var(--bg)';links.style.borderBottom='1px solid var(--border)'}});

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