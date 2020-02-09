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
  isSearching: boolean
}

interface ContentsState {
  actualPage: number
}

export class Content extends React.Component<ContentsProps, ContentsState>
{
  constructor(props: ContentsProps) {
    super(props);
    this.state = {
      actualPage: 0
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
    const itemsPerPage = 10

    return (
      <div style={contentStyle}>
        {this.props.errorMessage.length > 0 &&
          <div dangerouslySetInnerHTML={{ __html: this.props.errorMessage }} />
        }

        <InputField
          sendSearchQuery={this.props.sendSearchQuery}
          isSearching={this.props.isSearching}
          hasSendSearchQuery={this.props.hasSendSearchQuery}/>

        {(this.props.repositoryResults.repositoryCount > 0 &&
          <p>Total repositories found: {this.props.repositoryResults.repositoryCount.toLocaleString()}</p>)
        }
        {(this.props.hasSendSearchQuery && this.props.repositoryResults.repositoryCount < 1 &&
          <p>No repositories found!</p>)
        }

        {this.props.repositoryResults.repositories.map((repository: Repository, index: number) => {
          return (
            <RepositoryItem
              marginBottom={40}
              repository={repository}
              pageOffSet={itemsPerPage * this.state.actualPage}
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
