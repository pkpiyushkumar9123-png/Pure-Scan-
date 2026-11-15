import QRCode from 'qrcode';

export const PURESCAN_WEB_URL = 'pure-scan-ai-seven.vercel.app';
export const PURESCAN_FULL_URL = 'https://pure-scan-ai-seven.vercel.app';

let cachedQrDataUrl: string | null = null;

export async function getPureScanQrCodeDataUrl(): Promise<string> {
  if (cachedQrDataUrl) {
    return cachedQrDataUrl;
  }

  try {
    const url = await QRCode.toDataURL(PURESCAN_FULL_URL, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    cachedQrDataUrl = url;
    return url;
  } catch (err) {
    console.error('Failed to generate PureScan QR Code:', err);
    return '';
  }
}
