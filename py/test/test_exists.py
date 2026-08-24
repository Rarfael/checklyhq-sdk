# Checklyhq SDK exists test

import pytest
from checklyhq_sdk import ChecklyhqSDK


class TestExists:

    def test_should_create_test_sdk(self):
        testsdk = ChecklyhqSDK.test(None, None)
        assert testsdk is not None
