import DomMethods from '../../../src/core/shared/DomMethods';
function addInput(form: any, name: string, value: string, stName?: string) {
  const input = document.createElement('input');
  input.name = name;
  input.value = value;
  if (stName) {
    input.setAttribute('data-st-name', stName);
  }
  form.appendChild(input);
}

function createFormFixture() {
  const form = document.createElement('form');
  addInput(form, 'myfield', '', 'stFieldName');
  addInput(form, 'myfield2', 'some value', 'stFieldName2');
  addInput(form, 'myfield3', 'ignored');
  addInput(form, 'duplicate', 'value1', 'stDuplicate');
  addInput(form, 'duplicate', 'value2', 'stDuplicate');
  const select = document.createElement('select');
  select.name = 'selectField';
  select.setAttribute('data-st-name', 'stSelectName');
  const opt1 = document.createElement('option');
  const opt2 = document.createElement('option');
  opt1.value = 'A';
  opt2.value = 'B';
  opt2.selected = true;
  select.appendChild(opt1);
  select.appendChild(opt2);
  form.appendChild(select);
  return form;
}

describe('DomMethods', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('DomMethods.insertScript', () => {
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

  describe('DomMethods.insertStyle', () => {
    it('should inject style to head', () => {
      DomMethods.insertStyle('some style content');
      expect(document.head.innerHTML).toBe('<style>some style content</style>');
      expect(document.body.innerHTML).toBe('');
    });
  });

  describe('DomMethods.parseForm', () => {
    it('should parse st-name from form', () => {
      const form = createFormFixture();
      const merchantData = DomMethods.parseForm(form);
      expect(merchantData).toMatchObject({
        stFieldName: '',
        stFieldName2: 'some value',
        stDuplicate: 'value2',
        stSelectName: 'B'
      });
      expect(merchantData.myfield3).toBe(undefined);
    });
  });

  describe('DomMethods.addDataToForm', () => {
    let data: any;

    beforeAll(() => {
      data = {
        stFieldName: '',
        stFieldName2: 'some value',
        stDuplicate: 'value2',
        stSelectName: 'B'
      };
    });

    it('should add all fields if not provided', () => {
      const form = document.createElement('form');
      DomMethods.addDataToForm(form, data);
      expect(form.querySelector('[name="stFieldName"]').getAttribute('value')).toBe('');
      expect(form.querySelector('[name="stFieldName"]').tagName).toBe('INPUT');
      expect(form.querySelector('[name="stFieldName"]').getAttribute('type')).toBe('hidden');
      expect(form.querySelector('[name="stFieldName2"]').getAttribute('value')).toBe('some value');
      expect(form.querySelector('[name="stDuplicate"]').getAttribute('value')).toBe('value2');
      expect(form.querySelector('[name="stSelectName"]').getAttribute('value')).toBe('B');
    });

    it('should only add specified fields if provided', () => {
      const form = document.createElement('form');
      DomMethods.addDataToForm(form, data, ['stFieldName', 'stFieldName2']);
      expect(form.querySelector('[name="stFieldName"]').getAttribute('value')).toBe('');
      expect(form.querySelector('[name="stFieldName2"]').getAttribute('value')).toBe('some value');
      expect(form.querySelector('[name="stDuplicate"]')).toBe(null);
      expect(form.querySelector('[name="stSelectName"]')).toBe(null);
    });
  });
});
