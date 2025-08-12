import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from '../../App';

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  (window.alert as jest.Mock).mockRestore?.();
  document.body.innerHTML = '';
});

describe('Google overlay removal', () => {
  test('removes banner/menu/tooltip frames and table structure', async () => {
    render(<App />);

    // Create elements that the observer should remove
    const banner = document.createElement('iframe');
    banner.className = 'goog-te-banner-frame';
    document.body.appendChild(banner);

    const menu = document.createElement('iframe');
    menu.className = 'goog-te-menu-frame';
    document.body.appendChild(menu);

    const tip = document.createElement('div');
    tip.id = 'goog-gt-tt';
    const tbl = document.createElement('table');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = 'Overlay content';
    tr.appendChild(td);
    tbl.appendChild(tr);
    tip.appendChild(tbl);
    document.body.appendChild(tip);

    await waitFor(() => {
      expect(document.querySelector('.goog-te-banner-frame')).toBeNull();
      expect(document.querySelector('.goog-te-menu-frame')).toBeNull();
      expect(document.getElementById('goog-gt-tt')).toBeNull();
    });
  });
});
