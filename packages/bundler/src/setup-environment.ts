import {Internals} from 'remotion';

Internals.setupEnvVariables();

Internals.CSSUtils.injectCSS(`
  .css-reset, .css-reset * {
    font-size: 16px;
    line-height: 1;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    background: transparent;
    box-sizing: border-box;
  }
`);
