import Svg, { Rect, Path } from 'react-native-svg';

export const PlaceholderImage = () => (
  <Svg width="60" height="80" viewBox="0 0 60 80">
    <Rect width="60" height="80" fill="#2A2A2A" />
    <Path
        d="M30 25C25 25 21 29 21 34C21 37.5 23 40.5 26 42C24.5 42.5 23 43.5 22 44.5C20 46.5 19 49.5 19 52.5H41C41 49.5 40 46.5 38 44.5C37 43.5 35.5 42.5 34 42C37 40.5 39 37.5 39 34C39 29 35 25 30 25Z"
        fill="#505050"
      />
    </Svg>
  );