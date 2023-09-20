import { TranslationService } from '../src/services/translation.service';
import { FileManagerService } from '../src/services/file.manager.service';
import Sinon, { createStubInstance, restore, stub } from 'sinon';
describe('TranslationService', () => {
  let translationService: TranslationService;
  let fileManagerService: Sinon.SinonStubbedInstance<FileManagerService>;

  beforeEach(() => {
    fileManagerService = createStubInstance(FileManagerService);
    translationService = new TranslationService(fileManagerService);
  });
  afterEach(() => {
    restore();
  });

  describe('formatText', () => {
    it('should replace placeholders with translated text', async () => {
      fileManagerService.readArchive.resolves(
        Buffer.from('{"test": "test translation"}')
      );
      stub(Object.getPrototypeOf(translationService), "findLanguageFile").resolves('en.json');
      const result = await translationService.formatText(
        'id',
        'language',
        '{{test}}',
        'pluginPath'
      );
      expect(result).toEqual('test translation');
    });
  });

  describe('findLanguageFile', () => {
    it('should return the default language file if pluginPath is undefined', async () => {
      const result = await translationService["findLanguageFile"](
        'id',
        'language',
        undefined
      );
      expect(result).toEqual('id_en');
    });

    it('should return the language file for the specified language', async () => {
      fileManagerService.listArchiveFiles.resolves([
        'en.json',
        'fr.json',
      ]);
      const result = await translationService["findLanguageFile"](
        'id',
        'fr',
        'pluginPath'
      );
      expect(result).toEqual('fr.json');
    });

    it('should return the default language file if the specified language file is not found', async () => {
      fileManagerService.listArchiveFiles.resolves(['en.json']);
      const result = await translationService["findLanguageFile"](
        'id',
        'fr',
        'pluginPath'
      );
      expect(result).toEqual('id_en.json');
    });
  });

  describe('getLanguage', () => {
    it('should return the language with the highest weight', () => {
      const result = translationService.getLanguage('en;q=0.5,fr;q=1');
      expect(result).toEqual('fr');
    });
  });
});