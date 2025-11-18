import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GuidanceItem {
  id: string;
  title: string;
  categoryId: string;
  order: number;
  isCustom: boolean;
}

interface GuidanceCategory {
  id: string;
  title: string;
  type: 'individual' | 'group';
  parentId: string | null;
  level: number;
  order: number;
  isCustom: boolean;
  children?: GuidanceCategory[];
  items?: GuidanceItem[];
}

function normalizeIdPart(text: string): string {
  const codeMatch = text.match(/^([A-ZÖİÇŞĞÜ]+[A-ZÖİÇŞĞÜa-zöişçğü0-9]*)/);
  if (codeMatch) {
    return codeMatch[1]
      .toLowerCase()
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ç/g, 'c')
      .replace(/İ/g, 'i')
      .replace(/i̇/g, 'i');
  }
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function detectDepth(line: string): number {
  let pipeCount = 0;
  let i = 0;
  
  while (i < line.length) {
    if (line[i] === '│') {
      pipeCount++;
      i++;
    } else if (line[i] === ' ') {
      i++;
    } else {
      break;
    }
  }
  
  const hasBranch = line.includes('├──') || line.includes('└──');
  return pipeCount + (hasBranch ? 1 : 0);
}

function parseMarkdown(content: string, type: 'individual' | 'group'): GuidanceCategory[] {
  const lines = content.split('\n');
  const prefix = type === 'individual' ? 'ind' : 'grp';
  
  const rootCategories: GuidanceCategory[] = [];
  const stack: GuidanceCategory[] = [];
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    
    const trimmedLine = line.trimEnd();
    const depth = detectDepth(trimmedLine);
    
    let text = trimmedLine
      .replace(/^[│\s]*/g, '')
      .replace(/^[├└]──\s*/g, '')
      .trim();
    
    if (!text) continue;
    
    const isCategory = text.match(/^[A-ZÖİÇŞĞÜ]/);
    const hasCode = text.match(/^([A-ZÖİÇŞĞÜ]+[A-ZÖİÇŞĞÜa-zöişçğü0-9]*)\s+[-–—]/);
    
    if (depth === 0) {
      const category: GuidanceCategory = {
        id: `${prefix}-${normalizeIdPart(text)}`,
        title: text,
        type,
        parentId: null,
        level: 1,
        order: rootCategories.length + 1,
        isCustom: false,
      };
      rootCategories.push(category);
      stack.length = 0;
      stack.push(category);
    } else if (hasCode) {
      while (stack.length > depth) {
        stack.pop();
      }
      
      const parent = stack[stack.length - 1];
      const level = depth + 1;
      
      const category: GuidanceCategory = {
        id: `${parent.id}-${normalizeIdPart(text)}`,
        title: text,
        type,
        parentId: parent.id,
        level,
        order: 0,
        isCustom: false,
      };
      
      if (!parent.children) {
        parent.children = [];
      }
      category.order = parent.children.length + 1;
      parent.children.push(category);
      
      stack[depth] = category;
    } else {
      while (stack.length > depth + 1) {
        stack.pop();
      }
      
      const parent = stack[Math.min(depth, stack.length - 1)];
      if (!parent.items) {
        parent.items = [];
      }
      
      const itemId = `item-${parent.id}-${parent.items.length + 1}`;
      parent.items.push({
        id: itemId,
        title: text,
        categoryId: parent.id,
        order: parent.items.length + 1,
        isCustom: false,
      });
    }
  }
  
  return rootCategories;
}

function serializeCategory(cat: GuidanceCategory, indent: number = 2): string {
  const sp = ' '.repeat(indent);
  const lines: string[] = [];
  
  lines.push(`${sp}{`);
  lines.push(`${sp}  id: '${cat.id}',`);
  lines.push(`${sp}  title: '${cat.title.replace(/'/g, "\\'")}',`);
  lines.push(`${sp}  type: '${cat.type}',`);
  lines.push(`${sp}  parentId: ${cat.parentId === null ? 'null' : `'${cat.parentId}'`},`);
  lines.push(`${sp}  level: ${cat.level},`);
  lines.push(`${sp}  order: ${cat.order},`);
  lines.push(`${sp}  isCustom: false,`);
  
  if (cat.children && cat.children.length > 0) {
    lines.push(`${sp}  children: [`);
    for (const child of cat.children) {
      lines.push(serializeCategory(child, indent + 4));
    }
    lines.push(`${sp}  ],`);
  }
  
  if (cat.items && cat.items.length > 0) {
    lines.push(`${sp}  items: [`);
    for (const item of cat.items) {
      lines.push(`${sp}    { id: '${item.id}', title: '${item.title.replace(/'/g, "\\'")}', categoryId: '${item.categoryId}', order: ${item.order}, isCustom: false },`);
    }
    lines.push(`${sp}  ],`);
  }
  
  lines.push(`${sp}},`);
  return lines.join('\n');
}

async function main() {
  const rootDir = path.join(__dirname, '../..');
  
  const bireyselPath = path.join(rootDir, 'bireysel.md');
  const grupPath = path.join(rootDir, 'grup.md');
  const outputPath = path.join(rootDir, 'shared/data/default-guidance-standards.ts');
  
  const bireyselContent = fs.readFileSync(bireyselPath, 'utf-8');
  const grupContent = fs.readFileSync(grupPath, 'utf-8');
  
  const individualCategories = parseMarkdown(bireyselContent, 'individual');
  const groupCategories = parseMarkdown(grupContent, 'group');
  
  const individualTs = individualCategories.map(cat => serializeCategory(cat, 2)).join('\n');
  const groupTs = groupCategories.map(cat => serializeCategory(cat, 2)).join('\n');
  
  const tsContent = `import { GuidanceCategory } from '../types/guidance-standards.types';

export const DEFAULT_INDIVIDUAL_STANDARDS: GuidanceCategory[] = [
${individualTs}
];

export const DEFAULT_GROUP_STANDARDS: GuidanceCategory[] = [
${groupTs}
];

export const DEFAULT_GUIDANCE_STANDARDS = {
  individual: DEFAULT_INDIVIDUAL_STANDARDS,
  group: DEFAULT_GROUP_STANDARDS,
};
`;
  
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log('✅ Default guidance standards generated successfully!');
  console.log(`   Individual categories: ${individualCategories.length}`);
  console.log(`   Group categories: ${groupCategories.length}`);
}

main().catch(console.error);
