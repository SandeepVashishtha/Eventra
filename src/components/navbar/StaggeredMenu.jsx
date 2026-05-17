import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import './StaggeredMenu.css';

export const StaggeredMenu = ({
  colors = ['#3b82f6', '#1d4ed8'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = 'currentColor',
  openMenuButtonColor = 'currentColor',
  accentColor = '#3b82f6',
  changeMenuColorOnOpen = true,
  onMenuOpen,
  onMenuClose,
  isOpen: externalOpen,
  setIsOpen: setExternalOpen,
  children
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;
  
  const openRef = useRef(open);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const iconRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const iconAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const line1 = line1Ref.current;
      const line2 = line2Ref.current;
      const line3 = line3Ref.current;
      const icon = iconRef.current;
      if (!panel || !line1 || !line2 || !line3 || !icon) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      // Ensure elements start outside
      gsap.set([panel, ...preLayers], { xPercent: 100 });
      
      // Sync icon with initial state
      if (open) {
        gsap.set(line2, { opacity: 0, scaleX: 0 });
        gsap.set(line1, { y: 0, rotate: 45 });
        gsap.set(line3, { y: 0, rotate: -45 });
        gsap.set(icon, { rotate: 90 });
        gsap.set([panel, ...preLayers], { xPercent: 0 });
      } else {
        gsap.set(line1, { y: -6, rotate: 0 });
        gsap.set(line2, { opacity: 1, scaleX: 1 });
        gsap.set(line3, { y: 6, rotate: 0 });
        gsap.set(icon, { rotate: 0 });
      }

      if (toggleBtnRef.current) {
        gsap.set(toggleBtnRef.current, { 
          color: open ? openMenuButtonColor : menuButtonColor 
        });
      }
    });
    return () => ctx.revert();
  }, [menuButtonColor, openMenuButtonColor]); // Added openMenuButtonColor to deps


  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    // Resetting for fresh animation
    gsap.set([panel, ...layers], { xPercent: 100 });

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 2 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });


    layers.forEach((el, i) => {
      tl.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });
    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0);
    const panelDuration = 0.65;
    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    const iconsStart = panelInsertTime + panelDuration * 0.45;
    const authStart = panelInsertTime + panelDuration * 0.5;

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );
    }

    const authContainer = panel.querySelector('.sm-auth-container');
    if (authContainer) {
      tl.fromTo(authContainer, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        authStart
      );
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          },
          socialsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    // Kill any active animations
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    
    // We mark busy to prevent multiple clicks during the short opening panels
    busyRef.current = true;
    
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);


  const playClose = useCallback(() => {
    // We don't mark busy here because we want the toggle to be immediately responsive
    // if the user clicks it again while it's closing.
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to(all, {
      xPercent: 100,
      duration: 0.35,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        busyRef.current = false;
      }
    });
  }, []);

  const animateIcon = useCallback(opening => {
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    const icon = iconRef.current;
    if (!line1 || !line2 || !line3 || !icon) return;

    iconAnimRef.current?.kill();
    const tl = gsap.timeline();
    iconAnimRef.current = tl;

    if (opening) {
      tl.to(line2, { opacity: 0, scaleX: 0, duration: 0.2, ease: 'power2.in' }, 0);
      tl.to(line1, { y: 0, rotate: 45, duration: 0.4, ease: 'back.out(1.7)' }, 0.1);
      tl.to(line3, { y: 0, rotate: -45, duration: 0.4, ease: 'back.out(1.7)' }, 0.1);
      tl.to(icon, { rotate: 90, duration: 0.5, ease: 'power2.out' }, 0);
    } else {
      tl.to(line1, { y: -6, rotate: 0, duration: 0.3, ease: 'power2.inOut' }, 0);
      tl.to(line3, { y: 6, rotate: 0, duration: 0.3, ease: 'power2.inOut' }, 0);
      tl.to(line2, { opacity: 1, scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0.1);
      tl.to(icon, { rotate: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
    }
  }, []);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  const toggleMenu = (e) => {
    // Basic interaction check
    if (busyRef.current) return;
    
    // Toggle state
    const target = !open;
    setOpen(target);
    
    // Animation logic
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
  };



  return (
    <div
      className={(className ? className + ' ' : '') + 'staggered-menu-wrapper'}
      style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />)}
      </div>
      <header className="staggered-menu-header">
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={toggleMenu}
          type="button"
        >
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={line1Ref} className="sm-icon-line" />
            <span ref={line2Ref} className="sm-icon-line" />
            <span ref={line3Ref} className="sm-icon-line" />
          </span>
        </button>
      </header>

      <aside ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" data-numbering={displayItemNumbering || undefined}>
            {items.map((it, idx) => (
              <li className="sm-panel-itemWrap" key={it.label + idx}>
                <Link 
                  className="sm-panel-item" 
                  to={it.link} 
                  onClick={toggleMenu}
                  aria-label={it.ariaLabel}
                >
                  <span className="sm-panel-itemLabel">{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="sm-extra-content">
            {children}
          </div>

          {displaySocials && socialItems.length > 0 && (
            <div className="sm-socials">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
