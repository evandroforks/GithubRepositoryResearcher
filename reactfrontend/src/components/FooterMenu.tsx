import React from "react";
import { Styles, MenuItem } from "./Utils";
import ReactTooltip from 'react-tooltip'

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
            data-tip={item.text.props.children}
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {(styles.showFooterMenuText && item.text) ||
              <span style={{ marginLeft: 5, fontSize: 16 }}>{item.icon}</span>
            }
          </div>
        );
      })}
      <ReactTooltip effect="float" />
    </div>
  );
};

export default FooterMenu;
