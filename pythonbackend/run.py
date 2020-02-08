#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import os
import requests

import flask
import flask_cors

from debug_tools import getLogger
from debug_tools.utilities import wrap_text

log = getLogger( os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL' ), 'researcher' )

# https://gist.github.com/gbaman/b3137e18c739e0cf98539bf4ec4366ad
graphql_url = "https://api.github.com/graphql"
headers = { "Authorization": f"Bearer {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_TOKEN' )}" }

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


def run_graphql_query(graphqlquery): # A simple function to use requests.post to make the API call. Note the json= section.
    request = requests.post( graphql_url, json={'query': graphqlquery}, headers=headers )

    if request.status_code == 200:
        result = request.json()

        if "data" not in result:
            raise Exception( f"There is no data in the result! '{result}'" )

    else:
        raise Exception( wrap_text(
            f"""Query failed to run by returning code of {request.status_code}.
            graphqlquery:
            {graphqlquery}
        """, trim_spaces=" " ) )

    return result


if __name__ == "__main__":
    main()
