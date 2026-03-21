interface Props {
    size?: number
    withText?: boolean
    textColor?: string
  }
  
  export default function Logo({ size = 32, withText = false, textColor = '#16a34a' }: Props) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="56" height="56" rx="14" fill="#16a34a"/>
          <path
            d="M28 10L42 20V36L28 46L14 36V20L28 10Z"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M28 10L28 46" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
          <path d="M14 20L42 20"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
          <path d="M14 36L42 36"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
          <circle cx="28" cy="28" r="5" fill="#fff"/>
        </svg>
        {withText && (
          <span style={{
            fontSize:     size * 0.5,
            fontWeight:   700,
            color:        textColor,
            letterSpacing: '-0.3px',
            lineHeight:   1,
          }}>
            EstateIQ
          </span>
        )}
      </div>
    )
  }