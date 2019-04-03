import DomMethods from '../../../src/core/shared/DomMethods';

describe('DomMethods', () => {

    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
    });

    describe('insertScript()', () => {
        it('should inject script to head', () => {
            DomMethods.insertScript('head', 'http://example.com/test.js');
            expect(document.head.innerHTML).toBe('<script src="http://example.com/test.js"></script>');
            expect(document.body.innerHTML).toBe('');
        });
        
        it('should inject script to body', () => {
            DomMethods.insertScript('body', 'http://example.com/test.js');
            expect(document.head.innerHTML).toBe('');
            expect(document.body.innerHTML).toBe('<script src="http://example.com/test.js"></script>');
        });
    });

    describe('insertStyle()', () => {
        it('should inject style to head', () => {
            DomMethods.insertStyle('some style content');
            expect(document.head.innerHTML).toBe('<style>some style content</style>');
            expect(document.body.innerHTML).toBe('');
        });
        
    });

});