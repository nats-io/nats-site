interface NatsIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export function NatsIcon({ className = '', width = 16, height = 16 }: NatsIconProps) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 288 288"
      width={width}
      height={height}
      className={className}
    >
      <g>
        <rect x="142.8" y="5.3" fill="#34A574" width="134.7" height="109.2" />
        <rect x="8.1" y="5.3" fill="#27AAE1" width="134.7" height="109.2" />
        <rect x="142.8" y="114.6" fill="#8DC63F" width="134.7" height="109.2" />
        <rect x="8.1" y="114.6" fill="#375C93" width="134.7" height="109.2" />
        <polygon fill="#8DC63F" points="123,223.2 188.9,284.2 188.9,223.2" />
        <polygon fill="#375C93" points="142.8,223.2 143.5,242.4 122.4,222.7" />
      </g>
      <g>
        <path
          fill="#FFFFFF"
          d="M198.6,146.5V56.1h32.2v116.9H182L83.5,81v92.1H51.2V56.1h50.5L198.6,146.5z"
        />
      </g>
    </svg>
  );
}
