import React, { useState } from "react";

const ProductImage = ({ src, alt, className = "", ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.png");

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc("/placeholder.png")}
      {...props}
    />
  );
};

export default ProductImage;
