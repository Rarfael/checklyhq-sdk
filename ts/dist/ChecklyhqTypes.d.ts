export interface Check {
    activated?: boolean;
    checkType?: string;
    created_at?: string;
    frequency?: number;
    id?: string;
    locations?: any[];
    muted?: boolean;
    name?: string;
    request?: Record<string, any>;
    updated_at?: string;
}
export interface CheckLoadMatch {
    id: string;
}
export interface CheckListMatch {
    activated?: boolean;
    checkType?: string;
    created_at?: string;
    frequency?: number;
    id?: string;
    locations?: any[];
    muted?: boolean;
    name?: string;
    request?: Record<string, any>;
    updated_at?: string;
}
export interface CheckCreateData {
    activated?: boolean;
    checkType?: string;
    created_at?: string;
    frequency?: number;
    id?: string;
    locations?: any[];
    muted?: boolean;
    name?: string;
    request?: Record<string, any>;
    updated_at?: string;
}
export interface CheckUpdateData {
    id: string;
    activated?: boolean;
    checkType?: string;
    created_at?: string;
    frequency?: number;
    locations?: any[];
    muted?: boolean;
    name?: string;
    request?: Record<string, any>;
    updated_at?: string;
}
export interface CheckRemoveMatch {
    id: string;
}
