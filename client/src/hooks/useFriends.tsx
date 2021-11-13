import { useEffect, useState } from "react";
import { UserDetail, UserHook } from "./useUser";

interface Friend {
  id: string;
  relationshipTo: string;
  relationshipFrom: string;
  isSubscribed: boolean;
  litnessThreshold: number;
  dateCreated: number;
  userDetails: UserDetail[];
}

export interface FriendsHook {
  friends: Friend[];
  createFriendship: (relationshipTo: string) => Promise<void>;
}

export const mockUseFriends:FriendsHook = {
  friends: [],
  createFriendship: () => new Promise (r => r)
}

export default function useFriends (user: UserHook):FriendsHook {
  const [friends, setFriends] = useState<Friend[]> ([]);

  const getFriends = async () => new Promise<void> (async (resolve, reject) => {
    try {
      const req = await fetch ('https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/relationships', {
        headers: user.headers.get
      });
      const data = (await req.json ()) as Friend[];
      setFriends (data);
      resolve ();
    } catch (e) {
      reject (e);
    }
  })

  const createFriendship = async (relationshipTo: string) => new Promise<void> (async (resolve, reject) => {
    try {
      const req = await fetch ('https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/relationships', {
        method: 'post',
        headers: user.headers.post,
        body: JSON.stringify ({
          relationshipTo
        })
      });
      resolve ();
    } catch (e) {
      reject (e);
    }
  })

  useEffect (() => {
    if (user.isAuthenticated) getFriends ();
  }, [user.isAuthenticated])

  return {
    friends,
    createFriendship
  };
}