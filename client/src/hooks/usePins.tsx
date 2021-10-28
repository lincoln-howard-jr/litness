import { fromLonLat } from "ol/proj";
import { useEffect, useState } from "react";
import { FreezeFn } from "../AppProvider";
import { LocationHook } from "./useLocation";
import { UserHook } from "./useUser";

interface Distribution {
  [key: string]: number;
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
  distribution: Distribution;
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
  distribution: {},
  pinErr: null,
  getPins: () => {},
  createPin: ()=>new Promise (r => r)
}

export default function usePins (user: UserHook, location: LocationHook, freeze: FreezeFn):PinsHook {
  const [iter, setIter] = useState<number> (mockUsePins.iter);
  const [pins, setPins] = useState<Pin[]> (mockUsePins.pins);
  const [featureSet, setFeatureSet] = useState<PointFeatureSet> (mockUsePins.featureSet)
  const [distribution, setDistribution] = useState<Distribution> ({});
  const [pinErr, setError] = useState<null | string> (mockUsePins.pinErr);
  const getPins = async () => {
    try {
      let req = await fetch (`https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/pins?lat=${location.coords.lat}&lng=${location.coords.lng}&r=0.1`);
      let data = await req.json () as Pin[];
      let total = data.reduce ((acc, val) => {
        return acc + val.litness;
      }, 0);
      let addresses = data.reduce<string[]> ((acc, val) => {
        if (acc.includes (val.placeAddress)) return acc;
        return [...acc, val.placeAddress];
      }, []);
      let ranks = addresses.map (addy => data.filter (pin => pin.placeAddress === addy)).map (list => {
        return list.reduce ((acc, val) => {
          return acc + val.litness;
        }, 0) / total;
      });
      let dist = addresses.reduce ((acc, val, i) => {
        return {
          ...acc,
          [val]: ranks [i]
        }
      }, {});
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
    if (location.coords.lng && location.coords.lat) getPins ();
  }, [location.coords.lng, location.coords.lat]);
  
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