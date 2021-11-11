import { MouseEvent, useEffect, useRef, useState } from "react";
import { useApp } from "../AppProvider";
import { cancel, fire, pin, plus } from "../img";

export default function DropPin () {
  const app = useApp ();

  const ref = useRef<HTMLDivElement> (null);
  const [dropping, setDropping] = useState<boolean> (app.router.qsp.has ('is-dropping'));
  const [litness, setLitness] = useState<number> (0);
  const [customLocation, setCustomLocation] = useState<string> ('');

  const backdropRef = useRef<HTMLDivElement> (null);

  const close = (e:MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) reset ();
  }

  const reset = () => {
    setDropping (false);
    setLitness (0);
  }

  const exit = (e:MouseEvent<HTMLDivElement> | null) => {
    if (!e || e.target === ref.current) reset ();
  }

  const finish = async (name: string, addy: string, _litness=litness) => {
    try {
      await app.pins.createPin (_litness, name, addy);
    } catch (e: any) {
      alert (e?.toString () || 'error while creating pin');
    } finally {
      exit (null);
    }
  }

  const startDropping = (litness: number) => async () => {
    try {
      if (app.router.qsp.has ('is-dropping')) {
        let name = app.router.qsp.get ('name');
        let addy = app.router.qsp.get ('addy');
        if (!name || !addy) throw new Error ('Addy and name not defined by query string');
        return await finish (name, addy, litness);
      }
      setDropping (false);
      setLitness (litness)
      await app.location.getPlaces ();
    } catch (e) {
      alert ('error while getting nearby places');
    }
  }

  if (litness > 0) return (
    <div ref={backdropRef} onClick={close} className="overlay-backdrop drop-pin-backdrop">
      <div className="overlay-panel drop-pin place-list">
        <header>
          <h1>Select current location:</h1>
        </header>
        {
          app.location.places.map ((place: any) => (
            <div onClick={() => {finish (place.attributes.PlaceName, place.attributes.Place_addr)}} className="select-option">
              <h3>{place.attributes.PlaceName}</h3>
              <address>{place.attributes.Place_addr}</address>
            </div>
          ))
        }
        <hr />
        <div className="select-dropdown-custom-place">
          <label>
            <input value={customLocation} onChange={e => setCustomLocation (e.target.value)} placeholder="Enter location here" />
            <span onClick={() => {finish (customLocation, 'unknown')}}>
              <img src={plus} />
            </span>
          </label>
        </div>
      </div>
    </div>
  )
  if (dropping) return (
    <div ref={backdropRef} onClick={close} className="overlay-backdrop drop-pin-backdrop">
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
    <button onClick={() => setDropping (true)} className="action-button drop-pin-button">
      <img src={pin} />
    </button>
  )
}