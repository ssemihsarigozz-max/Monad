"use client";

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Hero() {
  const { state, notify } = useApp();
  return (
    <section className="hero">
      <div className="hero-index"><span>[ CAMPUS COORDINATION PROTOCOL ]</span><span>MONAD / 10143</span></div>
      <div className="hero-copy">
        <h1>GOOD THINGS<br/>TAKE <span>CONSENSUS.</span></h1>
        <div className="hero-bottom">
          <p>The library doesn’t have to close yet.<br/>Neither does the night.<br/><strong>Get together. Stay longer. Give back.</strong></p>
          <div className="hero-actions">
            <a className="primary" href="#coordinate">MAKE MORE TIME <ArrowDownRight size={20}/></a>
            <button className="text-button" onClick={() => notify('Connect → commit 1 demo MON → 2 supporters unlock 30 extra minutes. Successful contributions fund charity. Failed commitments are refundable.')} >[ HOW IT WORKS ] <ArrowUpRight size={13}/></button>
          </div>
        </div>
      </div>
      <div className="campus-print" aria-hidden="true">
        <div className="time-sticker"><strong>+30′</strong><span>STAY A LITTLE</span><span>LONGER ↗</span></div>
        <div className="print-top"><span>FIG. 01 — THE EXTRA HALF HOUR</span><span>↗</span></div>
        <svg viewBox="0 0 500 380" fill="none" className="campus-drawing">
          <defs><pattern id="lines" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="currentColor" strokeWidth=".5"/></pattern></defs>
          <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
            <path d="M34 262 244 144 470 269 262 387Z" strokeDasharray="3 5"/>
            <path d="m100 203 132-75 152 86-132 76Z" fill="var(--paper)"/>
            <path d="M100 203v64l152 85v-62Zm152 87 132-76v64l-132 74Z" fill="var(--paper)"/>
            <path d="M126 187v-72l105-61 125 71v73l-104 60Z" fill="var(--paper)"/>
            <path d="m126 115 126 71 104-61M252 186v72M231 54v70l125 74M126 187l105-63 21 12"/>
            <path d="m126 115 105-61 125 71-104 61Z" fill="url(#lines)"/>
            <path d="m144 151 15 9v24l-15-9Zm29 17 15 9v24l-15-9Zm29 17 15 9v24l-15-9Zm72 9 16-9v24l-16 9Zm31-18 16-9v24l-16 9Z" fill="var(--ink)"/>
            <path d="m121 240 16 9v29l-16-9Zm29 17 16 9v29l-16-9Zm29 17 16 9v29l-16-9Zm30 17 17 9v29l-17-9Zm64 11 17-10v29l-17 10Zm32-18 17-10v29l-17 10Zm32-19 17-10v29l-17 10Z"/>
            <path d="m195 80 36-21 48 27-37 21Z" fill="var(--accent)"/><path d="M242 107v28l37-21V86M195 80v28l47 27"/>
            <path d="M73 293v-37m-13 9 13-25 14 25-14 8-13-8Z" fill="var(--paper)"/>
            <path d="M413 308v-37m-13 9 13-25 14 25-14 8-13-8Z" fill="var(--paper)"/>
            <path d="M34 203h47m-23-23v47M410 154h47m-23-23v47" strokeWidth=".7"/>
            <path d="M379 82h58v44h-58Z" fill="var(--accent)"/><path d="m356 126 23-22"/>
          </g>
          <text x="387" y="110" fill="var(--ink)" fontSize="17" fontFamily="monospace">+30′</text>
          <text x="30" y="340" fill="var(--ink)" fontSize="9" fontFamily="monospace" transform="rotate(-30 30 340)">OPEN BY COLLECTIVE DEMAND</text>
        </svg>
        <div className="print-bottom"><span>01 COMMIT → 02 UNLOCK → 03 GIVE</span><span>© CtC</span></div>
      </div>
      <div className="campus-ticker" aria-label="Your campus. Your call. Make more time. Do more good.">
        <div className="ticker-track" aria-hidden="true">
          {[0, 1, 2, 3].map(i => <span key={i}>YOUR CAMPUS. YOUR CALL. <b>↗</b> MAKE MORE TIME. <b>✳</b> DO MORE GOOD. <b>↗</b> CONSENSUS THEN CHARITY. <b>✳</b></span>)}
        </div>
      </div>
      <div className="metrics">
        <div><small>THE CONSENSUS</small><strong>02 <span>people</span></strong></div>
        <div><small>THE EXTENSION</small><strong>30 <span>minutes</span></strong></div>
        <div><small>THE COLLECTIVE GOOD</small><strong>{state.treasury.toFixed(2)} <span>MON</span></strong></div>
        <div className="metric-manifesto">OUR TIME.<br/>OUR CAMPUS.<br/><span>OUR CALL. ↗</span></div>
      </div>
    </section>
  );
}
