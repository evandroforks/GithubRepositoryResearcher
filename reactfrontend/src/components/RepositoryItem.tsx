import React from "react";
import { Repository, prettyPrintError, extendArray } from "./Utils";

interface RepositoryDetails {
  rateLimit: string,
  createdAt: string,
  issues: { totalCount: number },
  languages: {
      nodes: Array< { name: string } >,
  },
}

interface UserRepository {
  rateLimit: string,
  hasNextPage: false,
  endCursor: string,
  repositories: Array<{
    name: string,
  }>,
}

interface RepositoryItemProps {
  index: number,
  getBackEndUrl: Function,
  marginBottom: number,
  repository: Repository,
  pageOffSet: number,
  isBookmarked: Function,
  toogleBookmarks: Function,
}

interface RepositoryItemState {
  itemPage: number,
  hasNextPage: boolean,
  endCursor: string | null,
  errorMessage: string,
  userRepositories: Array<{ name: string }>,
  repositoryDetails: RepositoryDetails | null,
  isShowingDetails: boolean,
  isLoadingDetails: boolean,
  isLoadingRepositories: boolean,
}

export class Content extends React.Component<RepositoryItemProps, RepositoryItemState>
{
  constructor(props: RepositoryItemProps) {
    super(props);
    this.toggleDetails = this.toggleDetails.bind(this)
    this.loadMoreDetails = this.loadMoreDetails.bind(this)
    this.loadRepositoryDetails = this.loadRepositoryDetails.bind(this)
    this.loadUserRepositories = this.loadUserRepositories.bind(this)

    this.state = {
      itemPage: 0,
      isShowingDetails: false,
      errorMessage: "",
      hasNextPage: true,
      endCursor: null,
      userRepositories: [],
      repositoryDetails: null,
      isLoadingDetails: false,
      isLoadingRepositories: false,
    }
  }

  render() {
    let isBookmarked: string = this.props.isBookmarked(this.props.repository.nameWithOwner) ? "Remove from Bookmarks" : "Add to Bookmarks"

    return (
      <div key={this.props.index} style={{ marginBottom: this.props.marginBottom }}>
        {this.state.errorMessage.length > 0 &&
          <div dangerouslySetInnerHTML={{ __html: this.state.errorMessage }} />
        }

        <h5 style={{ marginBottom: 0 }}>
          {this.props.index + this.props.pageOffSet + 1}. { }
          {this.props.repository.nameWithOwner.replace("/", " / ")} { }
          ({this.props.repository.stargazers.totalCount.toLocaleString()} stars)
        </h5>

        <p>{this.props.repository.description}</p>
        {this.state.repositoryDetails != null && this.state.isShowingDetails && (
          <div>
            <b>Created at</b>: {this.state.repositoryDetails?.createdAt.replace(/(?<=-\d\d)T|(?<=:\d\d)Z/g, ", ")}
            <b>Open Issues count</b>: {this.state.repositoryDetails?.issues.totalCount}, { }
            <b>Top Language</b>: {this.state.repositoryDetails?.languages.nodes.map( (item: { name: string }, index: number) => {
                return (
                  <span key={item.name + index}>{item.name}, </span>
                )
              }
            )}
            <b>User Repositories</b>: {this.state.userRepositories.map((item: { name: string }, index: number) => {
                return (
                  <span key={item.name + index}><b>{index + 1})</b> { } {item.name}, </span>
                )
              }
            )}
          </div>
        )}

        <button type="button"
          onClick={this.loadMoreDetails}
          style={{ minWidth: "120px" }}
          disabled={!this.state.hasNextPage}>
          {this.state.isLoadingDetails || this.state.isLoadingRepositories ? "Loading more..." : "More details..."}
        </button>
        <button type="button"
          onClick={this.toggleDetails}
          style={{ minWidth: "120px" }}
          disabled={this.state.repositoryDetails == null}>
          {this.state.isShowingDetails ? "Hide details" : "Show Details"}
        </button>
        <button
            color="info"
            style={{ minWidth: "120px" }}
            onClick={(args: any) => { return this.props.toogleBookmarks(this.props.repository.nameWithOwner) }}
            key={isBookmarked}
          >{isBookmarked}</button>
      </div>
    );
  }

  toggleDetails() {
    this.setState({ isShowingDetails: !this.state.isShowingDetails } )
  }

  loadMoreDetails() {
    if(this.state.repositoryDetails == null) {
      this.setState({ isLoadingDetails: true })
      this.loadRepositoryDetails()
    }

    if(this.state.hasNextPage) {
      this.setState({ isLoadingRepositories: true })
      this.loadUserRepositories()
    }

    this.setState( { isShowingDetails: true } )
  }

  loadRepositoryDetails()
  {
    fetch(
      this.props.getBackEndUrl() + "/detail_repository",
      {
        method: 'POST',
        body: JSON.stringify(
          {
            repositoryUser: this.props.repository.nameWithOwner.split("/")[0],
            repositoryName: this.props.repository.nameWithOwner.split("/")[1],
          }
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(
        response =>
        {
          if (response.ok) {
            var repositories_response = response.json()

            repositories_response.then(
              (response: RepositoryDetails) =>
              {
                this.setState({
                  repositoryDetails: response,
                  isLoadingDetails: false,
                });
              }).catch(this.setError)
          }
          else {
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

  loadUserRepositories()
  {
    fetch(
      this.props.getBackEndUrl() + "/list_repositories",
      {
        method: 'POST',
        body: JSON.stringify(
          {
            repositoryUser: this.props.repository.nameWithOwner.split("/")[0],
            endCursor: this.state.endCursor,
            itemsPerPage: 100,
          }
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(
        response =>
        {
          if (response.ok) {
            var repositories_response = response.json()

            repositories_response.then(
              (response: UserRepository) =>
              {
                let userRepositories = this.state.userRepositories
                extendArray(userRepositories, response.repositories)

                this.setState({
                  userRepositories: userRepositories,
                  endCursor: response.endCursor,
                  hasNextPage: response.hasNextPage,
                  isLoadingRepositories: false,
                });
              }).catch(this.setError)
          }
          else {
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
};

export default Content;
