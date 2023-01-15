import { IconDefinition } from './types';
export interface HelperRenderOptions {
    placeholders?: {
        primaryColor: string;
        secondaryColor: string;
    };
    extraSVGAttrs?: {
        [key: string]: string;
    };
}
export declare function renderIconDefinitionToSVGElement(iconDefinition: IconDefinition, options?: HelperRenderOptions): string;
