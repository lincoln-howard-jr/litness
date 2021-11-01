import { useApp } from "../AppProvider";
import { fire } from "../img";

export default function ListView () {
  const app = useApp ();

  if (!app.location.locationAvailable) return null;
  return (
    <div className="pin-list-view">
      <ul>
        <li>
          <span>
            <img src={fire} />
          </span>
          <span><h2>Top 5</h2></span>
        </li>
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