import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const GlassPanel = ({ children, className = "" }: Props) => {
  return <div className={`glass-panel ${className}`}>{children}</div>;
};

export default GlassPanel;
