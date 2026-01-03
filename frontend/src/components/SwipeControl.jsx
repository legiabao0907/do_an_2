import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-side-by-side';

const SwipeControl = ({ leftLayers, rightLayers }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!L.control.sideBySide) {
      console.error("L.control.sideBySide is not defined! The plugin failed to load.");
      return;
    }
    if (leftLayers.length === 0 || rightLayers.length === 0) return;

    // Create the swipe control
    const swipe = L.control.sideBySide(leftLayers, rightLayers);
    swipe.addTo(map);

    // Cleanup on unmount or deps change
    return () => {
      // Safe check before removal
      if (map && swipe) {
        try {
          // leaflet-side-by-side adds events, standard remove() handles it
          map.removeControl(swipe);
        } catch (e) {
          console.warn("Error removing swipe control", e);
        }
      }
    };
  }, [map, leftLayers, rightLayers]);

  return null;
};

export default SwipeControl;
