import {Service} from 'typedi';

@Service()
export class LanguageManager {
  getLanguage(languages: string): string {
    return this.selectLanguage(this.formatLanguage(languages));
  }

  private selectLanguage(
    languages: Array<{lang: string; weight: number}>
  ): string {
    return languages.reduce((prev, current) => {
      return prev.weight > current.weight ? prev : current;
    }).lang;
  }

  private formatLanguage(
    languages: string | undefined
  ): Array<{lang: string; weight: number}> {
    if (languages === undefined) {
      return [{lang: 'en', weight: 1}];
    }
    return languages.split(',').map(lang => {
      const [langStr, weightStr] = lang.split(';');
      const weight =
        weightStr !== undefined ? parseFloat(weightStr.split('=')[1]) : 1;
      return {lang: langStr, weight};
    });
  }
}
