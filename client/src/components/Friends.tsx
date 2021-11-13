import { useApp } from "../AppProvider";

export default function Friends () {
  const app = useApp ();

  return (
    <>
      {
        app.friends.friends.map (friend => (
          <section>
            <label>{friend.userDetails.find (d => d.attributeName === 'Nickname') || friend.relationshipFrom}</label>
            <p>Friends since {new Date (friend.dateCreated).toString ()}</p>
            <span></span>
          </section>
        ))
      }
    </>
  )
}