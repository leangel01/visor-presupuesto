// src/components/layout/Title.tsx
import React from "react";
import { theme } from "antd";

const { useToken } = theme;

export const Title = ({ collapsed }: { collapsed: boolean }) => {
  const { token } = useToken();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        overflow: "hidden",
      }}
    >
      {/* 
          Usamos el token colorText para que sea blanco en modo Dark 
          y oscuro en modo Light automáticamente.
      */}
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: token.colorText,
          whiteSpace: "nowrap",
          letterSpacing: "-0.2px",
          transition: "all 0.3s",
        }}
      >
        {collapsed ? (
          <span style={{ color: token.colorPrimary }}> </span>
        ) : (
          " "
        )}
      </div>
    </div>
  );
};