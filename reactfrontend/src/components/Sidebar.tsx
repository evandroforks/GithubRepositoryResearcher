import React from "react";
import ReactTooltip from 'react-tooltip'
import { Styles, MenuItem } from "./Utils";

const Sidebar = ({ menuItems, styles }: {menuItems: Array<MenuItem>, styles: Styles}) => {
  const sidebarStyle = {
    height: "100vh",
    width: styles.sidebarWidth,
    position: "fixed",
    backgroundColor: styles.black(0.8),
    paddingTop: 40
  };

  const menuItemStyle = {
    display: "flex",
    justifyContent: styles.sidebarCollapsed ? "center" : "flex-start",
    alignItems: "center",
    padding: `4px ${styles.sidebarCollapsed ? 0 : 10}px`,
    color: styles.white(0.9)
  };

  const iconStyle = {
    fontSize: 26,
    marginRight: styles.sidebarCollapsed ? 0 : 10
  };

  const logoStyle = {
    textAlign: "center",
    color: styles.white(),
    fontSize: 34,
    marginBottom: 60,
    fontWeight: "bold"
  };

  return (
    <div style={sidebarStyle as React.CSSProperties} key={styles.sidebarWidth}>
      <div style={logoStyle as React.CSSProperties} key={styles.sidebarWidth}>{styles.sidebarCollapsed ? "GH RRS" : "GitHub Repository Researcher"}</div>
      {menuItems.map((item, index: number) => (
        <div style={menuItemStyle} data-tip={item.text} key={styles.sidebarWidth + item.text + index}>
          <span style={iconStyle} key={styles.sidebarWidth + index}>{item.icon}</span>
          {!styles.sidebarCollapsed && item.text}
        </div>
      ))}
      <ReactTooltip effect="float" />
    </div>
  );
};

export default Sidebar;
