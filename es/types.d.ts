export interface AbstractNode {
    tag: string;
    attrs: {
        [key: string]: string;
    };
    children?: AbstractNode[];
}
export interface IconDefinition {
    name: string;
    theme: ThemeType;
    icon: ((primaryColor: string, secondaryColor: string) => AbstractNode) | AbstractNode;
}
export type ThemeType = 'baseline' | 'outline' | 'round' | 'twotone' | 'sharp';
export type ThemeTypeUpperCase = 'Baseline' | 'Outline' | 'Round' | 'TwoTone' | 'Sharp';
