import React, { MouseEvent, useRef, useState } from "react";
import { useApp } from "../AppProvider";
import { fire } from "../img";

interface Switcher {
  [key: string]: string
}

const switcher:Switcher = {
  'pin-list-view': 'pin-list-view hidden',
  'pin-list-view hidden': 'pin-list-view'
}

export default function ListView () {
  const app = useApp ();
  const backdropRef = useRef<HTMLDivElement> (null);

  const [open, setOpen] = useState<boolean> (false);
  const close = (e:MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) setOpen (false);
  }
  
  if (!app.pins.distribution.length) return null;
  if (!open) return (
    <button className="action-button list-view-button" onClick={() => setOpen (true)}>
      <img src={fire} />
    </button>
  )
  return (
    <div ref={backdropRef} className="overlay-backdrop" onClick={close}>
      <div className="overlay-panel pin-list-view">
        <header>
          <span><img src={fire} /></span>
          <h1>Top Spots</h1>
        </header>
        <hr />
        <ul>
          {
            app.pins.distribution.filter ((_, i) => i < 5).map (({name, address, lat, lng}, i) => (
              <li onClick={() => {setOpen (false); app.location.setCoords (lat, lng)}}>
                <span>{i + 1}.</span>
                <span>{name}</span>
                <span/>
                <address>{address}</address>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  )
  
}