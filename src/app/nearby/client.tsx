"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MapPin, Navigation, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, BrandType, BRAND_COLORS, BRAND_LABELS } from "@/types/store";
import { toast } from "sonner";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { BRAND_LOGOS } from "@/constants/maps";

export default function NearbyClient() {
  const router = useRouter();
  const [, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // 사용자의 실제 GPS 위치 (고정)
  const [mapCenter, setMapCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // 지도의 현재 중심 (검색 기준)
  const [selectedBrand, setSelectedBrand] = useState<BrandType | "ALL">("ALL");
  const [radius, setRadius] = useState<number>(500); // 기본 500 m
  const [locationError, setLocationError] = useState<string>("");
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [markers, setMarkers] = useState<naver.maps.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<
    Array<{
      placeName: string;
      addressName: string;
      roadAddressName: string;
      x: number;
      y: number;
      category: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // 네이버 지도 SDK 로드
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NCP_MAPS_CLIENT_ID;

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
        setMapCenter({ latitude, longitude }); // 초기 지도 중심도 사용자 위치로
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
    if (!mapCenter) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/nearby/stores?latitude=${mapCenter.latitude}&longitude=${mapCenter.longitude}&brand=${selectedBrand}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error("Failed to fetch stores");
      }

      const data = await response.json();

      // 거리를 사용자 실제 위치 기준으로 재계산
      const storesWithDistance = userLocation
        ? data.stores.map((store: Store) => ({
            ...store,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              store.latitude,
              store.longitude
            ),
          }))
        : data.stores;

      // 지도 중심에서 반경 내의 편의점만 필터링
      const filteredStores = storesWithDistance.filter((store: Store) => {
        const distanceFromCenter = calculateDistance(
          mapCenter.latitude,
          mapCenter.longitude,
          store.latitude,
          store.longitude
        );

        // 현재 선택된 반경 내의 편의점만 포함
        return distanceFromCenter <= radius;
      });

      setStores(filteredStores || []);
    } catch (error) {
      console.error("❌ Fetch stores error:", error);
      toast.error("주변 편의점을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [mapCenter, selectedBrand, radius, userLocation]);

  // 지도 중심 또는 브랜드 변경 시 편의점 검색
  useEffect(() => {
    if (mapCenter) {
      fetchNearbyStores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter, selectedBrand, radius]);

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = useCallback(() => {
    if (!map || !userLocation) return;

    map.setCenter(
      new naver.maps.LatLng(userLocation.latitude, userLocation.longitude)
    );

    // 지도 중심을 사용자 위치로 업데이트
    setMapCenter(userLocation);
  }, [map, userLocation]);

  // 네이버 지도 초기화
  useEffect(() => {
    if (!userLocation || !window.naver || map) return;

    // 지도 컨테이너
    const container = document.getElementById("map");
    if (!container) {
      console.log("❌ Map container not found");
      return;
    }

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

    const mapInstance = new naver.maps.Map(container, options);
    setMap(mapInstance);

    // 지도 이동/줌 변경 이벤트 (디바운스)
    let timeoutId: NodeJS.Timeout;
    naver.maps.Event.addListener(mapInstance, "idle", () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const center = mapInstance.getCenter();
        const newCenter = {
          latitude: center.lat(),
          longitude: center.lng(),
        };
        setMapCenter(newCenter);
      }, 1000); // 1000ms 디바운스
    });
  }, [userLocation, map, radius]);

  // 반경 변경 시 지도 줌 레벨 조정 및 강제 재검색
  useEffect(() => {
    if (!map) return;

    const zoomLevel = radius === 500 ? 17 : radius === 1000 ? 15 : 14;
    map.setZoom(zoomLevel);

    // 줌 변경 후 idle 이벤트가 자동으로 발생하여 재검색됨
  }, [radius, map]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !userLocation) return;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // 내 위치 마커
    const myMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      ),
      map: map,
      icon: {
        content: `<div style="
          width: 4px;
          height: 4px;
          background-color: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        anchor: new naver.maps.Point(2, 2),
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

      // 커스텀 마커 (로고 이미지)
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map: map,
        icon: {
          content: `<div style="
            width: 40px;
            height: 40px;
            background-color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            border: 3px solid ${BRAND_COLORS[store.brand]};
            overflow: hidden;
            padding: 2px;
          ">
            <img src="${BRAND_LOGOS[store.brand]}" alt="${
            BRAND_LABELS[store.brand]
          }" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>`,
          anchor: new naver.maps.Point(20, 20),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, userLocation, stores]); // markers 제거 - 무한 루프 방지

  // 길찾기 (네이버 지도)
  const handleNavigation = (store: Store) => {
    if (!userLocation) {
      toast.error("현재 위치를 가져올 수 없습니다");
      return;
    }

    // 네이버 지도 앱 딥링크 (모바일) 또는 웹 URL
    // 도착지만 지정하고 출발지는 사용자가 직접 설정하도록
    const naverUrl = `nmap://place?lat=${store.latitude}&lng=${
      store.longitude
    }&name=${encodeURIComponent(store.name)}&appname=com.convpromo`;

    // 웹 URL (앱이 없을 경우 대체)
    const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(
      store.name + " " + store.address
    )}`;

    // 모바일에서는 딥링크 시도, 실패하면 웹 URL
    window.location.href = naverUrl;
    setTimeout(() => {
      window.open(webUrl, "_blank");
    }, 500);
  };

  // 브랜드 프로모션 페이지로 이동
  const handleStoreClick = (brand: BrandType) => {
    router.push(`/?brand=${brand}`);
  };

  // 검색 처리
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("검색어를 입력해주세요");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `/api/nearby/geocode?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Failed to geocode");
      }

      const data = await response.json();

      if (data.success) {
        // 지도 중심 이동
        if (map) {
          map.setCenter(new naver.maps.LatLng(data.latitude, data.longitude));
        }

        // 지도 중심 업데이트 (자동으로 편의점 검색 실행됨)
        setMapCenter({
          latitude: data.latitude,
          longitude: data.longitude,
        });

        toast.success(`${data.roadAddress || data.jibunAddress}로 이동`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("검색 결과를 찾을 수 없습니다");
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // 디바운싱된 자동완성 검색 (Naver Local Search API)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/nearby/autocomplete?query=${encodeURIComponent(searchQuery)}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 자동완성 선택
  const handleSelectSuggestion = (suggestion: {
    placeName: string;
    addressName: string;
    roadAddressName: string;
    x: number;
    y: number;
  }) => {
    setSearchQuery(suggestion.placeName);
    setShowSuggestions(false);

    // 지도 이동 (Naver Local Search API는 이미 좌표를 제공)
    if (map) {
      const latitude = suggestion.y;
      const longitude = suggestion.x;

      map.setCenter(new naver.maps.LatLng(latitude, longitude));
      setMapCenter({ latitude, longitude });
      toast.success(`${suggestion.roadAddressName}로 이동`);
    }
  };

  if (locationError) {
    return (
      <>
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 pt-safe">
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
          <p className="text-gray-700 mb-2 font-medium">
            위치 권한이 필요합니다
          </p>
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 pt-safe">
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

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="mt-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="지역/주소 검색 (예: 부산대, 강남역)"
                className="w-full pl-3 pr-24 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSearching}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? "검색중" : "검색"}
                </button>
              </div>

              {/* 자동완성 제안 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <MapPin className="w-3 h-3 inline mr-2 text-gray-400" />
                      {suggestion.placeName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

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
                  {brand === "ALL" ? "전체" : BRAND_LABELS[brand as BrandType]}
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

      <main className="pb-16 relative z-0">
        {/* 지도 */}
        <div className="relative">
          <div
            id="map"
            className="w-full h-64 bg-gray-100"
            style={{ zIndex: 0 }}
          ></div>

          {/* 현재 위치로 이동 버튼 (네이버 지도 스타일) */}
          <button
            onClick={moveToCurrentLocation}
            className="absolute top-3 left-3 w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-blue-50 hover:shadow-lg active:scale-95 transition-all duration-200 border border-gray-200 z-10 group"
            title="현재 위치로 이동"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:scale-110 transition-transform duration-200"
            >
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="#4285F4"
                className="group-hover:fill-blue-600 transition-colors"
              />
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="#4285F4"
                strokeWidth="2"
                fill="none"
                className="group-hover:stroke-blue-600 transition-colors"
              />
              <path
                d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
                stroke="#4285F4"
                strokeWidth="2"
                strokeLinecap="round"
                className="group-hover:stroke-blue-600 transition-colors"
              />
            </svg>
          </button>
        </div>

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
