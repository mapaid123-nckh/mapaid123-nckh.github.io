import React, { useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

const GoongMap = ({ apiKey, center, onMapClick }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    goongjs.accessToken = apiKey;

    if (!mapRef.current) {
      const map = new goongjs.Map({
        container: mapContainer.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: center,
        zoom: 13
      });

      mapRef.current = map;

      map.on('load', () => {
        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          if (onMapClick) {
            onMapClick({ lngLat: { lng, lat } });
          }
        });
      });

      markerRef.current = new goongjs.Marker({ color: '#b32d2e' })
        .setLngLat(center)
        .addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && center) {
      markerRef.current.setLngLat(center);
      mapRef.current.setCenter(center);
    }
  }, [center]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default GoongMap;