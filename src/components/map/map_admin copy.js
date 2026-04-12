import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import constructIcon from "../../access/img/construction.png";
import fireIcon from "../../access/img/fire.png";

const GoongMapAdmin = ({
  apiKey,
  center,
  onMapClick,
  constructionList,
  fireList
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  /* =========================
        INIT MAP
  ========================= */
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

      /* LOAD ICONS */

      map.loadImage(constructIcon, (error, image) => {
        if (error) throw error;
        if (!map.hasImage("construction-icon")) {
          map.addImage("construction-icon", image);
        }
      });

      map.loadImage(fireIcon, (error, image) => {
        if (error) throw error;
        if (!map.hasImage("fire-icon")) {
          map.addImage("fire-icon", image);
        }
      });

      /* SOURCES */

      map.addSource("construction", {
        type: "geojson",
        data: constructionList || { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.addSource("fire", {
        type: "geojson",
        data: fireList || { type: "FeatureCollection", features: [] }
      });

      /* LAYERS */

      map.addLayer({
        id: "construction-point",
        type: "symbol",
        source: "construction",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "construction-icon",
          "icon-size": 1,
          "icon-allow-overlap": true
        }
      });

      map.addLayer({
        id: "fire-point",
        type: "symbol",
        source: "fire",
        layout: {
          "icon-image": "fire-icon",
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true
        }
      });

      /* POPUP */

      const showPopup = (e, title) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        const html = `
          <div style="color:#333;padding:5px">
            <h5 style="margin:0 0 5px;color:#b32d2e">${title}</h5>
            <p style="margin:0;font-size:14px; font-weight: 600">
              ${properties.name || properties.title || "Thông tin chi tiết"}
            </p>
            <p style="margin:0;font-size:12px">
              ${properties.address || properties.title || "Thông tin chi tiết"}
            </p>
            <small>Tọa độ: ${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}</small>
          </div>
        `;

        if (popupRef.current) popupRef.current.remove();

        popupRef.current = new goongjs.Popup({ offset: 15 })
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      };

      map.on("click", "construction-point", (e) => showPopup(e, "🏠 Nhà"));
      map.on("click", "fire-point", (e) => showPopup(e, "🔥 Vụ cháy"));

      /* CURSOR */

      ["construction-point", "fire-point"].forEach((layer) => {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });

      /* CLICK MAP */

      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        if (onMapClick) onMapClick({ lngLat: { lng, lat } });
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

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default GoongMapAdmin;