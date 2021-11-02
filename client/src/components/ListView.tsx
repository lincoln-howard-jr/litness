import { useState } from "react";
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

  const [className, setClassName] = useState<string> ('pin-list-view');

  if (!app.location.locationAvailable) return null;
  return (
    <div className={className} onClick={() => setClassName (switcher [className])}>
      <ul>
        <li>
          <span>
            <img src={fire} />
          </span>
          <span><h2>Top 5</h2></span>
        </li>
        <hr />
        {
          app.pins.distribution.filter ((_, i) => i < 5).map (({name}, i) => (
            <li>
              <span>{i + 1}.</span>
              <span>{name}</span>
            </li>
          ))
        }
      </ul>
      <span className="minimize">hide</span>
    </div>
  );
}