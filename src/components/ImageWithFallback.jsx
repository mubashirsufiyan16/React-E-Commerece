import { useState } from 'react'

const FALLBACK_IMAGE = '/product-placeholder.svg'

function ImageWithFallback({ src, alt, ...imageProps }) {
  const [failedSource, setFailedSource] = useState(null)
  const imageSrc = !src || failedSource === src ? FALLBACK_IMAGE : src

  function handleError() {
    if (imageSrc !== FALLBACK_IMAGE) setFailedSource(src)
  }

  return <img {...imageProps} alt={alt} onError={handleError} src={imageSrc} />
}

export default ImageWithFallback
