import { useEffect, useState } from "react"

const apiKey = 'AAPK827c8d799c9f479bb6527fdfe01819026nJ4HXONEvXwkFIsjOMskDVGFYKeCgUGlZi9lgE2xnlQ7ROGR9D3ypGuaHv4XcNb';
const arcgis = (window as any).arcgisRest;
let authentication = new arcgis.ApiKey({
  key: apiKey
});

export interface LocationHook {
  locationAvailable: boolean;
  places: any;
  coords: {
    lat: number | null,
    lng: number | null
  };
  setCoords: (lat: number, lng: number) => void;
  getPlaces: () => Promise<void>;
}
export const mockUseLocation:LocationHook = {
  locationAvailable: false,
  places: null,
  coords: {
    lat: null,
    lng: null
  },
  setCoords: (lat: number, lng: number) => {},
  getPlaces: () => new Promise (r => {})
}
export default function useLocation ():LocationHook {
  const [locationAvailable, setLocationAvailable] = useState<boolean> (false);
  const [places, setPlaces] = useState<any []> ([]);
  const [lat, setLat] = useState<number | null> (null);
  const [lng, setLng] = useState<number | null> (null);

  const setCoords = (lat: number, lng: number) => {
    setLat (lat);
    setLng (lng);
  }

  const getPlaces = async () => new Promise<void> (async (resolve, reject) => {
    try {
      let response = await arcgis.geocode ({
        params: {
          category: 'Nightlife Spot',
          location: `${lng},${lat}`,
          distance: 25,
          maxLocations: 5
        },
        outFields: '*',
        authentication
      })
      setPlaces (response.candidates)
      resolve ();
    } catch (e) {
      console.log (e);
      reject ();
    }
  })

  const success = (pos:GeolocationPosition) => {
    console.log ('success');
    setLat (pos.coords.latitude);
    setLng (pos.coords.longitude);
    setLocationAvailable (true);
  }

  const error = (e: any) => {
    setLocationAvailable (false);
    setLat (null);
    setLng (null);
    console.log ('#watch position error', e);
  }

  const init = () => {
    let wid = window.navigator.geolocation.watchPosition (success, error, {
      enableHighAccuracy: true,
      timeout: 3000
    });
    return () => {
      window.navigator.geolocation.clearWatch (wid);
    }
  }

  useEffect (init, []);

  return {
    locationAvailable,
    places,
    coords: {
      lat,
      lng
    },
    setCoords,
    getPlaces
  }
}