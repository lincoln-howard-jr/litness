import { MouseEvent, useEffect, useRef, useState } from "react";
import { useApp } from "../AppProvider";
import { cancel, caret, fire, pen, pin } from "../img";

export default function DropPin () {
  const app = useApp ();

  const ref = useRef<HTMLDivElement> (null);
  const [dropping, setDropping] = useState<boolean> (false);
  const [loading, setLoading] = useState <boolean> (false);
  const [litness, setLitness] = useState<number> (0);
  const [placeIndex, setPlaceIndex] = useState (0);
  const [customLocation, setCustomLocation] = useState<string> ('');
  const [selecting, setSelecting] = useState<boolean> (false);

  const reset = () => {
    setDropping (false);
    setLoading (false);
    setLitness (0);
    setPlaceIndex (0);
    setSelecting (false);
  }

  const exit = (e:MouseEvent<HTMLDivElement> | null) => {
    if (!e || e.target === ref.current) reset ();
  }

  const finish = async () => {
    try {
      if (placeIndex !== -1) await app.pins.createPin (litness, app.location.places [placeIndex].attributes.PlaceName, app.location.places [placeIndex].attributes.Place_addr);
      else await app.pins.createPin (litness, customLocation, 'unknown');
    } catch (e: any) {
      alert (e?.toString () || 'error while creating pin');
    } finally {
      exit (null);
    }
  }

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

  useEffect (() => {
    if (customLocation.length > 0) setPlaceIndex (-1);
  }, [selecting])

  if (!app.user.isAuthenticated || !app.location.locationAvailable) return null;
  if (app.location.places && litness > 0) return (
    <div className="drop-pin-backdrop">
      <div className="drop-pin place-list">
          <div onClick={reset} className="exit">
            <img src={cancel} />
          </div>
        <header>
          <h1>Select current location:</h1>
        </header>
        <button onClick={finish}>That's It!</button>
        <div onClick={() => setSelecting (!selecting)} className={selecting ? "select open" : "select"}>
          <h3>
            {placeIndex !== -1 && app.location.places [placeIndex].attributes.PlaceName}
            {placeIndex === -1 && customLocation}
          </h3>
          <span>
            <img src={caret} />
          </span>
        </div>
        <div className="select-dropdown">
          {
            app.location.places.map ((place:any, i: number) => i !== placeIndex && (
              <div onClick={() => {setPlaceIndex (i); setSelecting (false)}} className="select-option">
                <h3>{place.attributes.PlaceName}</h3>
                <address>{place.attributes.Place_addr}</address>
              </div>
            ))
          }
          <hr />
          <div className="select-dropdown-custom-place">
            <label>
              <input value={customLocation} onChange={e => setCustomLocation (e.target.value)} placeholder="Enter location here" />
              <span>
                <img src={pen} />
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
  if (loading) return (
    <div className="drop-pin-backdrop">
      <div className="drop-pin place-list">
          <div onClick={reset} className="exit">
            <img src={cancel} />
          </div>
        <header>
          <h1>Select current location:</h1>
        </header>
        <button onClick={finish}>That's It!</button>
        <div onClick={() => setSelecting (!selecting)} className={selecting ? "select open" : "select"}>
          <h3>...</h3>
          <span>
            <img src={caret} />
          </span>
        </div>
        <div className="select-dropdown">
          <div className="select-dropdown-custom-place">
            <label>
              <input value={customLocation} onChange={e => setCustomLocation (e.target.value)} placeholder="Enter location here" />
              <span>
                <img src={pen} />
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
  if (dropping) return (
    <div className="drop-pin-backdrop">
      <div className="drop-pin-list">
        <button onClick={() => setDropping (false)} className="fire-button cancel">
          <img src={cancel} />
        </button>
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