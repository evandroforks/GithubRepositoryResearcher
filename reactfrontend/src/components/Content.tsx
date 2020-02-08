import React from "react";
import { Styles, RepositoryResults, Repository } from "./Utils";
import InputFieldComponent from "./InputFieldComponent";

const Content = ({ styles, errorMessage, sendSearchQuery, repositoryResults }:
  { styles: Styles, errorMessage: string, sendSearchQuery: Function, repositoryResults: RepositoryResults}) =>
{
  const { showSidebar } = styles;

  const contentStyle = {
    paddingTop: showSidebar ? 20 : styles.topBarHeight + 20,
    paddingRight: 20,
    paddingBottom: showSidebar ? 20 : styles.footerMenuHeight + 20,
    paddingLeft: showSidebar ? styles.sidebarWidth + 20 : 20
  };

  return (
    <div style={contentStyle}>
      {errorMessage.length > 0 &&
        <div dangerouslySetInnerHTML={{ __html: errorMessage }} />
      }

      <InputFieldComponent sendSearchQuery={sendSearchQuery} />

      {(repositoryResults.repositoryCount > 0 &&
        <p>Total repositories found: {repositoryResults.repositoryCount}</p>) || <p>No repositories available to display.</p>
      }

      {repositoryResults.repositories.map((repository: Repository, i) => {
        return (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ marginBottom: 0 }}>{i + 1}. {repository.nameWithOwner} ({repository.stargazers.totalCount.toLocaleString()} stars)</h2>
            <p>{repository.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Content;
