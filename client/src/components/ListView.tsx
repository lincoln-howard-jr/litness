import { useApp } from "../AppProvider";

export default function ListView () {
  const app = useApp ();

  return (
    <ul className="pin-list-view">
      {
        app.pins.distribution.map (({name, percent}) => (
          <li>
            {name}
          </li>
        ))
      }
    </ul>
  );
}