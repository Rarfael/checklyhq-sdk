<?php
declare(strict_types=1);

// Typed models for the Checklyhq SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
// params (op.<name>.points[].args.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.
//
// These are documentation-grade value objects (PHP 8 typed properties),
// registered on the composer classmap autoload. The SDK boundary exchanges
// assoc-arrays; these classes name the shapes for tooling and typed callers.

/** Check entity data model. */
class Check
{
    public ?bool $activated = null;
    public ?string $checkType = null;
    public ?string $created_at = null;
    public ?int $frequency = null;
    public ?string $id = null;
    public ?array $locations = null;
    public ?bool $muted = null;
    public ?string $name = null;
    public ?array $request = null;
    public ?string $updated_at = null;
}

/** Request payload for Check#load. */
class CheckLoadMatch
{
    public string $id;
}

/** Request payload for Check#list. */
class CheckListMatch
{
    public ?bool $activated = null;
    public ?string $checkType = null;
    public ?string $created_at = null;
    public ?int $frequency = null;
    public ?string $id = null;
    public ?array $locations = null;
    public ?bool $muted = null;
    public ?string $name = null;
    public ?array $request = null;
    public ?string $updated_at = null;
}

/** Request payload for Check#create. */
class CheckCreateData
{
    public ?bool $activated = null;
    public ?string $checkType = null;
    public ?string $created_at = null;
    public ?int $frequency = null;
    public ?string $id = null;
    public ?array $locations = null;
    public ?bool $muted = null;
    public ?string $name = null;
    public ?array $request = null;
    public ?string $updated_at = null;
}

/** Request payload for Check#update. */
class CheckUpdateData
{
    public string $id;
    public ?bool $activated = null;
    public ?string $checkType = null;
    public ?string $created_at = null;
    public ?int $frequency = null;
    public ?array $locations = null;
    public ?bool $muted = null;
    public ?string $name = null;
    public ?array $request = null;
    public ?string $updated_at = null;
}

/** Request payload for Check#remove. */
class CheckRemoveMatch
{
    public string $id;
}

