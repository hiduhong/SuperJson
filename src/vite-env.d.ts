/// <reference types="vite/client" />

declare module 'react-json-view' {
    import { PureComponent } from 'react';
    
    export interface ThemeKeys {
        base00: string;
        base01: string;
        base02: string;
        base03: string;
        base04: string;
        base05: string;
        base06: string;
        base07: string;
        base08: string;
        base09: string;
        base0A: string;
        base0B: string;
        base0C: string;
        base0D: string;
        base0E: string;
        base0F: string;
    }

    export interface ReactJsonViewProps {
        src: object;
        name?: string | false | null;
        theme?: string | ThemeKeys;
        style?: object;
        iconStyle?: 'circle' | 'triangle' | 'square';
        indentWidth?: number;
        collapsed?: boolean | number;
        collapseStringsAfterLength?: number | false;
        shouldCollapse?: (field: { name: string | null; src: object; type: string; namespace: string[] }) => boolean;
        sortKeys?: boolean;
        quotesOnKeys?: boolean;
        groupArraysAfterLength?: number;
        enableClipboard?: boolean | ((copy: { src: object; namespace: string[]; name: string | null }) => void);
        displayObjectSize?: boolean;
        displayDataTypes?: boolean;
        onEdit?: (edit: { updated_src: object; name: string | null; namespace: string[]; new_value?: any; existing_value?: any }) => false | object;
        onAdd?: (add: { updated_src: object; name: string | null; namespace: string[]; new_value?: any; existing_value?: any }) => false | object;
        onDelete?: (del: { updated_src: object; name: string | null; namespace: string[]; new_value?: any; existing_value?: any }) => false | object;
        onSelect?: (select: { name: string | null; value: any; namespace: string[] }) => void;
        validationMessage?: string;
        defaultValue?: object;
    }

    export default class ReactJson extends PureComponent<ReactJsonViewProps> {}
}
