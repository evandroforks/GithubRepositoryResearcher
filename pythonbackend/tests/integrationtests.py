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
    server_url = r'http://{}:{}'.format(
        os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_IP' ),
        os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_BACKEND_PORT' ),
    )

    def decoded_response(self, response_content):
        decoded_response = response_content
        decoded_response = decoded_response.decode("UTF-8", errors='replace')
        decoded_response = decoded_response.replace('\r\n', '\n').rstrip(' \n\r')
        return decoded_response

    def test_invalid_path_request(self):
        # https://realpython.com/python-requests/
        response = requests.post(
            "%s/add_path" % self.server_url,
            data=json.dumps( {} ),
            headers={ 'Content-Type': 'application/json' },
            timeout=1,
        )

        decoded_response = self.decoded_response( response.content )
        log( 4, 'response\n%s', decoded_response )

        self.assertEqual( 404, response.status_code )
        self.assertRegex( response.headers.get( "Content-Type" ), r'text/html' )
        self.assertRegex( decoded_response, r"The requested URL was not found on the server" )


def load_tests(loader, standard_tests, pattern):
    suite = unittest.TestSuite()
    suite.addTest( PythonBackendIntegrationTests( 'test_file_with_invalid_encoding_recovery_match' ) )
    return suite

# Comment this to run individual Unit Tests
load_tests = None


if __name__ == "__main__":
    main()

