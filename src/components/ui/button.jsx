export const Button = ({ onClick, children, disabled, variant = "primary" }) => {
    const baseStyles = "px-4 py-2 rounded-md text-white";
    const variantStyles = variant === "success"
      ? "bg-green-500 hover:bg-green-600"
      : "bg-blue-500 hover:bg-blue-600";
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {children}
      </button>
    );
  };
  