import React from "react";
import { Styles, RepositoryResults, Repository } from "./Utils";
import InputField from "./InputField";
import RepositoryItem from "./RepositoryItem";

interface ContentsProps {
  styles: Styles,
  errorMessage: string,
  sendSearchQuery: Function,
  getBackEndUrl: Function,
  repositoryResults: RepositoryResults,
  hasSendSearchQuery: boolean,
  searchQuery: string,
  isSearching: boolean,
  itemsPerPage: number,
  actualSearchPage: number,
}

interface ContentsState {
}

export class Content extends React.Component<ContentsProps, ContentsState>
{
  constructor(props: ContentsProps) {
    super(props);
    this.state = {
    }
  }

  render() {
    const { showSidebar } = this.props.styles;

    const contentStyle = {
      paddingTop: showSidebar ? 20 : this.props.styles.topBarHeight + 20,
      paddingRight: 20,
      paddingBottom: showSidebar ? 20 : this.props.styles.footerMenuHeight + 20,
      paddingLeft: showSidebar ? this.props.styles.sidebarWidth + 20 : 20
    };

    return (
      <div style={contentStyle}>
        {this.props.errorMessage.length > 0 &&
          <div dangerouslySetInnerHTML={{ __html: this.props.errorMessage }} />
        }

        <InputField
          sendSearchQuery={this.props.sendSearchQuery}
          isSearching={this.props.isSearching}
          hasSendSearchQuery={this.props.hasSendSearchQuery}/>

        <p>
          {(this.props.repositoryResults.repositoryCount > 0 &&
            <span>Total repositories found: {this.props.repositoryResults.repositoryCount.toLocaleString()}</span>)
          }
          {(this.props.hasSendSearchQuery && this.props.repositoryResults.repositoryCount < 1 &&
            <span>No repositories found!</span>)
          }
        </p>

        {this.props.repositoryResults.repositories.map((repository: Repository, index: number) => {
          return (
            <RepositoryItem
              marginBottom={40}
              repository={repository}
              pageOffSet={this.props.itemsPerPage * this.props.actualSearchPage}
              getBackEndUrl={this.props.getBackEndUrl}
              index={index}
              key={index + repository.nameWithOwner}
            />
          );
        })}
      </div>
    );
  }
};

export default Content;
