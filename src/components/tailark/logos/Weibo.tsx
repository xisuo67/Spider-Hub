import type { SVGProps } from 'react';

export function Weibo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.5 2C5.36 2 2 5.36 2 9.5S5.36 17 9.5 17s7.5-3.36 7.5-7.5S13.64 2 9.5 2zm0 12c-2.49 0-4.5-2.01-4.5-4.5S7.01 5 9.5 5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm6.5-4.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"
        fill="#E6162D"
      />
    </svg>
  );
}
