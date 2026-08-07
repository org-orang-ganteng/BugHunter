export type DeviceType = "mobile" | "desktop";

const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone|iPad|Tablet|Kindle|Silk|PlayBook/i;

/** Deteksi apakah User-Agent berasal dari perangkat mobile/tablet (bukan laptop/desktop). */
export function isMobileUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return MOBILE_UA_REGEX.test(userAgent);
}

export function getDeviceType(userAgent: string | null | undefined): DeviceType {
  return isMobileUserAgent(userAgent) ? "mobile" : "desktop";
}
