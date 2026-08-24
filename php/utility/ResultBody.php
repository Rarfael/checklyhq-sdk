<?php
declare(strict_types=1);

// Checklyhq SDK utility: result_body

class ChecklyhqResultBody
{
    public static function call(ChecklyhqContext $ctx): ?ChecklyhqResult
    {
        $response = $ctx->response;
        $result = $ctx->result;
        if ($result && $response && $response->json_func && $response->body) {
            $result->body = ($response->json_func)();
        }
        return $result;
    }
}
