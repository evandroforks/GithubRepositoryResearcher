import React from "react";
import { Styles, RepositoryResults, Repository } from "./Utils";
import InputFieldComponent from "./InputFieldComponent";

interface ContentsProps {
  styles: Styles,
  errorMessage: string,
  sendSearchQuery: Function,
  repositoryResults: RepositoryResults
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

        <InputFieldComponent sendSearchQuery={this.props.sendSearchQuery} />

        {(this.props.repositoryResults.repositoryCount > 0 &&
          <p>Total repositories found: {this.props.repositoryResults.repositoryCount}</p>) || <p>No repositories available to display.</p>
        }

        {this.props.repositoryResults.repositories.map((repository: Repository, i) => {
          return (
            <div key={i} style={{ marginBottom: 40 }}>
              <h2 style={{ marginBottom: 0 }}>{i + 1}. {repository.nameWithOwner} ({repository.stargazers.totalCount.toLocaleString()} stars)</h2>
              <p>{repository.description}</p>
            </div>
          );
        })}
      </div>
    );
  }
};

export default Content;
