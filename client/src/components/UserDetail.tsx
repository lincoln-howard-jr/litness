import { useState } from "react";
import { useApp } from "../AppProvider";
import { check, pen } from "../img";

interface UserDetailProps {
  name: string;
  label: string;
}

export default function UserDetail (props: UserDetailProps) {
  const app = useApp ();

  const [editing, setEditing] = useState<boolean> (false);
  const [value, setValue] = useState<string> (app.user.detail (props.name) || '');

  if (!app.user.hasDetail (props.name)) return (
    <section>
      <label>{props.label}</label>
      <input value={value} onChange={e => setValue (e.target.value)} />
      <span onClick={() => app.user.createDetail (props.name, value)} className="clickable">
        <img src={check} />
      </span>
    </section>
  )
  if (editing) return (
    <section>
      <label>{props.label}</label>
      <input autoFocus value={value} onChange={e => setValue (e.target.value)} />
      <span onClick={() => app.user.createDetail (props.name, value)} className="clickable">
        <img src={check} />
      </span>
    </section>
  )
  return (
    <section>
      <label>{props.label}</label>
      <p>{app.user.detail (props.name)}</p>
      <span onClick={() => setEditing (true)} className="clickable">
        <img src={pen} />
      </span>
    </section>
  )
}