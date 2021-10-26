import { useState } from "react";
import { useApp } from "../AppProvider";
import { fire, pin } from "../img";

export default function DropPin () {
  const app = useApp ();

  const [dropping, setDropping] = useState<boolean> (false);
  const [loading, setLoading] = useState <boolean> (false);
  const [litness, setLitness] = useState<number> (0);

  const startDropping = (litness: number) => async () => {
    try {
      setLoading (true);
      setDropping (false);
      setLitness (litness)
      await app.location.getPlaces ();
    } catch (e) {
      alert ('error while getting nearby places');
    }
  }

  if (!app.user.isAuthenticated || !app.location.locationAvailable) return null;
  if (app.location.places) return (
    <div className="drop-pin-backdrop">
      <div className="drop-pin place-list">
        <header>
          <h1>Select current location:</h1>
        </header>
        {
          app.location.places.map ((place:any) => (
            <div className="drop-pin place">
              <h3>{place.attributes.PlaceName}</h3>
            </div>
          ))
        }
      </div>
    </div>
  )
  if (loading) return (
    <div className="drop-pin-backdrop">
      <div className="drop-pin place-list">
        <div className="drop-pin place placeholder">
          <header>
            <h2></h2>
          </header>
        </div>
        <div className="drop-pin place placeholder">
          <header>
            <h2></h2>
          </header>
        </div>
        <div className="drop-pin place placeholder">
          <header>
            <h2></h2>
          </header>
        </div>
        <div className="drop-pin place placeholder">
          <header>
            <h2></h2>
          </header>
        </div>
        <div className="drop-pin place placeholder">
          <header>
            <h2></h2>
          </header>
        </div>
      </div>
    </div>
  )
  if (dropping) return (
    <div className="drop-pin-backdrop">
      <div className="drop-pin-list">
        <button onClick={() => setDropping (false)} className="fire-button cancel">X</button>
        <button onClick={startDropping (1)} className="fire-button one">
          <img src={fire} />
        </button>
        <button onClick={startDropping (2)} className="fire-button two">
          <img src={fire} />
          <img src={fire} />
        </button>
        <button onClick={startDropping (3)} className="fire-button three">
          <img src={fire} />
          <img src={fire} />
          <img src={fire} />
        </button>
        <button onClick={startDropping (4)} className="fire-button four">
          <img src={fire} />
          <img src={fire} />
          <img src={fire} />
          <img src={fire} />
        </button>
        <button onClick={startDropping (5)} className="fire-button five">
          <img src={fire} />
          <img src={fire} />
          <img src={fire} />
          <img src={fire} />
          <img src={fire} />
        </button>
      </div>
    </div>
  )
  return (
    <button onClick={() => setDropping (true)} className="drop-pin-button">
      <img src={pin} />
    </button>
  )
}