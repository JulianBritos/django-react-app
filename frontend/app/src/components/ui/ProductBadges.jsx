import React from "react";

// badge: { text: string, type: "discount" | "out-of-stock" | "low-stock" | "new" }
const badgeStyles = {
  discount: "bg-red-500 text-white",
  "out-of-stock": "bg-gray-500 text-white",
  "low-stock": "bg-orange-500 text-white",
  new: "bg-green-500 text-white",
};

const ProductBadges = ({ badges = [], className = "", size = "md" }) => {
  const sizeClasses =
    size === "sm"
      ? "px-1.5 py-0.5 text-xs font-medium"
      : "px-2 py-1 text-xs font-medium";
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center rounded-full ${sizeClasses} ${
            badgeStyles[badge.type] || badgeStyles.new
          }`}
        >
          {badge.text}
        </span>
      ))}
    </div>
  );
};

export default ProductBadges;
