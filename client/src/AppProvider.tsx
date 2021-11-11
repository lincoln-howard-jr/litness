import { createContext, useContext, useState } from "react";
import useLocation, { LocationHook, mockUseLocation } from "./hooks/useLocation";
import usePins, { mockUsePins, PinsHook } from "./hooks/usePins";
import useRouter, { mockUseRouter, RouterHook } from "./hooks/useRouter";
import useUser, { mockUseUser, UserHook } from "./hooks/useUser";

interface AppProviderProps {
  children: JSX.Element
}

export interface FreezeFn {
  (): () => void;
}

interface ContextValue {
  freeze: FreezeFn;
  user: UserHook;
  pins: PinsHook;
  location: LocationHook;
  router: RouterHook;
}

const defaultValue:ContextValue = {
  freeze: ()=>()=>{},
  user: mockUseUser,
  pins: mockUsePins,
  location: mockUseLocation,
  router: mockUseRouter
}

// react context api
const AppContext = createContext<ContextValue> (defaultValue);
export const useApp = () => useContext (AppContext);

export default function AppProvider (props: AppProviderProps) {
  
  const [frozen, setFrozen] = useState<string> ('none');
  const freeze = () => {
    setFrozen ('frozen')

    return function unfreeze () {
      setFrozen ('none');
    }
  }

  const user = useUser (freeze);
  const location = useLocation ();
  const pins = usePins (user, location, freeze);
  const router = useRouter ();

  const value:ContextValue = {
    freeze,
    user,
    pins,
    location,
    router
  }

  return (
    <AppContext.Provider value={value}>
      <div className={`freeze ${frozen}`} />
      {props.children}
    </AppContext.Provider>
  )
  
}