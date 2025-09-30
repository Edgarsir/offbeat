import './OffbeatAnimation.css';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const OffbeatAnimation = () => {
  const preloaderRef = useRef(null);
  const preloaderCounterRef = useRef(null);
  const mainContainerRef = useRef(null);
  const slidesContainerRef = useRef(null);
  const marqueeTopRef = useRef(null);
  const marqueeBottomRef = useRef(null);
  const marqueeContainerRef = useRef(null);
  const foregroundRef = useRef(null);
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  const desktopSlideData = [
    { bgImage: 'https://earcouture.jp/asset/img/home/mv_01.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mv_02.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mv_03.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mv_04.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mv_05.jpg' }
  ];

  const mobileSlideData = [
    { bgImage: 'https://earcouture.jp/asset/img/home/mvsp_01.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mvsp_02.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mvsp_03.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mvsp_04.jpg' },
    { bgImage: 'https://earcouture.jp/asset/img/home/mvsp_05.jpg' }
  ];

  useEffect(() => {
    let masterTimeline, preloaderTl;
    let onParallaxMove, onScroll, onMouseMove;
    let animateFollowerId;

    const initializeAnimation = () => {
      const isMobile = window.innerWidth <= 768;
      const activeSlideData = isMobile ? mobileSlideData : desktopSlideData;
      const slidesContainer = slidesContainerRef.current;

      // Clear existing slides
      slidesContainer.innerHTML = '';

      // Create slides
      activeSlideData.forEach((data, i) => {
        const slide = document.createElement('div');
        slide.classList.add('ob-slide');
        slide.style.backgroundImage = `url(${data.bgImage})`;
        slide.dataset.index = i.toString();

        const layer = document.createElement('div');
        layer.className = 'parallax-layer parallax';
        layer.style.backgroundImage = `url(${data.bgImage})`;
        layer.dataset.depth = (0.8 + Math.random() * 0.6).toFixed(2);
        slide.appendChild(layer);

        slidesContainer.appendChild(slide);
      });

      const slides = gsap.utils.toArray('.ob-slide');
      gsap.set(slides[0], { opacity: 1, visibility: 'visible', scale: 1 });

      // Main timeline
      masterTimeline = gsap.timeline({ 
        repeat: -1, 
        defaults: { duration: 1.5, ease: 'power2.inOut' } 
      });
      
      slides.forEach((slide, index) => {
        const nextIndex = (index + 1) % slides.length;
        const nextSlide = slides[nextIndex];

        masterTimeline
          .to(slide, { scale: 1, opacity: 0, duration: 4, ease: 'power1.inOut' })
          .to(nextSlide, { 
            opacity: 1, 
            visibility: 'visible', 
            duration: 1.5, 
            ease: 'power2.inOut' 
          }, ">-1.5")
          .set(slide, { visibility: 'hidden', scale: 1.05 });
      });

      // Marquee animations (use refs, not IDs)
      if (marqueeTopRef.current && marqueeBottomRef.current) {
        gsap.to(marqueeTopRef.current.querySelector('.ob-marquee-content'), { 
          yPercent: -50, 
          duration: 25, 
          ease: 'linear', 
          repeat: -1 
        });
        gsap.to(marqueeBottomRef.current.querySelector('.ob-marquee-content'), { 
          yPercent: 50, 
          duration: 25, 
          ease: 'linear', 
          repeat: -1 
        });
      }

      // Preloader animation
      gsap.set(mainContainerRef.current, { autoAlpha: 0 });
      const counter = { value: 0 };
      const counterElement = preloaderCounterRef.current;
      preloaderTl = gsap.timeline();
      
      preloaderTl
        .to(['.ob-preloader-logo', '.ob-preloader-counter'], { 
          autoAlpha: 1, 
          duration: 1, 
          ease: 'power2.inOut' 
        })
        .to(counter, { 
          value: 100, 
          duration: 2.5, 
          ease: 'power2.inOut', 
          onUpdate: () => { 
            if (counterElement) {
              counterElement.textContent = Math.round(counter.value); 
            }
          } 
        }, "-=0.5")
        .to(['.ob-preloader-logo', '.ob-preloader-counter'], { 
          autoAlpha: 0, 
          duration: 1, 
          ease: 'power2.inOut' 
        }, "+=0.5")
        .to(preloaderRef.current, { 
          autoAlpha: 0, 
          duration: 1.2, 
          ease: 'power3.inOut' 
        })
        .to(mainContainerRef.current, { 
          autoAlpha: 1, 
          duration: 1.5, 
          ease: 'power2.inOut' 
        }, "-=1.2");

      // Cursor implementation
      const cursor = cursorRef.current;
      const follower = followerRef.current;
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let posX = mouseX;
      let posY = mouseY;

      const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

      onMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursor) {
          cursor.style.left = mouseX + 'px';
          cursor.style.top = mouseY + 'px';
        }
      };

      const animateFollower = () => {
        posX = lerp(posX, mouseX, 0.16);
        posY = lerp(posY, mouseY, 0.16);
        if (follower) {
          follower.style.left = posX + 'px';
          follower.style.top = posY + 'px';
        }
        animateFollowerId = requestAnimationFrame(animateFollower);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.remove('hidden');
        if (follower) follower.classList.remove('hidden');
      });
      window.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.add('hidden');
        if (follower) follower.classList.add('hidden');
      });
      animateFollower();

      // Interactive elements hover effects
      const interactives = document.querySelectorAll('a, button, .interactive');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (cursor) cursor.classList.add('hover');
          if (follower) follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          if (cursor) cursor.classList.remove('hover');
          if (follower) follower.classList.remove('hover');
        });
      });

      // Mouse move parallax
      const isTouch = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      if (!isTouch()) {
        onParallaxMove = (e) => {
          const cx = (e.clientX / window.innerWidth) - 0.5;
          const cy = (e.clientY / window.innerHeight) - 0.5;

          const layers = document.querySelectorAll('.parallax-layer');
          layers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth || 1);
            const moveX = cx * 20 * depth;
            const moveY = cy * 20 * depth;
            const scale = 1 + (depth - 1) * 0.03;
            layer.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
          });

          if (marqueeContainerRef.current) {
            marqueeContainerRef.current.style.transform = `translateX(calc(-50% + ${-cx * 30}px))`;
          }
        };
        window.addEventListener('mousemove', onParallaxMove);
      }

      // Scroll parallax
      onScroll = () => {
        const scrolled = window.scrollY;
        if (foregroundRef.current) {
          foregroundRef.current.style.transform = `translateY(${scrolled * 0.05}px)`;
        }
        if (marqueeContainerRef.current) {
          marqueeContainerRef.current.style.transform = `translateX(-50%) translateY(${scrolled * 0.02}px)`;
        }
        document.querySelectorAll('.ob-slide').forEach(slide => {
          const rect = slide.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const rel = (rect.top / window.innerHeight);
            const layers = slide.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
              const depth = parseFloat(layer.dataset.depth || 1);
              layer.style.transform = `translateY(${rel * 30 * (1 - depth)}px)`;
            });
          }
        });
      };
      window.addEventListener('scroll', onScroll);
    };

    initializeAnimation();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      if (onParallaxMove) window.removeEventListener('mousemove', onParallaxMove);
      if (animateFollowerId) cancelAnimationFrame(animateFollowerId);
      if (masterTimeline) masterTimeline.kill();
      if (preloaderTl) preloaderTl.kill();
    };
  }, []);

  return (
    <section className="section2">
      {/* Preloader */}
      <div className="ob-preloader" ref={preloaderRef}>
        <div className="ob-preloader-logo">Offbeat</div>
        <div className="ob-preloader-counter" ref={preloaderCounterRef}>
          0
        </div>
      </div>

      {/* Main Container */}
      <div className="ob-main-container" ref={mainContainerRef}>
        <div className="ob-slides-container" ref={slidesContainerRef}></div>

        <div className="ob-foreground-content" ref={foregroundRef}>
          <header className="ob-header">
            <div className="ob-logo">Offbeat</div>
            <nav className="ob-nav">
              <a href="#" className="interactive">JOURNAL</a>
              <a href="#" className="interactive">ABOUT</a>
            </nav>
          </header>

          <div className="ob-marquee-container parallax" ref={marqueeContainerRef}>
            <div className="ob-marquee-text ob-marquee-top parallax" ref={marqueeTopRef}>
              <span className="ob-marquee-content">
                COLLECTION EARPHONE HEADPHONE PLAYERACCESSORY EAR PIECE ALL COLLECTIONS&nbsp;
              </span>
            </div>
            <div className="ob-marquee-text ob-marquee-bottom parallax" ref={marqueeBottomRef}>
              <span className="ob-marquee-content">
                COLLECTION EARPHONE HEADPHONE PLAYERACCESSORY EAR PIECE ALL COLLECTIONS&nbsp;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Cursor */}
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-follower" ref={followerRef}></div>
    </section>
  );
};

export default OffbeatAnimation;