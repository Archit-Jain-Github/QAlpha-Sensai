// Mock react-pdf module to avoid import.meta issues
const React = require('react');

// Mock the pdfjs worker setup to avoid import.meta issues
const mockPdfjs = {
  GlobalWorkerOptions: {
    get workerSrc() {
      return 'mock-worker-src';
    },
    set workerSrc(value) {
      // Do nothing, just prevent the error
    }
  },
  getDocument: jest.fn(() => Promise.resolve({
    numPages: 1,
    getPage: jest.fn(() => Promise.resolve({
      getViewport: jest.fn(() => ({ width: 100, height: 100 })),
      render: jest.fn(() => Promise.resolve())
    }))
  })),
  version: '3.0.0'
};

// Mock the Document component to prevent loading issues
const MockDocument = React.forwardRef((props, ref) => {
  // Simulate successful document load
  React.useEffect(() => {
    if (props.onLoadSuccess) {
      props.onLoadSuccess({ numPages: 5 });
    }
  }, [props.onLoadSuccess]);
  
  return React.createElement('div', { 
    'data-testid': 'mock-pdf-document',
    ref,
    ...props 
  }, props.children);
});

module.exports = {
  Document: MockDocument,
  Page: React.forwardRef((props, ref) => 
    React.createElement('div', { 
      'data-testid': 'mock-pdf-page',
      ref,
      ...props 
    }, props.children)
  ),
  pdfjs: mockPdfjs,
  Outline: (props) => React.createElement('div', { 'data-testid': 'mock-pdf-outline' }),
  Thumbnail: (props) => React.createElement('div', { 'data-testid': 'mock-pdf-thumbnail' }),
}; 