import React from "react";
import { Styles } from "./Utils";

const TopBar = ({ styles }: {styles: Styles}) => {
  const topBarStyle = {
    position: "fixed",
    top: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: styles.topBarHeight,
    backgroundColor: "#fff",
    borderBottom: "1px solid #d8d8d8",
    fontWeight: "bold",
    padding: "0px 20px",
    boxSizing: "border-box"
  };

  return (
    <div style={topBarStyle as React.CSSProperties} key={styles.topBarHeight}>
      <span>{`😺️`}</span>
      GitHub Repository Researcher
      <span>{`⚙️`}</span>
    </div>
  );
};

export default TopBar;
