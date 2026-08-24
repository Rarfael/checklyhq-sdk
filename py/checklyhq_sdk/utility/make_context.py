# Checklyhq SDK utility: make_context

from checklyhq_sdk.core.context import ChecklyhqContext


def make_context_util(ctxmap, basectx):
    return ChecklyhqContext(ctxmap, basectx)
