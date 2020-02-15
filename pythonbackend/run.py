#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import os
import json
import requests

import sys
import traceback
import functools

import flask
import flask_cors

from debug_tools import getLogger
from debug_tools.utilities import wrap_text

log = getLogger( os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL' ), 'researcher' )

# https://gist.github.com/gbaman/b3137e18c739e0cf98539bf4ec4366ad
GRAPHQL_URL = "https://api.github.com/graphql"
REACT_APP_GITHUB_RESEARCHER_TOKEN = os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_TOKEN' )
GRAPHQL_HEADERS = { "Authorization": f"Bearer {REACT_APP_GITHUB_RESEARCHER_TOKEN}" }

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

DEFAULT_QUERY_ITEMS = 3
github_ratelimit_graphql = wrap_text( """
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    viewer {
      login
    }
""" )

def main():
    log( f"headers {str(GRAPHQL_HEADERS)[:30]}..." )
    log( f"REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT' )}..." )

    if len( REACT_APP_GITHUB_RESEARCHER_TOKEN ) < 20:
        raise RuntimeError( f"The GitHub access token 'REACT_APP_GITHUB_RESEARCHER_TOKEN="
            f"{REACT_APP_GITHUB_RESEARCHER_TOKEN}' was not defined" )

    graphqlresults = run_graphql_query( f"{{{github_ratelimit_graphql}}}" )
    log( formatratelimit( graphqlresults["data"] ) )

    APP.run(
        threaded=True,
        debug=True,
        host="0.0.0.0",
        port=os.environ["REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT"]
    )


def formatratelimit(resultdata):
    return (
        f"{resultdata['viewer']['login']}, "
        f"limit {resultdata['rateLimit']['remaining']}, "
        f"cost {resultdata['rateLimit']['cost']}, "
        f"{resultdata['rateLimit']['remaining']}, "
        f"{resultdata['rateLimit']['resetAt']}, "
    )


def getstacktrace():
    return "".join( traceback.format_exception( *sys.exc_info() ) )


def catch_remote_exceptions(wrapped_function):
    """ https://stackoverflow.com/questions/6126007/python-getting-a-traceback-from-a-multiprocessing-process """

    @functools.wraps(wrapped_function)
    def new_function(*args, **kwargs):
        try:
            return wrapped_function(*args, **kwargs)

        except:
            raise Exception( getstacktrace() )

    return new_function


class InvalidRequest(Exception):
    def __init__(self, flaskResponse):
        self.flaskResponse = flaskResponse


def validate_request_data(keyword, dictionary, datatype):
    if keyword not in dictionary:
        raise InvalidRequest( flask.Response(
            f"Error: Missing '{keyword}' on your post query!", status=400, mimetype='text/plain' ) )

    validate_request_dictionary(keyword, dictionary, datatype)


def validate_request_dictionary(keyword, dictionary, datatype):
    if keyword in dictionary:
        container = dictionary[keyword]

        if not isinstance( container, datatype ):
            raise InvalidRequest( flask.Response(
                f"Error: '{keyword}={container}' must be of type {datatype}!", status=400, mimetype='text/plain' ) )


def set_query_cursors(queryvariables, search_data):
    validate_request_dictionary( "startCursor", search_data, (str, type(None)) )
    validate_request_dictionary( "endCursor", search_data, (str, type(None)) )
    validate_request_dictionary( "itemsPerPage", search_data, int )

    if search_data.get( "startCursor", None ) and search_data.get( "endCursor", None ):
        raise InvalidRequest( flask.Response( wrap_text( f"""
                Error: You cannot set both 'startCursor={search_data.get( 'startCursor', None )}'
                and 'endCursor={search_data.get( 'endCursor', None )}' variables simultaneously!
        """, single_lines=True ), status=400, mimetype='text/plain' ) )

    if search_data.get( "startCursor", None ):
        queryvariables["first"] = None
        queryvariables["after"] = None
        queryvariables["last"] = search_data.get( "itemsPerPage", DEFAULT_QUERY_ITEMS )
        queryvariables["before"] = search_data.get( "startCursor" )

    elif search_data.get( "endCursor", None ):
        queryvariables["first"] = search_data.get( "itemsPerPage", DEFAULT_QUERY_ITEMS )
        queryvariables["after"] = search_data.get( "endCursor" )
        queryvariables["last"] = None
        queryvariables["before"] = None

    else:
        queryvariables["first"] = search_data.get( "itemsPerPage", DEFAULT_QUERY_ITEMS )
        queryvariables["after"] = None
        queryvariables["last"] = None
        queryvariables["before"] = None


@catch_remote_exceptions
@APP.route('/search_github', endpoint='search_github', methods=['POST'])
def search_github():
    results = {}

    try:
        search_data = flask.request.json
        log( 4, f"search_data {search_data}" )
        validate_request_data( "searchQuery", search_data, str )

        queryvariables = {
            "query": search_data["searchQuery"],
        }
        set_query_cursors( queryvariables, search_data )

        # https://github.community/t5/GitHub-API-Development-and/graphql-search-query-format/td-p/19238
        search_github_graphqlquery = wrap_text( """
            query SearchRepositories($query: String!, \
                                        $first: Int, $after: String, $last: Int, $before: String) {

              search(query: $query, type: REPOSITORY, \
                        first: $first, after: $after, last: $last, before: $before) {

                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                  hasPreviousPage
                }
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
            %s
            }
        """ ) % wrap_text( github_ratelimit_graphql, indent="  " )
        graphqlresults = run_graphql_query( search_github_graphqlquery, queryvariables )

        results["repositoryCount"] = graphqlresults["data"]["search"]["repositoryCount"]
        results["repositories"] = graphqlresults["data"]["search"]["nodes"]
        results["endCursor"] = graphqlresults["data"]["search"]["pageInfo"]["endCursor"]
        results["startCursor"] = graphqlresults["data"]["search"]["pageInfo"]["startCursor"]
        results["hasNextPage"] = graphqlresults["data"]["search"]["pageInfo"]["hasNextPage"]
        results["hasPreviousPage"] = graphqlresults["data"]["search"]["pageInfo"]["hasPreviousPage"]
        results["rateLimit"] = formatratelimit( graphqlresults["data"] )

    except InvalidRequest as error:
        return error.flaskResponse

    except Exception:
        return flask.Response( getstacktrace(), status=500, mimetype='text/plain' )

    dumped_json = json.dumps( results )
    return flask.Response( dumped_json, status=200, mimetype='application/json' )


@catch_remote_exceptions
@APP.route('/list_repositories', endpoint='list_repositories', methods=['POST'])
def list_repositories():
    results = {}

    try:
        search_data = flask.request.json
        log( 4, f"search_data {search_data}" )
        validate_request_data( "repositoryUser", search_data, str )

        queryvariables = {
            "user": search_data["repositoryUser"],
        }
        set_query_cursors( queryvariables, search_data )

        # https://stackoverflow.com/questions/39551325/github-graphql-orderby
        # https://stackoverflow.com/questions/48116781/github-api-v4-how-can-i-traverse-with-pagination-graphql
        list_repositories_graphqlquery = wrap_text( """
            query ListRepositories($user: String!, \
                                    $first: Int, $after: String, $last: Int, $before: String) {

              repositoryOwner(login: $user) {
                repositories(first: $first, after: $after, last: $last, before: $before, \
                                orderBy: {field: STARGAZERS, direction: DESC}) {

                  pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                    hasPreviousPage
                  }
                  nodes {
                    name
                  }
                }
              }
            %s
            }
        """ ) % wrap_text( github_ratelimit_graphql, indent="  " )
        graphqlresults = run_graphql_query( list_repositories_graphqlquery, queryvariables )

        results["repositories"] = graphqlresults["data"]["repositoryOwner"]["repositories"]["nodes"]
        results["endCursor"] = graphqlresults["data"]["repositoryOwner"]["repositories"]["pageInfo"]["endCursor"]
        results["startCursor"] = graphqlresults["data"]["repositoryOwner"]["repositories"]["pageInfo"]["startCursor"]
        results["hasNextPage"] = graphqlresults["data"]["repositoryOwner"]["repositories"]["pageInfo"]["hasNextPage"]
        results["hasPreviousPage"] = graphqlresults["data"]["repositoryOwner"]["repositories"]["pageInfo"]["hasPreviousPage"]
        results["rateLimit"] = formatratelimit( graphqlresults["data"] )

    except InvalidRequest as error:
        return error.flaskResponse

    except Exception:
        return flask.Response( getstacktrace(), status=500, mimetype='text/plain' )

    dumped_json = json.dumps( results )
    return flask.Response( dumped_json, status=200, mimetype='application/json' )


@catch_remote_exceptions
@APP.route('/detail_repository', endpoint='detail_repository', methods=['POST'])
def detail_repository():
    results = {}

    try:
        search_data = flask.request.json
        log( 4, f"search_data {search_data}" )

        validate_request_data( "repositoryUser", search_data, str )
        validate_request_data( "repositoryName", search_data, str )

        queryvariables = {
            "user": search_data["repositoryUser"],
            "repo": search_data["repositoryName"],
        }

        # https://graphql.org/learn/queries/
        detail_repository_graphqlquery = wrap_text( """
            query GetRepository($user: String!, $repo: String!) {
              repository(owner: $user, name: $repo) {
                createdAt
                issues(states:OPEN) {
                  totalCount
                }
                languages(first: 1) {
                  nodes {
                    name
                  }
                }
              }
            %s
            }
        """ ) % wrap_text( github_ratelimit_graphql, indent="  " )
        graphqlresults = run_graphql_query( detail_repository_graphqlquery, queryvariables )

        results = graphqlresults["data"]["repository"]
        results["rateLimit"] = formatratelimit( graphqlresults["data"] )

    except InvalidRequest as error:
        return error.flaskResponse

    except Exception:
        return flask.Response( getstacktrace(), status=500, mimetype='text/plain' )

    dumped_json = json.dumps( results )
    return flask.Response( dumped_json, status=200, mimetype='application/json' )


# A simple function to use requests.post to make the API call. Note the json= section.
# https://developer.github.com/v4/explorer/
def run_graphql_query(graphqlquery, queryvariables={}):
    request = requests.post( GRAPHQL_URL, json={'query': graphqlquery, 'variables': queryvariables}, headers=GRAPHQL_HEADERS )

    if request.status_code == 200:
        result = request.json()

        if "data" not in result or "errors" in result:
            raise Exception(
                f"There were errors while processing the query!\n"
                f"graphqlquery\n"
                f"{graphqlquery}\n"
                f"\n"
                f"queryvariables\n"
                f"{queryvariables}\n\n"
                f"'{json.dumps( result, indent=2, sort_keys=True )}'\n"
            )

    elif request.status_code == 401:
        raise Exception( f"Invalid GitHub access token provided {str(GRAPHQL_HEADERS)[:30]}..." )

    else:
        raise Exception( wrap_text(
            f"""Query failed to run by returning code of {request.status_code}.
            queryvariables:
            {queryvariables}

            graphqlquery:
            {graphqlquery}
        """ ) )

    return result


@catch_remote_exceptions
@APP.route('/kill_server', endpoint='kill_server', methods=['GET'])
def kill_server():
    # Kill the parent flask process (last process to kill)
    # https://stackoverflow.com/questions/13284858/how-to-share-the-global-app-object-in-flask
    # https://stackoverflow.com/questions/34122949/working-outside-of-application-context-flask
    # https://stackoverflow.com/questions/15562446/how-to-stop-flask-application-without-using-ctrl-c/17053522
    with flask.current_app.app_context():
        shutdown_function = flask.request.environ.get( 'werkzeug.server.shutdown' )

        if shutdown_function is None:
            raise RuntimeError( 'Not running with the Werkzeug Server' )
        shutdown_function()

    return flask.Response( status=200 )


if __name__ == "__main__":
    main()
