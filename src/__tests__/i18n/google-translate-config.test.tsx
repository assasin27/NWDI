import React from 'react';
import { render } from '@testing-library/react';
import App from '../../App';

// Ensure alerts don't interrupt tests
beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  sessionStorage.clear();
});

afterEach(() => {
  (window.alert as jest.Mock).mockRestore?.();
});

describe('Google Translate initialization', () => {
  test('sets up init callback and includes en,hi,mr,gu', () => {
    // Render App to register window.googleTranslateElementInit
    render(<App />);

    expect((window as any).googleTranslateElementInit).toBeDefined();

    // Mock Google Translate API surface
    const TranslateElementMock: any = jest.fn();
    TranslateElementMock.InlineLayout = { SIMPLE: 'SIMPLE' };
    (window as any).google = {
      translate: {
        TranslateElement: TranslateElementMock,
      },
    };

    // Call the init callback
    (window as any).googleTranslateElementInit();

    // Assert first call args
    expect(TranslateElementMock).toHaveBeenCalled();
    const [options, containerId] = TranslateElementMock.mock.calls[0];
    expect(containerId).toBe('google_translate_element');

    // Verify included languages configuration
    expect(options).toMatchObject({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,mr,gu',
      autoDisplay: false,
    });

    // Layout enum should be referenced
    expect(options.layout).toBe(TranslateElementMock.InlineLayout.SIMPLE);
  });
});
