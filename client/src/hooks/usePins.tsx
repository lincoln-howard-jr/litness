import { fromLonLat } from "ol/proj";
import { useEffect, useState } from "react";
import { FreezeFn } from "../AppProvider";
import { LocationHook } from "./useLocation";
import { UserHook } from "./useUser";

interface Distribution {
  name: string;
  address: string;
  litness: number;
  lat: number;
  lng: number;
}

interface Pin {
  litness: number;
  lat: number;
  lng: number;
  datetimeDropped: number;
  placeName: string;
  placeAddress: string;
}

interface Feature {
  type: string,
  geometry: {
    type: string,
    coordinates: number[],
  },
  properties: any
}

interface PointFeatureSet {
  type: string;
  features: Feature[];
}

export interface PinsHook {
  iter: number;
  pins: Pin[];
  featureSet: PointFeatureSet;
  distribution: Distribution[];
  pinErr: null | string;
  getPins: () => void;
  createPin: (litness: number, placeName: string, placeAddress: string) => Promise<void>;
}

export const mockUsePins:PinsHook = {
  iter: 0,
  pins: [],
  featureSet: {
    type: 'FeatureCollection',
    features: []
  },
  distribution: [],
  pinErr: null,
  getPins: () => {},
  createPin: ()=>new Promise (r => r)
}

export default function usePins (user: UserHook, location: LocationHook, freeze: FreezeFn):PinsHook {
  const [iter, setIter] = useState<number> (mockUsePins.iter);
  const [pins, setPins] = useState<Pin[]> (mockUsePins.pins);
  const [featureSet, setFeatureSet] = useState<PointFeatureSet> (mockUsePins.featureSet)
  const [distribution, setDistribution] = useState<Distribution[]> ([]);
  const [pinErr, setError] = useState<null | string> (mockUsePins.pinErr);
  const getPins = async () => {
    try {
      let req = await fetch (`https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/pins?lat=${location.coords.lat}&lng=${location.coords.lng}&r=0.1`);
      let data = await req.json () as Pin[];
      let byName = data.reduce<string[]> ((acc, val) => {
        if (acc.includes (val.placeName)) return acc;
        return [...acc, val.placeName];
      }, []);
      let litnesses = byName.map (name => data.filter (pin => pin.placeName === name)).map ((list, i, arr) => {
        return list.reduce ((acc, val) => {
          return acc + val.litness;
        }, 0) / arr.length;
      });
      let info = byName.map (name => {
        let pin = data.find (p => p.placeName === name);
        return {
          address: pin?.placeAddress || 'unknown',
          lat: pin?.lat || 0,
          lng: pin?.lng || 0,
        }
      });
      let dist = byName.map ((name, i) => ({name, litness: litnesses [i], ...info [i]}))
      dist.sort ((a, b) => a.litness - b.litness);
      setDistribution (dist);
      const geoJson:PointFeatureSet = {
        type: 'FeatureCollection',
        features: data.map ((litness: Pin) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: fromLonLat ([litness.lng, litness.lat])
          },
          properties: {
            ...litness
          }
        }))
      }
      setPins (data);
      setFeatureSet (geoJson);
      setIter (iter + 1);
    } catch (e: any) {
      setError (e?.toString () || 'unknown server error');
    }
  }
  const createPin = (litness: number, placeName: string, placeAddress: string) => new Promise<void> (async (resolve, reject) => {
    let unfreeze = freeze ();
    try {
      let body = {
        ...location.coords,
        litness,
        placeName,
        placeAddress
      }
      await fetch ('https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/pins', {
        method: 'post',
        headers: user.headers.post,
        body: JSON.stringify (body)
      })
      resolve ();
    } catch (e: any) {
      setError (e?.toString () || 'unknown error');
      reject (e);
    } finally {
      unfreeze ();
    }
  })

  useEffect (() => {
    if (location.locationAvailable) getPins ();
  }, [location.locationAvailable]);
  
  return {
    iter,
    pins,
    featureSet,
    distribution,
    pinErr,
    getPins,
    createPin
  }
}