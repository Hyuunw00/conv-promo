"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MapPin, Navigation, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  BrandType,
  BRAND_COLORS,
  BRAND_LABELS,
} from "@/types/store";
import Loading from "@/components/ui/Loading";
import { toast } from "sonner";

export default function NearbyClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandType | "ALL">("ALL");
  const [radius, setRadius] = useState<number>(1000); // 기본 1km
  const [locationError, setLocationError] = useState<string>("");
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [markers, setMarkers] = useState<naver.maps.Marker[]>([]);

  // 네이버 지도 SDK 로드
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    console.log("🗺️ Loading Naver Maps with Client ID:", clientId?.substring(0, 10) + "...");

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log("✅ Naver Maps SDK loaded");
      if (window.naver && window.naver.maps) {
        console.log("✅ Naver Maps available");
      } else {
        console.error("❌ naver.maps not available");
      }
    };

    script.onerror = (error) => {
      console.error("❌ Failed to load Naver Maps script:", error);
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("위치 서비스를 지원하지 않는 브라우저입니다");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocationError("");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요."
        );
        setLoading(false);
      }
    );
  }, []);

  // 주변 편의점 검색
  const fetchNearbyStores = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);
    console.log("🔍 Fetching nearby stores:", {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius,
      brand: selectedBrand,
    });

    try {
      const response = await fetch(
        `/api/nearby/stores?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=${radius}&brand=${selectedBrand}`
      );

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error("Failed to fetch stores");
      }

      const data = await response.json();
      console.log("✅ Stores found:", data.stores?.length || 0, data);
      setStores(data.stores || []);
    } catch (error) {
      console.error("❌ Fetch stores error:", error);
      toast.error("주변 편의점을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius, selectedBrand]);

  // 위치 변경 시 편의점 검색
  useEffect(() => {
    if (userLocation) {
      fetchNearbyStores();
    }
  }, [userLocation, radius, selectedBrand, fetchNearbyStores]);

  // 네이버 지도 초기화 및 업데이트
  useEffect(() => {
    if (!userLocation || !window.naver || !stores.length) return;

    // 지도 컨테이너
    const container = document.getElementById("map");
    if (!container) return;

    // 지도 옵션
    const options = {
      center: new naver.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      ),
      zoom: radius === 500 ? 16 : radius === 1000 ? 15 : 14,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    };

    // 지도 생성 또는 업데이트
    let mapInstance = map;
    if (!mapInstance) {
      mapInstance = new naver.maps.Map(container, options);
      setMap(mapInstance);
    } else {
      mapInstance.setCenter(
        new naver.maps.LatLng(userLocation.latitude, userLocation.longitude)
      );
      mapInstance.setZoom(options.zoom);
    }

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // 내 위치 마커
    const myMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      ),
      map: mapInstance,
      icon: {
        content: `<div style="
          width: 20px;
          height: 20px;
          background-color: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        anchor: new naver.maps.Point(10, 10),
      },
      title: "내 위치",
    });

    // 편의점 마커 생성
    const newMarkers: naver.maps.Marker[] = [myMarker];

    stores.forEach((store) => {
      const markerPosition = new naver.maps.LatLng(
        store.latitude,
        store.longitude
      );

      // 커스텀 마커
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map: mapInstance,
        icon: {
          content: `<div style="
            background-color: ${BRAND_COLORS[store.brand]};
            color: white;
            padding: 6px 10px;
            border-radius: 16px;
            font-weight: bold;
            font-size: 11px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">${BRAND_LABELS[store.brand]}</div>`,
          anchor: new naver.maps.Point(30, 30),
        },
        title: store.name,
      });

      // 마커 클릭 이벤트
      naver.maps.Event.addListener(marker, "click", () => {
        const element = document.getElementById(`store-${store.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-blue-500");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-blue-500");
          }, 2000);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [userLocation, stores, radius]); // map, markers 의존성 제거

  // 거리 포맷팅
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // 길찾기 (네이버 지도)
  const handleNavigation = (store: Store) => {
    const naverUrl = `https://map.naver.com/v5/directions/-/-/-/transit?c=${store.longitude},${store.latitude},15,0,0,0,dh`;
    window.open(naverUrl, "_blank");
  };

  // 브랜드 프로모션 페이지로 이동
  const handleStoreClick = (brand: BrandType) => {
    router.push(`/?brand=${brand}`);
  };

  if (loading && !stores.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (locationError) {
    return (
      <>
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  📍 내 주변 편의점
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  가까운 편의점을 찾아보세요
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-700 mb-2 font-medium">위치 권한이 필요합니다</p>
          <p className="text-gray-500 text-sm mb-6">{locationError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                📍 내 주변 편의점
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {stores.length}개 편의점 발견
              </p>
            </div>
          </div>

          {/* 필터 */}
          <div className="mt-3 space-y-2">
            {/* 브랜드 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["ALL", "GS25", "CU", "SevenEleven", "Emart24"].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand as BrandType | "ALL")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedBrand === brand
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {brand === "ALL"
                    ? "전체"
                    : BRAND_LABELS[brand as BrandType]}
                </button>
              ))}
            </div>

            {/* 반경 선택 */}
            <div className="flex gap-2">
              {[500, 1000, 2000].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    radius === r
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {r < 1000 ? `${r}m` : `${r / 1000}km`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="pb-16">
        {/* 지도 */}
        <div id="map" className="w-full h-64 bg-gray-100"></div>

        {/* 편의점 리스트 */}
        <div className="px-3 py-3">
          {stores.length > 0 ? (
            <div className="space-y-2">
              {stores.map((store) => (
                <div
                  key={store.id}
                  id={`store-${store.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: BRAND_COLORS[store.brand] }}
                        />
                        <span className="text-xs font-semibold text-gray-500">
                          {BRAND_LABELS[store.brand]}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 truncate">
                        {store.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {store.roadAddress || store.address}
                      </p>
                      <div className="flex items-center gap-1 text-blue-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDistance(store.distance)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleNavigation(store)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="길찾기"
                      >
                        <Navigation className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStoreClick(store.brand)}
                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="프로모션 보기"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-1">주변에 편의점이 없습니다</p>
              <p className="text-gray-400 text-sm">
                반경을 넓혀서 다시 검색해보세요
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
