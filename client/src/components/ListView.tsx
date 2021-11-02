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

  const [className, setClassName] = useState<string> ('pin-list-view hidden');
  const close = (e:MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) setClassName ('pin-list-view hidden');
  }
  if (!app.location.locationAvailable) return null;
  return (
    <>
      <div ref={backdropRef} className={className} onClick={close}>
        <ul>
          <header>
            <span><img src={fire} /></span>
            <h1>Top 5</h1>
          </header>
          <hr />
          {
            app.pins.distribution.filter ((_, i) => i < 5).map (({name, address, lat, lng}, i) => (
              <li onClick={() => {setClassName ('pin-list-view hidden'); app.location.setCoords (lat, lng)}}>
                <span>{i + 1}.</span>
                <span>{name}</span>
                <span/>
                <address>{address}</address>
              </li>
            ))
          }
        </ul>
      </div>
      <button onClick={() => setClassName (switcher [className])}>
        <img src={fire} />
      </button>
    </>
  );
}