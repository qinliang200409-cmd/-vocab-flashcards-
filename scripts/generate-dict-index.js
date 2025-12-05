const fs = require('fs');
const path = require('path');

const dictsDir = path.join(__dirname, '../public/dicts');
const outputFile = path.join(dictsDir, 'index.json');

// 词库名称映射和描述规则
const nameMapping = {
  // 考试类
  'CET4_T': { name: '大学英语四级词汇', category: '考试' },
  'CET6_T': { name: '大学英语六级词汇', category: '考试' },
  'KaoYan': { name: '考研英语词汇', category: '考试' },
  'GaoKao': { name: '高考英语词汇', category: '考试' },
  'IELTS': { name: '雅思词汇', category: '考试' },
  'TOEFL': { name: '托福词汇', category: '考试' },
  'GRE': { name: 'GRE词汇', category: '考试' },
  'GMAT': { name: 'GMAT词汇', category: '考试' },
  'BEC': { name: '商务英语BEC', category: '考试' },
  
  // 教材类
  'BeiShiGaoZhong': { name: '北师大高中英语', category: '教材' },
  'Cambridge': { name: '剑桥英语', category: '教材' },
  'EF_LEVEL': { name: 'EF英孚英语', category: '教材' },
  
  // 日语
  'Jap': { name: '日语', category: '日语' },
  'Japanese': { name: '日语', category: '日语' },
  
  // 编程
  'python': { name: 'Python', category: '编程' },
  'java': { name: 'Java', category: '编程' },
  'js': { name: 'JavaScript', category: '编程' },
  'csharp': { name: 'C#', category: '编程' },
  'go': { name: 'Go', category: '编程' },
  'cpp': { name: 'C++', category: '编程' },
  'arduino': { name: 'Arduino', category: '编程' },
  
  // 其他
  'frequently': { name: '常用词汇', category: '基础' },
  'coca': { name: 'COCA美国当代英语语料库', category: '进阶' },
};

function detectCategory(filename) {
  const lowerName = filename.toLowerCase();
  
  for (const [key, value] of Object.entries(nameMapping)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return { name: filename.replace('.json', ''), category: '其他' };
}

function generateReadableName(filename) {
  const baseName = filename.replace('.json', '');
  const info = detectCategory(filename);
  
  // 尝试从文件名提取更多信息
  const match = baseName.match(/(\d+)/);
  if (match && info.name.includes('Level')) {
    return `${info.name} ${match[0]}`;
  }
  
  return info.name;
}

async function countWordsInFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      return data.length;
    } else if (data.words && Array.isArray(data.words)) {
      return data.words.length;
    }
    
    return 0;
  } catch (error) {
    console.warn(`Error reading ${path.basename(filePath)}:`, error.message);
    return 0;
  }
}

async function generateIndex() {
  try {
    const files = await fs.promises.readdir(dictsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');
    
    console.log(`Found ${jsonFiles.length} dictionary files`);
    
    const dictionaries = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(dictsDir, file);
      const count = await countWordsInFile(filePath);
      const info = detectCategory(file);
      
      if (count > 0) {
        dictionaries.push({
          id: file.replace('.json', '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: generateReadableName(file),
          description: info.category,
          filename: file,
          count: count,
          category: info.category
        });
      }
    }
    
    // 按类别和名称排序
    dictionaries.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'zh-CN');
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    
    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(dictionaries, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Generated index.json with ${dictionaries.length} dictionaries`);
    console.log(`📊 Categories:`);
    
    const categories = {};
    dictionaries.forEach(d => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} dictionaries`);
    });
    
  } catch (error) {
    console.error('Error generating index:', error);
    process.exit(1);
  }
}

generateIndex();
