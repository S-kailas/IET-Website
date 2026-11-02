// Slow, smooth momentum scroll (Lenis) — the page glides to a stop
// instead of jumping straight to each wheel tick. Skipped for anyone
// who's asked their OS/browser for reduced motion, and safely no-ops
// (falls back to normal native scrolling) if the library failed to load.
if(typeof Lenis!=='undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    window.lenis=new Lenis({
        duration:1.6,                                    // higher = slower glide (Lenis default is 1.2)
        easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)),  // ease-out: quick start, slow settle
        autoRaf:true
    });
}

const root=document.documentElement;

// Exposes the navbar's real rendered height as --navbar-h so the hero's
// background glow (see .hero and the body::before "gap filler" in
// style.css) can share one exact center point even while the navbar is
// hidden and its space is only reserved, not visibly occupied.
const navbarEl=document.querySelector('.navbar');
function updateNavbarHeightVar(){
    if(navbarEl) root.style.setProperty('--navbar-h',navbarEl.offsetHeight+'px');
}
updateNavbarHeightVar();
window.addEventListener('resize',updateNavbarHeightVar);

const toggle=document.getElementById('themeToggle');
if(localStorage.getItem('iet-theme')==='dark') root.dataset.theme='dark';
if(toggle) toggle.addEventListener('click',()=>{const dark=root.dataset.theme==='dark';root.dataset.theme=dark?'light':'dark';localStorage.setItem('iet-theme',dark?'light':'dark');toggle.textContent=dark?'◐':'◑'});

// The navbar logo mark (.brand-mark) is drawn hidden (opacity:0) and only
// revealed by the "body.is-loaded" class. On the homepage that class is
// added by the full-screen loader's own inline script once its splash
// animation finishes. Every other page has no loader element at all, so
// that class was never added and the logo stayed invisible forever.
// Add it here immediately on any page that has no #pageLoader, so the
// logo shows up on every page without duplicating the splash screen.
if(!document.getElementById('pageLoader')){
    document.body.classList.add('is-loaded');
}

// Keep each event poster fully visible inside the shared card frame while
// using a blurred copy of the same image to fill any unused space. Event
// cards with multiple images crossfade through them; a single image stays put.
document.querySelectorAll('.event-image').forEach((frame)=>{
    const images=Array.from(frame.children).filter((child)=>child.tagName==='IMG');
    if(!images.length){
        return;
    }

    let activeIndex=Math.floor(Math.random()*images.length);
    const showImage=(index)=>{
        const activeImage=images[index];
        images.forEach((image,imageIndex)=>{
            image.classList.toggle('is-active',imageIndex===index);
        });
        frame.style.setProperty('--event-image',`url("${activeImage.currentSrc||activeImage.src}")`);
    };

    showImage(activeIndex);

    if(images.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        return;
    }

    frame.classList.add('has-slideshow');
    const scheduleNextSlide=()=>{
        const delay=3000+Math.random()*2000;
        window.setTimeout(()=>{
            let nextIndex=activeIndex;
            while(nextIndex===activeIndex){
                nextIndex=Math.floor(Math.random()*images.length);
            }
            activeIndex=nextIndex;
            showImage(activeIndex);
            scheduleNextSlide();
        },delay);
    };
    scheduleNextSlide();
});

const menu=document.getElementById('menuToggle'), links=document.querySelector('.nav-links'), navBar=document.querySelector('.navbar');
if(menu&&links&&navBar){
    const setMenuOpen=(open)=>{
        links.dataset.open=open?'1':'0';
        menu.classList.toggle('is-open',open);
        menu.setAttribute('aria-expanded',String(open));
        menu.setAttribute('aria-label',open?'Close menu':'Open menu');
        menu.textContent=open?'×':'☰';

        if(open){
            const navRect=navBar.getBoundingClientRect();
            links.style.setProperty('--mobile-nav-top',(navRect.bottom+10)+'px');
        }
    };

    setMenuOpen(false);
    menu.addEventListener('click',()=>setMenuOpen(links.dataset.open!=='1'));
    document.addEventListener('keydown',(event)=>{
        if(event.key==='Escape') setMenuOpen(false);
    });
    document.addEventListener('click',(event)=>{
        if(links.dataset.open==='1'&&!links.contains(event.target)&&!menu.contains(event.target)){
            setMenuOpen(false);
        }
    });
}

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

// Hero heading typewriter (homepage only — no-ops elsewhere since these
// elements don't exist on other pages).
// Sequence: type "Engineering ideas into" and hold it, then cycle the
// second word — type "Innovation", pause, erase, type "Solutions", pause,
// erase, type "Impact" and stop there for good.
(function(){
    const line1=document.getElementById('heroLine1');
    const line2=document.getElementById('heroLine2');
    if(!line1||!line2){
        return;
    }

    const LINE1_TEXT='Engineering ideas into';
    // Last word includes the trailing full stop so it types in as part
    // of the word and stays on screen once the sequence finishes.
    const WORDS=['Innovation','Solutions','Impact.'];

    const TYPE_SPEED=90;        // ms per character while typing
    const ERASE_SPEED=50;       // ms per character while erasing
    const HOLD_AFTER_TYPE=1600;  // pause on a fully-typed word before erasing it
    const HOLD_BEFORE_NEXT=300; // pause after erasing, before typing the next word

    function typeInto(el,text,speed,done){
        let i=0;
        el.textContent='';
        (function step(){
            if(i<text.length){
                el.textContent+=text.charAt(i);
                i++;
                setTimeout(step,speed);
            } else if(done){
                done();
            }
        })();
    }

    function eraseFrom(el,speed,done){
        (function step(){
            const text=el.textContent;
            if(text.length>0){
                el.textContent=text.slice(0,-1);
                setTimeout(step,speed);
            } else if(done){
                done();
            }
        })();
    }

    function runWord(idx){
        const word=WORDS[idx];
        const isLast=idx===WORDS.length-1;
        typeInto(line2,word,TYPE_SPEED,()=>{
            if(isLast){
                return; // stop here — the last word stays on screen
            }
            setTimeout(()=>{
                eraseFrom(line2,ERASE_SPEED,()=>{
                    setTimeout(()=>runWord(idx+1),HOLD_BEFORE_NEXT);
                });
            },HOLD_AFTER_TYPE);
        });
    }

    function startSequence(){
        typeInto(line1,LINE1_TEXT,TYPE_SPEED,()=>{
            setTimeout(()=>runWord(0),250);
        });
    }

    // The heading itself is invisible (opacity:0) until body gets
    // "is-loaded" — on the homepage that's added ~2s later by the splash
    // loader's own script. Watch for that instead of hardcoding a delay,
    // so this keeps working even if the loader's timing changes.
    if(document.body.classList.contains('is-loaded')){
        startSequence();
    } else {
        const observer=new MutationObserver(()=>{
            if(document.body.classList.contains('is-loaded')){
                observer.disconnect();
                // Matches .hero h1's own 0.32s reveal transition-delay,
                // so typing starts right as the heading fades into view.
                setTimeout(startSequence,320);
            }
        });
        observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    }
})();
