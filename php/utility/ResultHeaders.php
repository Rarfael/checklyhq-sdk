<?php
declare(strict_types=1);

// Checklyhq SDK utility: result_headers

class ChecklyhqResultHeaders
{
    public static function call(ChecklyhqContext $ctx): ?ChecklyhqResult
    {
        $response = $ctx->response;
        $result = $ctx->result;
        if ($result) {
            if ($response && is_array($response->headers)) {
                $result->headers = $response->headers;
            } else {
                $result->headers = [];
            }
        }
        return $result;
    }
}
