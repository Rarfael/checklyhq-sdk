<?php
declare(strict_types=1);

// Checklyhq SDK utility: make_context

require_once __DIR__ . '/../core/Context.php';

class ChecklyhqMakeContext
{
    public static function call(array $ctxmap, ?ChecklyhqContext $basectx): ChecklyhqContext
    {
        return new ChecklyhqContext($ctxmap, $basectx);
    }
}
