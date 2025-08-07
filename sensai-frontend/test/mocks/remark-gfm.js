// Mock remark-gfm to avoid ES module issues
module.exports = {
  default: () => ({}),
  remarkGfm: () => ({}),
}; 