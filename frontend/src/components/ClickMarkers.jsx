import React, { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

const ClickMarkers = () => {
  const [markers, setMarkers] = useState([]);

  useMapEvents({
    click: (e) => {
      setMarkers([...markers, e.latlng]);
    },
  });

  return markers.map((pos, i) => (
    <Marker key={i} position={pos}>
      <Popup>
        Marker {i + 1}: {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
      </Popup>
    </Marker>
  ));
};


export default ClickMarkers;
