#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import os
import sys

# https://github.com/evandrocoan/debugtools/blob/079eee5f9b028c4cd17dee0da6a803adcf7d061d/tests/testing/main_unit_tests.py#L69-L75
def assert_path(*args):
    module = os.path.realpath( os.path.join( *args ) )
    if module not in sys.path:
        sys.path.append( module )

this_direcotory = os.path.dirname( os.path.realpath( __file__ ) )
assert_path( os.path.dirname( this_direcotory ) )
assert_path( os.path.dirname( this_direcotory ), "tests" )

import json
import unittest
import requests

from testutils import TimeSpentTestCase
from debug_tools import getLogger

log = getLogger( os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL' ), __name__ )

log( f"REACT_APP_GITHUB_RESEARCHER_BACKEND_IP {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP' )}..." )
log( f"REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT' )}..." )

def main():
    unittest.main()


class PythonBackendIntegrationTests(TimeSpentTestCase):
    # https://realpython.com/python-requests/
    server_url = r'http://{}:{}'.format(
        os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP' ),
        os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT' ),
    )

    def decoded_response(self, response_content):
        decoded_response = response_content
        decoded_response = decoded_response.decode("UTF-8", errors='replace')
        decoded_response = decoded_response.replace('\r\n', '\n').rstrip(' \n\r')
        return decoded_response

    def test_invalid_server_path_request(self):
        response = requests.post(
            "%s/add_path" % self.server_url,
            data=json.dumps( {} ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( decoded_response, r"The requested URL was not found on the server" )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/html' )
        self.assertEqual( 404, response.status_code )

    def test_empty_server_search_github_request(self):
        response = requests.post(
            "%s/search_github" % self.server_url,
            data=json.dumps( {} ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( decoded_response, r"Missing 'searchQuery' on your post query" )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/plain' )
        self.assertEqual( 400, response.status_code )

    def test_invalid_server_search_github_request(self):
        response = requests.post(
            "%s/search_github" % self.server_url,
            data=json.dumps( {
                "searchQuery": 10
            } ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( decoded_response, r"'searchQuery=10' must be of type <class 'str'>" )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/plain' )
        self.assertEqual( 400, response.status_code )

    def test_valid_server_search_github_request(self):
        response = requests.post(
            "%s/search_github" % self.server_url,
            data=json.dumps( {
                "searchQuery": "language:javascript sort:stars"
            } ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( response.headers.get( "Content-Type" ), r'application/json' )
        self.assertEqual( 200, response.status_code )

        json_response = json.loads( response.content )
        self.assertGreater( json_response["repositoryCount"], 10 )
        self.assertGreater( len( json_response["repositories"] ), 2 )

        self.assertIn( "hasMorePages", json_response )
        self.assertGreater( len( json_response["lastItemId"] ), 2 )

    def test_empty_server_list_repositories_request(self):
        response = requests.post(
            "%s/list_repositories" % self.server_url,
            data=json.dumps( {} ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( decoded_response, r"Missing 'repositoryUser' on your post query" )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/plain' )
        self.assertEqual( 400, response.status_code )

    def test_valid_server_list_repositories_request(self):
        response = requests.post(
            "%s/list_repositories" % self.server_url,
            data=json.dumps( {
                "repositoryUser": "evandrocoan"
            } ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( response.headers.get( "Content-Type" ), r'application/json' )
        self.assertEqual( 200, response.status_code )

        json_response = json.loads( response.content )
        self.assertEqual( len( json_response ), 3 )
        self.assertGreater( len( json_response["repositories"] ), 2 )

        self.assertIn( "hasMorePages", json_response )
        self.assertGreater( len( json_response["lastItemId"] ), 2 )

    def test_empty_server_detail_repositories_request(self):
        response = requests.post(
            "%s/detail_repository" % self.server_url,
            data=json.dumps( {} ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( decoded_response, r"Missing 'repositoryUser' on your post query" )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/plain' )
        self.assertEqual( 400, response.status_code )

    def test_valid_server_detail_repositories_request(self):
        response = requests.post(
            "%s/detail_repository" % self.server_url,
            data=json.dumps( {
                "repositoryUser": "evandrocoan",
                "repositoryName": "ITE"
            } ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( response.headers.get( "Content-Type" ), r'application/json' )
        self.assertEqual( 200, response.status_code )

        json_response = json.loads( response.content )
        self.assertEqual( len( json_response ), 1 )
        self.assertGreater( len( json_response["repository_data"] ), 2 )
        self.assertIn( "totalCount", json_response["repository_data"]["issues"] )


def load_tests(loader, standard_tests, pattern):
    suite = unittest.TestSuite()
    suite.addTest( PythonBackendIntegrationTests( 'test_file_with_invalid_encoding_recovery_match' ) )
    return suite

# Comment this to run individual Unit Tests
load_tests = None


if __name__ == "__main__":
    main()

