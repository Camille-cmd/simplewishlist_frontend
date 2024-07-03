interface LanguageValues{
    nativeName: string;
    flag: string;
}
export interface Languages {
    [en: string]: LanguageValues;
    [fr: string]: LanguageValues;
}