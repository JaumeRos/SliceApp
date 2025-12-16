import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export const BackIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#000000',
  strokeWidth = 1.5,
}) => (
  <View style={{ width, height }}>
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  </View>
);

export const GoogleIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
}) => (
  <View style={{ width, height }}>
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <Path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"
      />
      <Path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.8 1.6-1.27 3.41-1.27 5.38s.46 3.78 1.27 5.38l3.98-3.09z"
      />
      <Path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </Svg>
  </View>
);

export const AppleIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#000000',
}) => (
  <View style={{ width, height }}>
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M17.05 12.314c-.013-1.523.663-2.676 2.03-3.527-1.091-1.445-2.422-1.764-3.383-1.764-1.45-.146-2.813.85-3.545.85-.731 0-1.864-.83-3.065-.83-1.582.013-3.025.914-3.84 2.324-1.637 2.834-.424 7.026 1.178 9.324.779 1.127 1.71 2.391 2.929 2.344 1.172-.047 1.617-.758 3.033-.758 1.416 0 1.811.758 3.049.735 1.258-.023 2.057-1.145 2.823-2.278.89-1.301 1.258-2.56 1.278-2.623-.026-.013-2.45-.941-2.474-3.734l-.013-.063zM14.314 6.96c.89-1.08 1.491-2.587 1.328-4.087-1.284.052-2.836.854-3.757 1.934-.827.954-1.55 2.48-1.354 3.94 1.43.112 2.892-.733 3.783-1.787z"
      />
    </Svg>
  </View>
);

