// src/components/header/index.tsx
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  theme,
  Typography,
} from "antd";
import React, { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    // Cambiamos a space-between para repartir el espacio
    justifyContent: "space-between", 
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
    transition: "all 0.3s",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 4; // Asegura que el header esté por encima de otros elementos, en caso de que sobrpongan, incrementar el valor
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      {/* TÍTULO AGREGADO A LA IZQUIERDA */}
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          // El token colorText cambia de color según el modo oscuro/claro
          color: token.colorText, 
          flex: 1,
          maxWidth: "50%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Visor Presupuestario
      </div>

      {/* CONTROLES EXISTENTES A LA DERECHA */}
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <Space style={{ marginLeft: "8px" }} size="middle">
          {user?.name && <Text strong style={{ color: token.colorText }}>{user.name}</Text>}
          {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};