import { ImageResponse } from 'next/og';

export const alt = 'Carl Welch | Senior Product Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#090c09',
          color: '#f2f2eb',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, letterSpacing: 3 }}>
          <span>SENIOR PRODUCT ENGINEER</span>
          <span>PORTFOLIO / 2026</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 118, fontWeight: 700, letterSpacing: -8, lineHeight: 0.92 }}>Carl Welch</div>
          <div style={{ marginTop: 32, fontSize: 30, color: '#a9afa5' }}>
            Applied AI · Product interfaces · Creative software
          </div>
        </div>
        <div style={{ display: 'flex', width: '100%', height: 16 }}>
          <div style={{ flex: 1, background: '#ff4338' }} />
          <div style={{ flex: 1, background: '#ff6800' }} />
          <div style={{ flex: 1, background: '#62e879' }} />
        </div>
      </div>
    ),
    size,
  );
}
