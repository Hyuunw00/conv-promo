/**
 * 네이버 지도 타입 정의
 */

declare namespace naver.maps {
  class Map {
    constructor(mapDiv: HTMLElement | string, mapOptions?: MapOptions);
    setCenter(coord: LatLng | LatLngLiteral): void;
    setZoom(zoom: number, useEffect?: boolean): void;
    getCenter(): LatLng;
    getZoom(): number;
    destroy(): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    setPosition(position: LatLng | LatLngLiteral): void;
    setIcon(icon: ImageIcon | SymbolIcon | HtmlIcon): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
  }

  interface ZoomControlOptions {
    position: Position;
  }

  enum Position {
    TOP_LEFT,
    TOP_CENTER,
    TOP_RIGHT,
    LEFT_CENTER,
    CENTER,
    RIGHT_CENTER,
    BOTTOM_LEFT,
    BOTTOM_CENTER,
    BOTTOM_RIGHT,
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map | null;
    icon?: ImageIcon | SymbolIcon | HtmlIcon | string;
    title?: string;
    cursor?: string;
    clickable?: boolean;
    draggable?: boolean;
    visible?: boolean;
    zIndex?: number;
  }

  interface ImageIcon {
    url: string;
    size?: Size;
    scaledSize?: Size;
    origin?: Point;
    anchor?: Point;
  }

  interface SymbolIcon {
    path: SymbolPath | string;
    style?: SymbolStyle;
    anchor?: Point;
  }

  interface HtmlIcon {
    content: string | HTMLElement;
    size?: Size;
    anchor?: Point;
  }

  enum SymbolPath {
    CIRCLE,
  }

  enum SymbolStyle {
    FILL,
    STROKE,
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Event {
    static addListener(
      target: any,
      eventName: string,
      listener: Function
    ): MapEventListener;
    static removeListener(listener: MapEventListener): void;
  }

  interface MapEventListener {
    remove(): void;
  }
}

interface Window {
  naver: typeof naver;
}
