import { BrandType } from "@/types/store";

export interface AppStoreLinks {
  playStore: string;
  appStore: string;
  appName: string;
}

export const APP_STORE_LINKS: Record<BrandType, AppStoreLinks> = {
  GS25: {
    playStore:
      "https://play.google.com/store/apps/details?id=com.gsr.gs25&hl=ko",
    appStore: "https://apps.apple.com/kr/app/id426644449",
    appName: "우리동네GS",
  },
  CU: {
    playStore:
      "https://play.google.com/store/apps/details?id=com.bgfcu.membership&hl=ko",
    appStore: "https://apps.apple.com/kr/app/id573144133",
    appName: "포켓CU",
  },
  SevenEleven: {
    playStore:
      "https://play.google.com/store/apps/details?id=kr.co.kork7app&hl=ko",
    appStore: "https://apps.apple.com/kr/app/id1253773772",
    appName: "세븐일레븐",
  },
  Emart24: {
    playStore:
      "https://play.google.com/store/apps/details?id=kr.co.emart24.everse&hl=ko",
    appStore: "https://apps.apple.com/kr/app/id1636816705",
    appName: "이마트24",
  },
};

/**
 * 사용자의 디바이스에 맞는 앱스토어 URL을 반환
 */
export const getAppStoreUrl = (brand: BrandType): string => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const links = APP_STORE_LINKS[brand];

  return isAndroid ? links.playStore : links.appStore;
};

/**
 * 앱 이름 반환
 */
export const getAppName = (brand: BrandType): string => {
  return APP_STORE_LINKS[brand].appName;
};
