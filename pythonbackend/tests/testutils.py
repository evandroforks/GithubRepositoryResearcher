#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import re
import os

import datetime
import unittest

from debug_tools import getLogger
log = getLogger( os.environ.get( 'REACT_APP_GITHUB_RESEARCHER_DEBUG_LEVEL', 1 ), __name__ )


class TimeSpentTestCase(unittest.TestCase):
    """
        https://stackoverflow.com/questions/9502516/how-to-know-time-spent-on-each-test-when-using-unittest
    """

    def setUp(self):
        # https://stackoverflow.com/questions/4219717/how-to-assert-output-with-nosetest-unittest-in-python
        self.maxDiff = None
        log.newline()
        super().setUp()
        self.startTime = datetime.datetime.now()

    def tearDown(self):
        timespent = datetime.datetime.now() - self.startTime
        # log.clean( "%s: %s seconds", self.id(), timespent )
        log.clean( "%s seconds",  timespent )
        super().tearDown()

    def join(self, *args):
        return os.path.normpath( os.path.join( *args ) ).replace( '\\', '\\\\' )

    default_formatting = "'\n%s\n'\n{}\n'\n%s\n'"
    def assertIn(self, member, container, msg=None):
        """Just like self.assertTrue(a in b), but with a nicer default message.
        """
        if member not in container:
            standardMsg = self.default_formatting.format( 'not found in' ) % ( member, container )
            self.fail( self._formatMessage (msg, standardMsg ) )

    def assertRegex(self, container, regex, msg=None, options=0):
        """Just like self.assertTrue(re.search(b, a)), but with a nicer default message.
        """
        if not re.search(regex, container, options):
            standardMsg = self.default_formatting.format( 'not equals to' ) % ( regex, container )
            self.fail( self._formatMessage (msg, standardMsg ) )
