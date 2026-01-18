'use client';

// 알림 관련 유틸리티 함수

/**
 * 브라우저가 푸시 알림을 지원하는지 확인
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * 현재 알림 권한 상태 확인
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('이 브라우저는 알림을 지원하지 않습니다');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * base64 문자열을 Uint8Array로 변환 (VAPID 키용)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * 푸시 구독 생성
 */
export async function subscribeToPush(): Promise<PushSubscription> {
  if (!isPushSupported()) {
    throw new Error('푸시 알림이 지원되지 않습니다');
  }

  // Service Worker 등록 확인
  const registration = await navigator.serviceWorker.ready;

  // 기존 구독 확인
  let subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    return subscription;
  }

  // 새 구독 생성
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('VAPID 공개키가 설정되지 않았습니다');
  }

  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey as BufferSource,
  });

  return subscription;
}

/**
 * 푸시 구독 해제
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    return await subscription.unsubscribe();
  }

  return false;
}

/**
 * 구독 정보를 서버에 저장
 */
export async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();

  const subscriptionData = subscription.toJSON();

  if (!subscriptionData.endpoint || !subscriptionData.keys) {
    throw new Error('유효하지 않은 구독 정보입니다');
  }

  // 기존 구독 삭제
  if (user?.id) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);
  }

  // DB에 저장
  const { error } = await supabase.from('push_subscriptions').insert({
    endpoint: subscriptionData.endpoint,
    p256dh: subscriptionData.keys.p256dh,
    auth: subscriptionData.keys.auth,
    user_id: user?.id || null,
    user_email: user?.email || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Save subscription error:', error);
    throw new Error('구독 저장에 실패했습니다');
  }
}

/**
 * 구독 정보를 서버에서 삭제
 */
export async function deleteSubscription(subscription: PushSubscription): Promise<void> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();

  if (!subscription.endpoint) {
    throw new Error('endpoint가 필요합니다');
  }

  // DB에서 삭제
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', subscription.endpoint);

  if (error) {
    console.error('Delete subscription error:', error);
    throw new Error('구독 삭제에 실패했습니다');
  }
}
