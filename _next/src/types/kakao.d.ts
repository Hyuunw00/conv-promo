/**
 * 카카오맵 타입 정의
 */

declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
    getLevel(): number;
  }

  class LatLng {
    constructor(latitude: number, longitude: number);
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
  }

  namespace event {
    function addListener(
      target: Marker | Map,
      type: string,
      handler: () => void
    ): void;
  }

  function load(callback: () => void): void;

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    clickable?: boolean;
  }

  interface CustomOverlayOptions {
    position: LatLng;
    content: string;
    yAnchor?: number;
  }
}

interface Window {
  kakao: typeof kakao;
}
