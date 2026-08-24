<?php
declare(strict_types=1);

// Checklyhq SDK utility: prepare_body

class ChecklyhqPrepareBody
{
    public static function call(ChecklyhqContext $ctx): mixed
    {
        if ($ctx->op->input === 'data') {
            return ($ctx->utility->transform_request)($ctx);
        }
        return null;
    }
}
