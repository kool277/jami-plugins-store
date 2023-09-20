import {Service} from 'typedi';
import {FileManagerService} from './file.manager.service';

@Service()
export class TranslationService {
  constructor(private readonly fileManager: FileManagerService) {}
  async formatText(
    id: string,
    language: string,
    text: string,
    pluginPath: string | undefined
  ): Promise<string> {
    return await this.findLanguageFile(id, language, pluginPath).then(
      async (languageFile: string) => {
        if (pluginPath === undefined) {
          return text;
        }
        return await this.fileManager
          .readArchive(pluginPath, 'data/locale/' + languageFile)
          .then((languageFileContent: Buffer) => {
            if (languageFileContent.length === 0) {
              return text;
            }
            const languageFileContentParsed = JSON.parse(
              languageFileContent.toString()
            );
            return text.replace(
              /(\{\{([^}]+)\}\})/g,
              (_: string, p1: string) => {
                return languageFileContentParsed[
                  p1.substring(2, p1.length - 2)
                ];
              }
            );
          });
      }
    );
  }

  private async findLanguageFile(
    id: string,
    language: string,
    pluginPath: string | undefined
  ): Promise<string> {
    if (pluginPath === undefined) {
      return id + '_en';
    }
    const languageFile = (
      await this.fileManager.listArchiveFiles(pluginPath, '/data/locale/')
    ).find((file: string) => file.includes(language));
    return languageFile === undefined ? id + '_en.json' : languageFile;
  }

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
