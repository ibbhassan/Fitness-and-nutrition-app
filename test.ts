import { BrowserMultiFormatReader } from '@zxing/library'; const x = new BrowserMultiFormatReader(); x.decodeFromConstraints({video: true}, document.createElement('video'), () => {});
