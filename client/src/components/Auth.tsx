import { useRef, useState } from "react";
import { useApp } from "../AppProvider";
import fmtPhoneNumber, { stripPhoneNumber } from "../lib/phonenumber";

const fmtRawPhoneNumber = (stripped:string) => {
  if (stripped.length > 10) stripped = stripped.substr (0, 10);
  if (stripped.length === 0) return stripped;
  if (stripped.length < 4) return `(${stripped}`;
  if (stripped.length < 7) return `(${stripped.substr (0, 3)}) ${stripped.substr (3)}`;
  return `(${stripped.substr (0, 3)}) ${stripped.substr (3, 3)}-${stripped.substr (6)}`;
}

export default function Auth () {
  // global state
  const {user: {isAuthenticated, promptForCode, authError, getCode, answer}} = useApp ();
  // local state
  const [rawNumber, setRawNumber] = useState<string> ('');
  const ref = useRef<HTMLInputElement> (null);

  if (isAuthenticated) return null;
  if (promptForCode) return (
    <div className="auth-container">
      <header>
        <p>We texted you a code! Enter it here!</p>
      </header>
      <input ref={ref} autoComplete="one-time-code" placeholder="Secret code here" />
      <button onClick={() => {if (ref.current?.value) answer (ref.current.value)}}>Send Code</button>
    </div>
  )
  return (
    <div className="auth-conatiner">
      <header>
        <h1>Litness Sign In</h1>
      </header>
      {
        authError &&
        <div className="error">{authError}</div>
      }
      <input type="text" placeholder="(012) 345-6789" autoComplete="off" onChange={e => setRawNumber (stripPhoneNumber (e.target.value))} value={fmtRawPhoneNumber (rawNumber)} ></input>
      <button onClick={() => {getCode (fmtPhoneNumber (rawNumber))}}>Sign In</button>
    </div>
  )
}