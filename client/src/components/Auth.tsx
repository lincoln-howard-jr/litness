import { MouseEvent, useRef, useState } from "react";
import { useApp } from "../AppProvider";
import { cancel, pen, person } from "../img";
import fmtPhoneNumber, { stripPhoneNumber } from "../lib/phonenumber";
import UserDetail from "./UserDetail";

const fmtRawPhoneNumber = (stripped:string) => {
  if (stripped.length > 10) stripped = stripped.substr (0, 10);
  if (stripped.length === 0) return stripped;
  if (stripped.length < 4) return `(${stripped}`;
  if (stripped.length < 7) return `(${stripped.substr (0, 3)}) ${stripped.substr (3)}`;
  return `(${stripped.substr (0, 3)}) ${stripped.substr (3, 3)}-${stripped.substr (6)}`;
}

export default function Auth () {
  // global state
  const {user: {isAuthenticated, promptForCode, authError, hasDetail, detail, getCode, answer}} = useApp ();
  // local state
  const [open, setOpen] = useState<boolean> (false);
  const [rawNumber, setRawNumber] = useState<string> ('');
  const [error, setError] = useState<string | null> (null)
  const backdropRef = useRef<HTMLDivElement> (null);
  const ref = useRef<HTMLInputElement> (null);

  const runGetCode = () => {
    try {
      getCode (fmtPhoneNumber (rawNumber))
    } catch (e: any) {
      setError (e?.toString () || 'number not correct');
    }
  }

  const close = (e:MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) setOpen (false);
  }

  if (isAuthenticated && open) return (
    <div ref={backdropRef} className="overlay-backdrop" onClick={close}>
      <div className="overlay-panel profile view">
        <header>
          <span />
          <h2>It's Lit, Fam!</h2>
          <span />
        </header>
        <header>
          <span />
          <p>Enter some basic information about yourself. Only your buds can see this!</p>
          <span />
        </header>
        <UserDetail name="Nickname" label="What is your nickname?" />
        <UserDetail name="Favorite Place" label="What is your favorite place?" />
        <header>
          <span />
          <h2>Your Friends</h2>
          <span/>
        </header>
      </div>
    </div>
  )
  if (isAuthenticated) return (
    <button className="action-button auth-button" onClick={() => setOpen (true)}>
      <img src={person} />
    </button>
  )
  if (promptForCode) return (
    <>
      <div ref={backdropRef} className="overlay-backdrop" onClick={close}>
        <div className="overlay-panel auth code">
          <header>
            <p>We texted you a code! Enter it here!</p>
          </header>
          <input ref={ref} autoComplete="one-time-code" placeholder="Secret Code!" />
          <button onClick={() => {if (ref.current?.value) answer (ref.current.value)}}>Send Code</button>
        </div>
      </div>
    </>
  )
  if (open) return (
    <>
      <div ref={backdropRef} className="overlay-backdrop" onClick={close}>
        <div className="overlay-panel auth login">
          <header>
            <h1>Litness Sign In</h1>
          </header>
          <hr />
          {
            authError &&
            <div className="error">{authError}</div>
          }
          {
            error &&
            <div className="error">{error}</div>
          }
          <input type="text" placeholder="(012) 345-6789" autoComplete="off" onChange={e => setRawNumber (stripPhoneNumber (e.target.value))} value={fmtRawPhoneNumber (rawNumber)} ></input>
          <button onClick={runGetCode}>Sign In</button>
        </div>
      </div>
    </>
  )
  return (
    <button className="action-button auth-button" onClick={() => setOpen (true)}>
      <img src={person} />
    </button>
  )
}