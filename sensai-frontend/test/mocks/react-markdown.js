// Mock react-markdown and related dependencies to avoid ES module issues
const React = require('react');

module.exports = {
  default: React.forwardRef((props, ref) => 
    React.createElement('div', { 
      'data-testid': 'mock-markdown',
      ref,
      ...props 
    }, props.children || props.source)
  ),
  Markdown: React.forwardRef((props, ref) => 
    React.createElement('div', { 
      'data-testid': 'mock-markdown',
      ref,
      ...props 
    }, props.children || props.source)
  ),
}; 