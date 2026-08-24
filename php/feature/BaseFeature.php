<?php
declare(strict_types=1);

// Checklyhq SDK base feature

class ChecklyhqBaseFeature
{
    public string $version;
    public string $name;
    public bool $active;

    // Positions this feature when added via the client `extend` option:
    // "__before__" / "__after__" / "__replace__" name an already-added
    // feature (mirrors the ts feature `_options`). Declared so setting it
    // on an extension instance avoids the dynamic-property deprecation.
    public ?array $_options = null;

    public function __construct()
    {
        $this->version = '0.0.1';
        $this->name = 'base';
        $this->active = true;
    }

    public function get_version(): string { return $this->version; }
    public function get_name(): string { return $this->name; }
    public function get_active(): bool { return $this->active; }

    public function init(ChecklyhqContext $ctx, array $options): void {}
    public function PostConstruct(ChecklyhqContext $ctx): void {}
    public function PostConstructEntity(ChecklyhqContext $ctx): void {}
    public function SetData(ChecklyhqContext $ctx): void {}
    public function GetData(ChecklyhqContext $ctx): void {}
    public function GetMatch(ChecklyhqContext $ctx): void {}
    public function SetMatch(ChecklyhqContext $ctx): void {}
    public function PrePoint(ChecklyhqContext $ctx): void {}
    public function PreSpec(ChecklyhqContext $ctx): void {}
    public function PreRequest(ChecklyhqContext $ctx): void {}
    public function PreResponse(ChecklyhqContext $ctx): void {}
    public function PreResult(ChecklyhqContext $ctx): void {}
    public function PreDone(ChecklyhqContext $ctx): void {}
    public function PreUnexpected(ChecklyhqContext $ctx): void {}
}
