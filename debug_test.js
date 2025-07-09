import { TemplateDX } from './dist/templatedx.js';

async function debugForEach() {
  const instance = new TemplateDX();
  
  const mdxContent = `
<ForEach arr={items}>
{(item, index) => (
  <p>Item {index}: {item}</p>
)}
</ForEach>
  `;
  
  console.log('Input MDX:', mdxContent);
  
  const tree = await instance.parse(mdxContent, '.', async () => '');
  console.log('Parsed tree:', JSON.stringify(tree, null, 2));
  
  const processed = await instance.transform(tree, { items: ['apple', 'banana', 'cherry'] });
  console.log('Processed tree:', JSON.stringify(processed, null, 2));
  
  const result = instance.stringify(processed);
  console.log('Result:', result);
}

debugForEach().catch(console.error);