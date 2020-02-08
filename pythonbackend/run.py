#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import os
import json
import requests

import flask
import flask_cors

from debug_tools import getLogger
from debug_tools.utilities import wrap_text

log = getLogger( os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL' ), 'researcher' )

# https://gist.github.com/gbaman/b3137e18c739e0cf98539bf4ec4366ad
graphql_url = "https://api.github.com/graphql"
headers = { "Authorization": f"Bearer {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_TOKEN' )}" }

# https://github.community/t5/GitHub-API-Development-and/graphql-search-query-format/td-p/19238
search_github_graphqlquery = wrap_text( """
    query topRepos($query: String!) {
      search(first: 3, query: $query, type: REPOSITORY) {
        repositoryCount
        nodes {
          ... on Repository {
            nameWithOwner
            description
            stargazers {
              totalCount
            }
          }
        }
      }
    }
""" )

# https://stackoverflow.com/questions/15117416/capture-arbitrary-path-in-flask-route
# https://stackoverflow.com/questions/44209978/serving-a-front-end-created-with-create-react-app-with-flask
APP = flask.Flask(
    "github_repository_researcher",
    static_folder="reactfrontend/build/static",
    template_folder="reactfrontend/build",
)

# https://stackoverflow.com/questions/25594893/how-to-enable-cors-in-flask-and-heroku
# https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present
flask_cors.CORS( APP )

def main():
    log( f"headers {str(headers)[:30]}..." )
    log( f"REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT' )}..." )

    result = run_graphql_query( wrap_text( """
        {
            viewer {
                login
            }
            rateLimit {
                limit
                cost
                remaining
                resetAt
            }
        }
    """, trim_spaces=" " ) )

    log( f"User {result['data']['viewer']['login']}, "
        f"rate limit {result['data']['rateLimit']['remaining']}, "
        f"cost {result['data']['rateLimit']['cost']}, "
        f"remaining {result['data']['rateLimit']['remaining']}, "
        f"reset {result['data']['rateLimit']['resetAt']}, "
    )

    APP.run(
        threaded=True,
        debug=True,
        host="0.0.0.0",
        port=os.environ["REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT"]
    )


@APP.route('/search_github', endpoint='search_github', methods=['POST'])
def search_github():
    results = {}

    try:
        search_data = flask.request.json
        log( 4, f"search_data {search_data}" )

        if "search_query" not in search_data:
            return flask.Response( "Error: Missing 'search_query' on post query!", status=400, mimetype='text/plain' )

        if not isinstance( search_data["search_query"], str ):
            return flask.Response( "Error: 'search_query' must be a string!", status=400, mimetype='text/plain' )

        queryvariables = {
            "query": search_data["search_query"]
        }

        graphqlresults = run_graphql_query( search_github_graphqlquery, queryvariables )
        results["repositoryCount"] = graphqlresults["data"]["search"]["repositoryCount"]
        results["repositories"] = graphqlresults["data"]["search"]["nodes"]

    except Exception as error:
        return flask.Response( str(error), status=500, mimetype='text/plain' )

    dumped_json = json.dumps( results )
    return flask.Response( dumped_json, status=200, mimetype='application/json' )


# A simple function to use requests.post to make the API call. Note the json= section.
# https://developer.github.com/v4/explorer/
def run_graphql_query(graphqlquery, queryvariables={}):
    request = requests.post( graphql_url, json={'query': graphqlquery, 'variables': queryvariables}, headers=headers )

    if request.status_code == 200:
        result = request.json()

        if "data" not in result:
            raise Exception( f"There is no data in the result!\n'{json.dumps( result, indent=2, sort_keys=True )}'" )

    else:
        raise Exception( wrap_text(
            f"""Query failed to run by returning code of {request.status_code}.
            queryvariables:
            {queryvariables}
            graphqlquery:
            {graphqlquery}
        """ ) )

    return result


if __name__ == "__main__":
    main()
