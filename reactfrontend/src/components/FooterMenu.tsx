import React from "react";
import { Styles, MenuItem } from "./Utils";

const FooterMenu = ({ menuItems, styles }: {menuItems: Array<MenuItem>, styles: Styles}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        height: styles.footerMenuHeight,
        backgroundColor: "#333",
        color: "#fff",
        position: "fixed",
        bottom: 0,
      }}
    >
      {menuItems.map((item, i) => {
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {(styles.showFooterMenuText && item.text) ||
              <span style={{ marginLeft: 5, fontSize: 20 }}>{item.icon}</span>
            }
          </div>
        );
      })}
    </div>
  );
};

export default FooterMenu;
