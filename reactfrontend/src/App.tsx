import React from "react";
import TopBar from "./components/TopBar";
import FooterMenu from "./components/FooterMenu";
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";

import { Styles, MenuItem, RepositoryResults } from "./components/Utils";
import { createHashKeyFromMenuItems, getEnvironmentVariable, prettyPrintError } from "./components/Utils";

interface AppProps {
}

interface AppState {
  hasSendSearchQuery: boolean,
  searchQuery: string,
  errorMessage: string,
  windowWidth: number,
  windowHeight: number,
  repositoryResults: RepositoryResults,
  isSearching: boolean,
  lastItemId: string | null,
}

class App extends React.Component<AppProps, AppState> {
  private backEndPort: string;
  private backEndIp: string;
  private itemsPerPage: number;

  constructor(props: AppProps) {
    super(props);
    this.setError = this.setError.bind(this)
    this.getBackEndUrl = this.getBackEndUrl.bind(this)
    this.sendSearchQuery = this.sendSearchQuery.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)

    this.itemsPerPage = 10
    this.backEndPort = getEnvironmentVariable("REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT", "9000");
    this.backEndIp = getEnvironmentVariable("REACT_APP_GITHUB_RESEARCHER_BACKEND_IP", "127.0.0.1");

    this.state = {
      hasSendSearchQuery: false,
      lastItemId: null,
      searchQuery: "",
      windowWidth: 0,
      windowHeight: 0,
      errorMessage: "",
      isSearching: false,
      repositoryResults: {rateLimit: "", repositoryCount: 0, repositories: []}
    };
  }

  getBackEndUrl() {
    return `http://${this.backEndIp}:${this.backEndPort}`;
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

        <Content styles={styles}
          errorMessage={this.state.errorMessage}
          sendSearchQuery={this.sendSearchQuery}
          getBackEndUrl={this.getBackEndUrl}
          repositoryResults={this.state.repositoryResults}
          hasSendSearchQuery={this.state.hasSendSearchQuery}
          searchQuery={this.state.searchQuery}
          isSearching={this.state.isSearching}
          itemsPerPage={this.itemsPerPage}
          key={"contents" + windowWidth} />

        {!styles.showSidebar && (
          <FooterMenu menuItems={menuItems} styles={styles} key={menuItemsKey} />
        )}
      </div>
    );
  }

  sendSearchQuery(searchQuery: string) {
    // console.log("Sending searchQuery", searchQuery)
    this.setState({ isSearching: true })

    // https://stackoverflow.com/questions/39565706/post-request-with-fetch-api
    fetch(
      this.getBackEndUrl() + "/search_github",
      {
        method: 'POST',
        body: JSON.stringify(
          {
            searchQuery: searchQuery,
            lastItemId: this.state.lastItemId,
            itemsPerPage: this.itemsPerPage,
          }
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(
        response => {
          // console.log('Server response', response);

          // https://stackoverflow.com/questions/51568437/return-body-text-from-fetch-api
          if (response.ok) {
            var repositories_response = response.json()
            // console.log('Server response OK:', repositories_response);

            repositories_response.then(
              (response: RepositoryResults) => {
                // console.log('Server response:', response);
                console.log( response.rateLimit );

                this.setState({
                  repositoryResults: response,
                  hasSendSearchQuery: true,
                  searchQuery: searchQuery,
                  isSearching: false
                });
            }).catch(this.setError)
          }
          else {
            // https://stackoverflow.com/questions/55833486/use-fetch-read-response-body-from-non-http-ok
            response.text().then(
              text => {
                throw new Error('Could not get the server response after sending the request!\n'
                  + response.statusText
                  + '\n'
                  + text);
            }).catch(this.setError)
          }
    }).catch(this.setError)
  }

  setError(error: Error) {
    let message: string = prettyPrintError(error);
    alert(message);

    message = message.split(" ").join("&nbsp;");
    message = message.split("\n").join("<br/>");
    this.setState({ errorMessage: message })
  }
}

export default App;
