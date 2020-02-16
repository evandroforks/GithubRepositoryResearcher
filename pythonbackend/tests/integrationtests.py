#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import os
import sys

import re
import time
import threading

# https://github.com/evandrocoan/debugtools/blob/079eee5f9b028c4cd17dee0da6a803adcf7d061d/tests/testing/main_unit_tests.py#L69-L75
def assert_path(*args):
    module = os.path.realpath( os.path.join( *args ) )
    if module not in sys.path:
        sys.path.append( module )

THIS_DIRECOTORY = os.path.dirname( os.path.realpath( __file__ ) )
PROJECT_DIRECTORY = os.path.dirname( os.path.dirname( THIS_DIRECOTORY ) )

assert_path( os.path.dirname( THIS_DIRECOTORY ) )
assert_path( os.path.dirname( THIS_DIRECOTORY ), "tests" )

import json
import unittest
import requests

from testutils import get_free_tcp_port
from testutils import run_process_nonblocking

from testutils import TimeSpentTestCase
from debug_tools import getLogger

log = getLogger( os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL' ), __name__ )

log( f"REACT_APP_GITHUB_RESEARCHER_BACKEND_IP {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP' )}..." )
log( f"REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT {os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT' )}..." )

def main():
    unittest.main()


class PythonBackendIntegrationTests(TimeSpentTestCase):

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

    def test_invalid_parameters_server_search_github_request(self):
        response = requests.post(
            "%s/search_github" % self.server_url,
            data=json.dumps( {
                "searchQuery": "language:javascript sort:stars",
                "startCursor": "asdf",
                "endCursor": "asdf",
            } ),
            headers={ 'Content-Type': 'application/json' },
            timeout=10,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertRegex( decoded_response, r"Error: You cannot set both .* variables simultaneously" )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/plain' )
        self.assertEqual( 400, response.status_code )

    def test_valid_server_search_github_request(self):
        response = requests.post(
            "%s/search_github" % self.server_url,
            data=json.dumps( {
                "searchQuery": "language:javascript sort:stars",
                "itemsPerPage": 1,
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
        self.assertEqual( len( json_response["repositories"] ), 1 )

        self.assertIn( "hasNextPage", json_response )
        self.assertGreater( len( json_response["endCursor"] ), 2 )
        self.assertGreater( len( json_response["rateLimit"] ), 20 )

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
        self.assertEqual( len( json_response ), 6 )
        self.assertGreater( len( json_response["repositories"] ), 2 )

        self.assertIn( "hasNextPage", json_response )
        self.assertGreater( len( json_response["endCursor"] ), 2 )
        self.assertGreater( len( json_response["rateLimit"] ), 20 )

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
        self.assertEqual( len( json_response ), 4 )
        self.assertGreater( len( json_response ), 2 )
        self.assertGreater( len( json_response["rateLimit"] ), 20 )
        self.assertIn( "totalCount", json_response["issues"] )


class PythonBackendStarupTests(TimeSpentTestCase):

    server_port = str( get_free_tcp_port() )
    server_url = r'http://{}:{}'.format(
        os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP' ),
        server_port,
    )

    def test_empty_github_token(self):
        os.environ["REACT_APP_GITHUB_RESEARCHER_TOKEN"] = ""
        del os.environ["REACT_APP_GITHUB_RESEARCHER_TOKEN"]

        os.environ["REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT"] = self.server_port
        process = run_process_nonblocking( f"bash {PROJECT_DIRECTORY}/run_backend.sh" )

        log_lines = []
        has_started = [False]

        # Wait until the server has start up completely
        def get_output():
            while True:
                try:
                    line = process.stdout.readline()

                except ValueError as error:
                    log( 4, "The server has probably exited! Error '%s'", error )
                    break

                if not line: break
                line = line.decode( "UTF-8", errors='replace' )
                line = line.replace( '\r\n', '\n').rstrip(' \n\r' )

                log.clean( 4, 'server', line )
                log_lines.append( line )

                if re.search( r"RuntimeError: The GitHub access token 'REACT_APP_GITHUB_RESEARCHER_TOKEN=.*' was not defined", line ):
                    has_started[0] = True

        maximum_wait_time = 100
        get_output_thread = threading.Thread( target=get_output, daemon=True )
        get_output_thread.start()

        while not has_started[0] and maximum_wait_time > 0:
            maximum_wait_time -= 1
            time.sleep( 0.1 )

        process.wait( 5 )
        process.terminate()

        # https://stackoverflow.com/questions/27451182/proper-way-to-close-all-files-after-subprocess-popen-and-communicate
        if process.stdin: process.stdin.close()
        if process.stdout: process.stdout.close()
        if process.stderr: process.stderr.close()

        if not has_started[0]:
            self.fail( 'The server should not have started without the GitHub API key REACT_APP_GITHUB_RESEARCHER_TOKEN!' )

    def test_invalid_github_token(self):
        os.environ["REACT_APP_GITHUB_RESEARCHER_TOKEN"] = "dddddddddddddddddddddddddddddddddd"
        os.environ["REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT"] = self.server_port
        process = run_process_nonblocking( f"bash {PROJECT_DIRECTORY}/run_backend.sh" )

        log_lines = []
        has_started = [False]

        # Wait until the server has start up completely
        def get_output():
            while True:
                try:
                    line = process.stdout.readline()

                except ValueError as error:
                    log( 4, "The server has probably exited! Error '%s'", error )
                    break

                if not line: break
                line = line.decode( "UTF-8", errors='replace' )
                line = line.replace( '\r\n', '\n').rstrip(' \n\r' )

                log.clean( 4, 'server', line )
                log_lines.append( line )

                if re.search( r"Exception: Invalid GitHub access token provided .* dddd...", line ):
                    has_started[0] = True

        maximum_wait_time = 100
        get_output_thread = threading.Thread( target=get_output, daemon=True )
        get_output_thread.start()

        while not has_started[0] and maximum_wait_time > 0:
            maximum_wait_time -= 1
            time.sleep( 0.1 )

        process.wait( 5 )
        process.terminate()

        # https://stackoverflow.com/questions/27451182/proper-way-to-close-all-files-after-subprocess-popen-and-communicate
        if process.stdin: process.stdin.close()
        if process.stdout: process.stdout.close()
        if process.stderr: process.stderr.close()

        if not has_started[0]:
            self.fail( 'The server should not have started with a GitHub API invalid token REACT_APP_GITHUB_RESEARCHER_TOKEN!' )


if __name__ == "__main__":
    main()

