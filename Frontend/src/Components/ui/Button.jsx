import React from "react";
import "./Button.module.css";

export function Button({ children, size = "md", variant = "solid", className = "", ...props }) {
  const sizeClasses = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  const variantClasses = {
    solid: "btn-solid",
    outline: "btn-outline",
  };

  // Combine class names manually
  const classes = `btn ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
