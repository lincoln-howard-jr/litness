import { useApp } from "../AppProvider";
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import {Fill, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import { useEffect, useRef, useState } from "react";
import CircleStyle from "ol/style/Circle";

const style = (feature: any) => new Style ({
  image: new CircleStyle ({
    radius: parseInt (feature.get ('litness')) * 2,
    fill: new Fill ({
      color: [
        255,
        0,
        0,
        parseInt (feature.get ('litness')) / 25
      ]
    })
  })
})

export default function Map () {
  const app = useApp ();
  const mapref = useRef<HTMLDivElement> (null);
  const [map, setMap] = useState<OlMap | null> (null);
  const [zoom, setZoom] = useState <number> (15);
  const [center, setCenter] = useState<number[] | null> (null);

  useEffect (() => {
		const options = {
			view: new OlView({ zoom, minZoom: zoom, maxZoom: zoom }),
			layers: [
        new OlTileLayer ({source: new OSM ()}),
        new OlVectorLayer ({
          source: new OlVectorSource ({
            features: new GeoJSON().readFeatures(app.pins.featureSet),
          })
        })
      ],
			controls: [],
			overlays: []
		};
    const _map = new OlMap (options);
    setMap (_map);
  }, [])

  useEffect (() => {
    if (map && mapref.current) map.setTarget (mapref.current);
  }, [app.location.locationAvailable]);

  useEffect (() => {
    if (map) {
      map.getView ().setZoom (zoom);
    }
  }, [zoom]);

  useEffect (() => {
    if (center && map) {
      map.getView ().setCenter (center);
    }
  }, [center]);

  useEffect (() => {
    if (app.location.coords.lat && app.location.coords.lng) setCenter (fromLonLat ([app.location.coords.lng, app.location.coords.lat]));
  }, [app.location.coords.lat, app.location.coords.lng])

  useEffect (() => {
    map?.getLayers ().removeAt (1);
    const opts = {
      source: new OlVectorSource ({
        features: new GeoJSON().readFeatures(app.pins.featureSet),
      }),
      style
    }
    const layer = new OlVectorLayer (opts);
    console.log (app.pins.featureSet, layer, opts)
    map?.getLayers ().push (layer);
    
  }, [app.pins.iter]);

  return (
    <div id="ol-map" className={app.location.locationAvailable ? undefined : 'hidden'} ref={mapref} />
  )
}