import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import polyline from "@mapbox/polyline";
import constructIcon from "../../access/img/construction.png";
import fireIcon from "../../access/img/fire.png";

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
  useEffect(() => {
    if (getRouteRef.current) {
      if (fireList.features.length == 0) {
        clearRoute();
      }
    }
  }, [fireList]);
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
      zoom: 13
    });
    mapRef.current = map;

    map.on("load", () => {
      map.loadImage(constructIcon, (error, image) => {
        if (!error && !map.hasImage("construction-icon")) map.addImage("construction-icon", image);
      });
      map.loadImage(fireIcon, (error, image) => {
        if (!error && !map.hasImage("fire-icon")) map.addImage("fire-icon", image);
      });

      map.addSource("construction", { type: "geojson", data: constructionList || { type: "FeatureCollection", features: [] } });
      map.addSource("fire", { type: "geojson", data: fireList || { type: "FeatureCollection", features: [] } });

      map.addLayer({
        id: "construction-point",
        type: "symbol",
        source: "construction",
        layout: { "icon-image": "construction-icon", "icon-size": 0.8, "icon-allow-overlap": true }
      });

      map.addLayer({
        id: "fire-point",
        type: "symbol",
        source: "fire",
        layout: { "icon-image": "fire-icon", "icon-size": 0.8, "icon-allow-overlap": true }
      });

      window.handleGetRoute = (lng, lat) => {
        getRoute([lng, lat]);
        if (popupRef.current) popupRef.current.remove();
      };

      const showPopup = (e, title, isFire) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties;

        const buttonHtml = isFire ? `
          <button 
            onclick="window.handleGetRoute(${coordinates[0]}, ${coordinates[1]})"
            style="width:100%;background:#e74c3c;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;margin-top:10px;font-weight:600"
          >
            🔥 Chỉ đường cứu hộ
          </button>` : '';

        const html = `
          <div style="color:#333;padding:5px;min-width:160px">
            <h5 style="margin:0 0 5px;color:${isFire ? '#e74c3c' : '#2c3e50'}">${title}</h5>
            <p style="margin:0;font-size:13px;font-weight:600">${props.name || "N/A"}</p>
            <p style="margin:0;font-size:12px;color:#666">${props.address || ""}</p>
            ${buttonHtml}
          </div>
        `;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new goongjs.Popup({ offset: 15 })
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      };

      map.on("click", "construction-point", (e) => showPopup(e, "🏠 Thông tin nhà", false));
      map.on("click", "fire-point", (e) => showPopup(e, "🔥 BÁO CHÁY KHẨN CẤP", true));

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["construction-point", "fire-point"]
        });
        if (!features.length) {
          clearRoute();
          if (popupRef.current) popupRef.current.remove();
        }
        if (onMapClick) onMapClick({ lngLat: e.lngLat });
      });

      ["construction-point", "fire-point"].forEach(layer => {
        map.on("mouseenter", layer, () => map.getCanvas().style.cursor = "pointer");
        map.on("mouseleave", layer, () => map.getCanvas().style.cursor = "");
      });
    });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      map.remove();
    };
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current?.getSource("construction")) {
      mapRef.current.getSource("construction").setData(constructionList || { type: "FeatureCollection", features: [] });
    }
  }, [constructionList]);

  useEffect(() => {
    if (mapRef.current?.getSource("fire")) {
      mapRef.current.getSource("fire").setData(fireList || { type: "FeatureCollection", features: [] });
    }
  }, [fireList]);

  useEffect(() => {
    if (mapRef.current && center) mapRef.current.flyTo({ center });
  }, [center]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%", borderRadius: "16px" }} />;
};

export default GoongMapAdmin;