import React from "react";
import { Repository, prettyPrintError, extendArray } from "./Utils";

interface RepositoryDetails {
  createdAt: string,
  issues: { totalCount: number },
  languages: {
      nodes: Array< { name: string } >
  }
}

interface UserRepository {
  hasMorePages: false,
  lastItemId: string,
  repositories: Array<{
    name: string
  }>
}
interface RepositoryItemProps {
  index: number,
  getBackEndUrl: Function,
  marginBottom: number,
  repository: Repository,
  pageOffSet: number
}

interface RepositoryItemState {
  itemPage: number,
  hasMorePages: boolean,
  lastItemId: string | null,
  errorMessage: string,
  userRepositories: Array<{ name: string }>,
  repositoryDetails: RepositoryDetails | null
}

export class Content extends React.Component<RepositoryItemProps, RepositoryItemState>
{
  constructor(props: RepositoryItemProps) {
    super(props);
    this.loadMoreDetails = this.loadMoreDetails.bind(this)
    this.loadRepositoryDetails = this.loadRepositoryDetails.bind(this)
    this.loadUserRepositories = this.loadUserRepositories.bind(this)

    this.state = {
      itemPage: 0,
      errorMessage: "",
      hasMorePages: true,
      lastItemId: null,
      userRepositories: [],
      repositoryDetails: null
    }
  }

  render() {
    return (
      <div key={this.props.index} style={{ marginBottom: this.props.marginBottom }}>
        {this.state.errorMessage.length > 0 &&
          <div dangerouslySetInnerHTML={{ __html: this.state.errorMessage }} />
        }

        <h2 style={{ marginBottom: 0 }}>
          {this.props.index + this.props.pageOffSet + 1}. { }
          {this.props.repository.nameWithOwner} { }
          ({this.props.repository.stargazers.totalCount.toLocaleString()} stars)
        </h2>
        <p>{this.props.repository.description}</p>
        {this.state.repositoryDetails != null && (
          <div>
            Created at: {this.state.repositoryDetails?.createdAt.replace(/(?<=-\d\d)T|(?<=:\d\d)Z/g, ", ")}
            Open Issues count: {this.state.repositoryDetails?.issues.totalCount}, { }
            Top Language: {this.state.repositoryDetails?.languages.nodes.map( (item: { name: string }, index: number) => {
                return (
                  <span key={item.name}>{item.name + index}, </span>
                )
              }
            )}
            User Repositories: {this.state.userRepositories.map((item: { name: string }, index: number) => {
                return (
                  <span key={item.name + index}>{item.name}, </span>
                )
              }
            )}
          </div>
        )}
        <button type="button" onClick={this.loadMoreDetails} disabled={!this.state.hasMorePages}>More details...</button>
      </div>
    );
  }

  loadMoreDetails() {
    if(this.state.repositoryDetails == null) {
      this.loadRepositoryDetails()
    }

    if(this.state.hasMorePages) {
      this.loadUserRepositories()
    }
  }

  loadRepositoryDetails() {
    // console.log("Sending loadMoreDetails for", this.props.repository.nameWithOwner)

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
        response => {
          // console.log('Server response', response);

          if (response.ok) {
            var repositories_response = response.json()
            // console.log( 'Server response OK:', repositories_response );

            repositories_response.then(
              (response: RepositoryDetails) => {
                // console.log( 'Server response:', response );

                this.setState({
                  repositoryDetails: response,
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

  loadUserRepositories() {
    // console.log("Sending loadUserRepositories for", this.props.repository.nameWithOwner)

    fetch(
      this.props.getBackEndUrl() + "/list_repositories",
      {
        method: 'POST',
        body: JSON.stringify(
          {
            repositoryUser: this.props.repository.nameWithOwner.split("/")[0],
            lastItemId: this.state.lastItemId,
            itemsPerPage: 100,
          }
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(
        response => {
          // console.log('Server response', response);

          if (response.ok) {
            var repositories_response = response.json()
            // console.log( 'Server response OK:', repositories_response );

            repositories_response.then(
              (response: UserRepository) => {
                // console.log( 'Server response:', response );

                let userRepositories = this.state.userRepositories
                extendArray(userRepositories, response.repositories)

                this.setState({
                  userRepositories: userRepositories,
                  lastItemId: response.lastItemId,
                  hasMorePages: response.hasMorePages,
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
