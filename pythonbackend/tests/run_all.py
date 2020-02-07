#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

import os
import sys

import unittest

# Note, all tests files must to end their names with `*tests.py`
PACKAGE_ROOT_DIRECTORY = os.path.dirname( os.path.realpath( __file__ ) )

loader = unittest.TestLoader()
start_dir = os.path.join( PACKAGE_ROOT_DIRECTORY )

suite = loader.discover( start_dir, "*tests.py" )
runner = unittest.TextTestRunner( verbosity=2 )
results = runner.run( suite )

sys.stderr.write( "results: %s\n" % results )
sys.stderr.write( "results.wasSuccessful: %s\n" % results.wasSuccessful() )

exit(not results.wasSuccessful())
