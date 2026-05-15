import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import polyline from "@mapbox/polyline";
import constructIcon from "../../access/img/construction.png";
import fireIcon from "../../access/img/fire.png";
import hydrantIcon from "../../access/img/waterIntake.png";
// THÊM MỚI: Icon đội PCCC và file JSON
import stationIcon from "../../access/img/fireDepartment.png";
import hanoiHydrants from "../../access/hanoi_fire_hydrants.json";
import hanoiStations from "../../access/hanoi_fire_stations.json";

const GoongMapAdmin = ({
  apiKey,
  webApiKey,
  center,
  onMapClick,
  constructionList,
  fireList
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const getRouteRef = useRef(false);

  // Chuyển đổi dữ liệu Trụ nước sang GeoJSON
  const hydrantsGeoJSON = {
    type: "FeatureCollection",
    features: hanoiHydrants.data.map(item => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [item.longitude, item.latitude] },
      properties: { ...item }
    }))
  };

  // THÊM MỚI: Chuyển đổi dữ liệu Đội PCCC sang GeoJSON
  const stationsGeoJSON = {
    type: "FeatureCollection",
    features: hanoiStations.data.map(item => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [item.lng, item.lat] },
      properties: { ...item }
    }))
  };

  const clearRoute = () => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route")) map.removeSource("route");
  };

  const getRoute = async (end) => {
    getRouteRef.current = true;
    if (!webApiKey) {
      console.error("Thiếu Web Service API Key!");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const start = [position.coords.longitude, position.coords.latitude];
      const query = `origin=${start[1]},${start[0]}&destination=${end[1]},${end[0]}&vehicle=car&api_key=${webApiKey}`;

      try {
        const response = await fetch(`https://rsapi.goong.io/Direction?${query}`);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routePoints = data.routes[0].overview_polyline.points;
          const geojson = polyline.toGeoJSON(routePoints);
          const map = mapRef.current;

          clearRoute();

          map.addSource("route", { type: "geojson", data: geojson });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#4285F4", "line-width": 6, "line-opacity": 0.8 }
          });

          const bounds = geojson.coordinates.reduce((acc, coord) => {
            return acc.extend(coord);
          }, new goongjs.LngLatBounds(geojson.coordinates[0], geojson.coordinates[0]));
          map.fitBounds(bounds, { padding: 50 });
        }
      } catch (err) {
        console.error("Lỗi Direction API:", err);
      }
    });
  };

  useEffect(() => {
    goongjs.accessToken = apiKey;
    const map = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: center,
      zoom: 14
    });
    mapRef.current = map;

    map.on("load", () => {
      // Load tất cả Icon
      const icons = [
        { name: "construction-icon", src: constructIcon },
        { name: "fire-icon", src: fireIcon },
        { name: "hydrant-icon", src: hydrantIcon },
        { name: "station-icon", src: stationIcon } // Icon đội PCCC
      ];

      icons.forEach(icon => {
        map.loadImage(icon.src, (err, img) => {
          if (!err && !map.hasImage(icon.name)) map.addImage(icon.name, img);
        });
      });

      // Thêm các Source
      map.addSource("construction", { type: "geojson", data: constructionList || { type: "FeatureCollection", features: [] } });
      map.addSource("fire", { type: "geojson", data: fireList || { type: "FeatureCollection", features: [] } });
      map.addSource("hydrants", { type: "geojson", data: hydrantsGeoJSON });
      map.addSource("stations", { type: "geojson", data: stationsGeoJSON });

      // Thêm các Layer
      const layers = [
        { id: "construction-point", source: "construction", icon: "construction-icon", size: 0.8 },
        { id: "fire-point", source: "fire", icon: "fire-icon", size: 0.8 },
        { id: "hydrant-point", source: "hydrants", icon: "hydrant-icon", size: 0.6 },
        { id: "station-point", source: "stations", icon: "station-icon", size: 0.7 } // Layer đội PCCC
      ];

      layers.forEach(layer => {
        map.addLayer({
          id: layer.id,
          type: "symbol",
          source: layer.source,
          layout: { "icon-image": layer.icon, "icon-size": layer.size, "icon-allow-overlap": true }
        });
      });

      window.handleGetRoute = (lng, lat) => {
        getRoute([lng, lat]);
        if (popupRef.current) popupRef.current.remove();
      };

      const showPopup = (e, title, type) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties;

        let contentHtml = `<p style="margin:0;font-size:13px;font-weight:600">${props.name || "N/A"}</p>`;
        let footerHtml = '';
        let titleColor = '#2c3e50';

        switch (type) {
          case 'fire':
            titleColor = '#e74c3c';
            footerHtml = `<button onclick="window.handleGetRoute(${coordinates[0]}, ${coordinates[1]})" style="width:100%;background:#e74c3c;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;margin-top:10px;font-weight:600">🔥 Chỉ đường cứu hộ</button>`;
            break;
          case 'hydrant':
            titleColor = '#2980b9';
            contentHtml += `<p style="margin:0;font-size:12px;color:#666">Loại: ${props.type}<br>Trạng thái: ${props.status}</p>`;
            break;
          case 'station':
            titleColor = '#f39c12'; // Màu cam cho đội PCCC
            contentHtml += `<p style="margin:0;font-size:12px;color:#666">📍 ${props.address}<br>📞 Hotline: ${props.hotline}<br>🚒 Xe: ${props.vehicles}</p>`;
            break;
        }

        const html = `
          <div style="color:#333;padding:5px;min-width:180px">
            <h5 style="margin:0 0 5px;color:${titleColor}">${title}</h5>
            ${contentHtml}
            ${footerHtml}
          </div>
        `;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new goongjs.Popup({ offset: 15 }).setLngLat(coordinates).setHTML(html).addTo(map);
      };

      map.on("click", "construction-point", (e) => showPopup(e, "🏠 Thông tin nhà", 'construction'));
      map.on("click", "fire-point", (e) => showPopup(e, "🔥 BÁO CHÁY KHẨN CẤP", 'fire'));
      map.on("click", "hydrant-point", (e) => showPopup(e, "💧 Trụ nước chữa cháy", 'hydrant'));
      map.on("click", "station-point", (e) => showPopup(e, "🚒 Đội PCCC & CNCH", 'station'));

      map.on("click", (e) => {
        const layersToQuery = ["construction-point", "fire-point", "hydrant-point", "station-point"];
        const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery });
        if (!features.length) {
          clearRoute();
          if (popupRef.current) popupRef.current.remove();
        }
        if (onMapClick) onMapClick({ lngLat: e.lngLat });
      });

      ["construction-point", "fire-point", "hydrant-point", "station-point"].forEach(layer => {
        map.on("mouseenter", layer, () => map.getCanvas().style.cursor = "pointer");
        map.on("mouseleave", layer, () => map.getCanvas().style.cursor = "");
      });
    });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      map.remove();
    };
  }, [apiKey]);

  /* UPDATE CONSTRUCTION */

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("construction");
    if (source) {
      source.setData(constructionList || {
        "type": "FeatureCollection",
        "features": []
      });
    }
  }, [constructionList]);

  /* UPDATE FIRE */

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("fire");
    if (source) {
      source.setData(fireList || {
        "type": "FeatureCollection",
        "features": []
      });
    }
  }, [fireList]);

  /* UPDATE CENTER */

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo({ center });
    }
  }, [center]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%", borderRadius: "16px" }} />;
};

export default GoongMapAdmin;