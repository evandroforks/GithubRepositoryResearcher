import React from "react";
import TopBar from "./components/TopBar";
import FooterMenu from "./components/FooterMenu";
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";
import Cookies from 'universal-cookie';

import { Button } from 'reactstrap';
import { Styles, MenuItem, RepositoryResults } from "./components/Utils";
import { createHashKeyFromMenuItems, getEnvironmentVariable, prettyPrintError } from "./components/Utils";

// https://stackoverflow.com/questions/39826992/how-can-i-set-a-cookie-in-react
const COOKIES = new Cookies();

interface AppProps {
}

interface AppState {
  errorMessage: string,
  windowWidth: number,
  windowHeight: number,
  repositoryResults: RepositoryResults,
  isSearching: boolean,
  actualSearchPageDelayed: number,
}

class App extends React.Component<AppProps, AppState> {
  private hasSendSearchQuery: boolean;
  private searchQuery: string;
  private backEndPort: string;
  private backEndIp: string;
  private itemsPerPage: number;
  private oldItemId: string | null;
  private lastItemId: string | null;
  private hasMorePages: boolean;
  private actualSearchPage: number;

  constructor(props: AppProps) {
    super(props);
    this.isBookmarked = this.isBookmarked.bind(this)
    this.getAllBookmarks = this.getAllBookmarks.bind(this)
    this.toogleBookmarks = this.toogleBookmarks.bind(this)
    this.getCookieName = this.getCookieName.bind(this)
    this.setError = this.setError.bind(this)
    this.getBackEndUrl = this.getBackEndUrl.bind(this)
    this.sendSearchQuery = this.sendSearchQuery.bind(this)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.nextSearchPage = this.nextSearchPage.bind(this)
    this.previousSearchPage = this.previousSearchPage.bind(this)

    this.hasSendSearchQuery = false
    this.searchQuery = ""
    this.lastItemId = null
    this.oldItemId = null
    this.itemsPerPage = 10
    this.hasMorePages = false
    this.actualSearchPage = 0
    this.backEndPort = getEnvironmentVariable("REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT", "9000");
    this.backEndIp = getEnvironmentVariable("REACT_APP_GITHUB_RESEARCHER_BACKEND_IP", "127.0.0.1");

    this.state = {
      actualSearchPageDelayed: 0,
      windowWidth: 0,
      windowHeight: 0,
      errorMessage: "",
      isSearching: false,
      repositoryResults: {rateLimit: "", lastItemId: null, hasMorePages: false, repositoryCount: 0, repositories: []}
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
      windowWidth: windowWidth,
      showFooterMenuText: windowWidth > 500,
      isTitleCollapsed: windowWidth < 350,
      showSidebar: windowWidth > 768,
      sidebarWidth: windowWidth < 1100 ? 70 : 180,
      sidebarCollapsed: windowWidth < 1100
    };

    const buttonStyle = {
      marginLeft: 5,
      marginRight: 5,
    }

    const menuItems: Array<MenuItem> = [
      { icon: <Button
          color="danger"
          style={buttonStyle}
          className="btn-block"
          disabled={!(this.actualSearchPage > 0) || this.state.isSearching}
          onClick={this.previousSearchPage}>«</Button>,
        text: <Button
          color="danger"
          style={buttonStyle}
          className="btn-block"
          disabled={!(this.actualSearchPage > 0) || this.state.isSearching}
          onClick={this.previousSearchPage}>Previous Page</Button>,
        },
        { icon: <Button color="danger"
            style={buttonStyle}
            className="btn-block"
            disabled={!this.hasMorePages || this.state.isSearching}
            onClick={this.nextSearchPage}>»</Button>,
        text: <Button color="danger"
          style={buttonStyle}
          className="btn-block"
          disabled={!this.hasMorePages || this.state.isSearching}
          onClick={this.nextSearchPage}>Next Page</Button>,
      },
    ]

    const menuItemsKey: string = createHashKeyFromMenuItems(menuItems)

    return (
      <div
        style={{
          backgroundColor: styles.black(0.05),
          minHeight: "100vh",
          position: "relative",
          maxWidth: "1200px",
          margin: "auto",
        }}
        key={windowWidth}
      >

        {(styles.showSidebar &&
          <Sidebar
            menuItems={menuItems}
            styles={styles}
            allbookmarks={this.getAllBookmarks()}
            COOKIES={COOKIES}
            key={menuItemsKey}
          />) ||
          <TopBar styles={styles} key={"topbar" + windowWidth} />
        }

        <Content styles={styles}
          errorMessage={this.state.errorMessage}
          sendSearchQuery={this.sendSearchQuery}
          getBackEndUrl={this.getBackEndUrl}
          repositoryResults={this.state.repositoryResults}
          hasSendSearchQuery={this.hasSendSearchQuery}
          searchQuery={this.searchQuery}
          isSearching={this.state.isSearching}
          itemsPerPage={this.itemsPerPage}
          actualSearchPage={this.state.actualSearchPageDelayed}
          isBookmarked={this.isBookmarked}
          toogleBookmarks={this.toogleBookmarks}
          key={"contents" + windowWidth + this.actualSearchPage + this.state.actualSearchPageDelayed} />

        {!styles.showSidebar && (
          <FooterMenu menuItems={menuItems} styles={styles} key={menuItemsKey} />
        )}
      </div>
    );
  }

  getCookieName(username: string) : string {
    return 'github_repository_researcher-' + username
  }

  isBookmarked(username: string) : boolean {
    let usercoockies: string = COOKIES.get(this.getCookieName(username))
    if(usercoockies === undefined) {
      return false
    }
    return true
  }

  getAllBookmarks() {
    let allbookmarks = COOKIES.get(this.getCookieName(""))
    if(allbookmarks === undefined) {
      allbookmarks = []
    }
    return allbookmarks
  }

  toogleBookmarks(username: string) {
    if(this.isBookmarked(username)) {
      let allbookmarks = COOKIES.get(this.getCookieName(""))

      if(allbookmarks === undefined) {
        allbookmarks = []
      }

      let cookiename: string = this.getCookieName(username)
      allbookmarks = allbookmarks.filter((item: string) => item !== cookiename)

      COOKIES.remove(cookiename);
      COOKIES.set(this.getCookieName(""), allbookmarks);
    }
    else {
      let allbookmarks = COOKIES.get(this.getCookieName(""))
      if(allbookmarks === undefined) {
        allbookmarks = []
      }

      let cookiename: string = this.getCookieName(username)
      allbookmarks.push(cookiename)

      COOKIES.set(cookiename, username.split("/")[1] + ', ' + username.split("/")[0]);
      COOKIES.set(this.getCookieName(""), allbookmarks);
    }
    this.forceUpdate()
  }

  nextSearchPage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if(this.hasMorePages) {
      this.actualSearchPage += 1
      this.oldItemId = this.lastItemId

      this.sendSearchQuery(this.searchQuery, false)
    }
  }

  previousSearchPage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if(this.actualSearchPage > 0) {
      this.actualSearchPage -= 1

      if(this.actualSearchPage === 0){
        this.lastItemId = null
        this.hasMorePages = false
      }
      else {
        this.lastItemId = this.oldItemId
      }

      this.sendSearchQuery(this.searchQuery, false)
    }
  }

  sendSearchQuery(searchQuery: string, restart = true) {
    // console.log("Sending searchQuery", searchQuery, "lastItemId", this.lastItemId)
    if(restart && this.searchQuery === searchQuery) {
      this.lastItemId = null
      this.hasMorePages = false
    }

    this.searchQuery = searchQuery
    this.setState({ isSearching: true })

    // https://stackoverflow.com/questions/39565706/post-request-with-fetch-api
    fetch(
      this.getBackEndUrl() + "/search_github",
      {
        method: 'POST',
        body: JSON.stringify(
          {
            searchQuery: searchQuery,
            lastItemId: this.lastItemId,
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
            this.hasSendSearchQuery = true
            var repositories_response = response.json()
            // console.log('Server response OK:', repositories_response);

          repositories_response.then(
            (response: RepositoryResults) => {
              // console.log('Server response:', response);
              // console.log( response.rateLimit );
              this.lastItemId = response.lastItemId
              this.hasMorePages = response.hasMorePages

              this.setState({
                repositoryResults: response,
                isSearching: false,
                actualSearchPageDelayed: this.actualSearchPage,
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
