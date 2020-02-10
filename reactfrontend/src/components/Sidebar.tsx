import React from "react";
import ReactTooltip from 'react-tooltip'
import { Styles, MenuItem } from "./Utils";

const Sidebar = ({ menuItems, styles, allbookmarks, COOKIES }: {menuItems: Array<MenuItem>, styles: Styles, allbookmarks: Array<string>, COOKIES: any}) => {
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
    fontSize: 16,
    marginRight: styles.sidebarCollapsed ? 0 : 10
  };

  const logoStyle = {
    textAlign: "center",
    color: styles.white(),
    fontSize: 28,
    marginBottom: 60,
    fontWeight: "bold"
  };

  return (
    <div style={sidebarStyle as React.CSSProperties} key={styles.sidebarWidth}>
      <div style={logoStyle as React.CSSProperties}
        key={styles.sidebarWidth}
        data-place="right"
        data-multiline={true}
        data-tip="GitHub<br>Repository<br>Researcher"
      >{styles.sidebarCollapsed ? "GH RS" : "GitHub Repository Researcher"}</div>
      {menuItems.slice().reverse().map((item, index: number) => (
        <div style={menuItemStyle}
          data-place="right"
          data-tip={item.text.props.children}
          key={styles.sidebarWidth + item.text + index}
        >
          {(!styles.sidebarCollapsed && item.text) ||
            <span style={iconStyle} key={styles.sidebarWidth + index}>{item.icon}</span>
          }
        </div>
      ))}

      {allbookmarks.map((item, index: number) => (
      <div style={menuItemStyle} data-tip={COOKIES.get(item)} data-place="right" key={item + index}>
        {(!styles.sidebarCollapsed && index + 1 + '. ' + COOKIES.get(item).substring(0,18)) ||
          <span style={iconStyle} key={styles.sidebarWidth + index}>{index + 1 + '. ' + COOKIES.get(item).substring(0,5)}</span>
        }
      </div>
      ))}
      <ReactTooltip effect="float" />
    </div>
  );
};

export default Sidebar;
