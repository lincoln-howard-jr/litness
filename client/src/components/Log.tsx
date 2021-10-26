import { useApp } from "../AppProvider";

export default function Log () {
  const app = useApp ();
  
  return (
    <div style={{display: 'none'}}>
      <ul>
        <li>[{app.location.coords.lng}, {app.location.coords.lat}]</li>
        {
          app.pins.pins.map (pin => (
            <li>{JSON.stringify (pin)}</li>
          ))
        }
      </ul>
    </div>
  )
}