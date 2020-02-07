import React from "react";
import TopBar from "./components/TopBar";
import FooterMenu from "./components/FooterMenu";
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";

import { createHashKeyFromMenuItems, Styles, MenuItem } from "./components/Utils";

interface AppProps {
}

interface AppState {
  windowWidth: number,
  windowHeight: number
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      windowWidth: 0,
      windowHeight: 0
    };
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    let windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    let windowHeight = typeof window !== "undefined" ? window.innerHeight : 0;

    this.setState({ windowWidth, windowHeight });
  }

  render() {
    const { windowWidth } = this.state;

    const styles: Styles = {
      white: (opacity: number = 1) => `rgba(255, 255, 255, ${opacity})`,
      black: (opacity: number = 1) => `rgba(0, 0, 0, ${opacity})`,
      topBarHeight: 40,
      footerMenuHeight: 50,
      showFooterMenuText: windowWidth > 500,
      showSidebar: windowWidth > 768,
      sidebarWidth: windowWidth < 1100 ? 100 : 200,
      sidebarCollapsed: windowWidth < 1100
    };

    const menuItems: Array<MenuItem> = styles.showSidebar
      ? [
        { icon: `😀`, text: "Item 1" },
        { icon: `😉`, text: "Item 2" },
        { icon: `😎`, text: "Item 3" },
        { icon: `🤔`, text: "Item 4" },
        { icon: `😛`, text: "Item 5" },
        { icon: `😺️`, text: "Profile" },
        { icon: `⚙`, text: "Settings" }
      ]
      : [
        { icon: `😀`, text: "Item 1" },
        { icon: `😉`, text: "Item 2" },
        { icon: `😎`, text: "Item 3" },
        { icon: `🤔`, text: "Item 4" },
        { icon: `😛`, text: "Item 5" }
      ];
    const menuItemsKey: string = createHashKeyFromMenuItems(menuItems)

    return (
      <div
        style={{
          backgroundColor: styles.black(0.05),
          minHeight: "100vh",
          position: "relative"
        }}
        key={windowWidth}
      >
        {styles.showSidebar ? (
          <Sidebar menuItems={menuItems} styles={styles} key={menuItemsKey} />
        ) : (
            <TopBar styles={styles} key={"topbar" + windowWidth} />
          )}

        <Content styles={styles} key={"contents" + windowWidth} />

        {!styles.showSidebar && (
          <FooterMenu menuItems={menuItems} styles={styles} key={menuItemsKey} />
        )}
      </div>
    );
  }
}

export default App;
