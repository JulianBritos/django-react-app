import clsx from "clsx";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  isLoading = false,
  type = "button",
  fullWidth = false,
  as,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default:
      "bg-black text-primary-500 hover:bg-gray-800 active:bg-gray-900 shadow-sm",
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
    secondary:
      "bg-gray-600 text-primary-500 hover:bg-gray-700 active:bg-gray-800 shadow-sm",
    success:
      "bg-thirdary-600 text-white hover:bg-thirdary-700 active:bg-thirdary-800 shadow-sm",
    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 shadow-sm",
    outline:
      "text-primary-500 border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 bg-white",
    outlinePrimary:
      "border border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 bg-white",
    outlineSuccess:
      "border border-thirdary-600 text-thirdary-600 hover:bg-thirdary-50 active:bg-thirdary-100 bg-white",
    ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
    ghostPrimary: "text-blue-600 hover:bg-blue-50 active:bg-blue-100",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    link: "text-blue-600 hover:text-blue-800 underline p-0 h-auto",
  };

  const sizes = {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 py-3 text-base",
    xl: "h-14 px-8 py-4 text-lg",
    icon: "h-10 w-10",
    iconSm: "h-8 w-8",
    iconLg: "h-12 w-12",
  };

  const Component = as || "button";
  const buttonProps = as ? {} : { type };

  return (
    <Component
      {...buttonProps}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </Component>
  );
};

// Export both named and default for flexibility
export { Button };
export default Button;
