/**
 * V7.2 JSON解析器自动化测试
 * 从V7.2 HTML提取所有函数，用JSDOM运行，逐序号对比预期值
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ===== 预期值（来自 xlsx 规则） =====
const expectedData = {
  1:  { '产品名称': '闸阀', '证书出厂编号': 'ZH-QC-250327-15', '材质': 'A216 WCB', '规格型号': /CL150.*2/, '制造厂家': '江苏亿阀股份有限公司', '单位': '台', '数量': '1' },
  2:  { '产品名称': '闸阀', '证书出厂编号': '602075008', '材质': 'A105', '规格型号': /CL600/, '制造厂家': '安徽省屯溪高压阀门股份有限公司', '单位': '台', '数量': '8' },
  3:  { '产品名称': '对焊法兰', '证书出厂编号': '25-11-4438', '材质': '16Mn', '规格型号': /CL300.*DN50.*SCH40.*RF/, '制造厂家': '常州市常武欣摄石化配件有限公司', '单位': '片', '数量': '14' },
  4:  { '产品名称': '对焊法兰', '证书出厂编号': 'Z26-04-1816', '材质': 'A105', '规格型号': /CL150.*DN40.*SCH80.*RF/, '制造厂家': '常州市武进第二法兰锻造有限公司', '单位': '片', '数量': '27' },
  5:  { '产品名称': /输送流体用无缝钢管/, '证书出厂编号': 'GG00394948', '材质': '20', '规格型号': /114\.3.*6\.02/, '制造厂家': '江苏新长江无缝钢管制造有限公司', '单位': '吨', '数量': /9\.339/ },
  6:  { '产品名称': /输送流体用无缝钢管/, '证书出厂编号': '2509-222', '材质': '20', '规格型号': /26\.7.*3\.91/, '制造厂家': '张家港保税区恒隆钢管有限公司', '单位': 'KG', '数量': /5944/ },
  7:  { '产品名称': '输送管', '证书出厂编号': 'BGSQG2508111069900', '材质': '20', '规格型号': /323\.9.*6\.35/, '制造厂家': '烟台鲁宝钢管有限责任公司', '单位': '吨', '数量': /37\.197/ },
  8:  { '产品名称': '流体输送管', '证书出厂编号': '23800050', '材质': '20', '规格型号': /273\.1.*6\.35/, '制造厂家': '衡阳华菱钢管有限公司', '单位': '吨', '数量': /21\.622/ },
  9:  { '产品名称': /全螺纹螺栓/, '证书出厂编号': '26062609', '材质': /35CrMoA/, '规格型号': /M24/, '制造厂家': '宁波九龙紧固件制造有限公司', '单位': '套', '数量': '36' },
  10: { '产品名称': /缠绕垫/, '证书出厂编号': '26-1732', '材质': '316L', '规格型号': /DN500.*300LB/, '制造厂家': '宁波艾拓密封技术有限公司', '单位': '件', '数量': '1' },
  11: { '产品名称': /弯头/, '证书出厂编号': '202613370', '材质': /06Cr19Ni10/, '规格型号': /DN600.*SCH10S/, '制造厂家': /远洋不锈钢/, '单位': '件', '数量': '2' },
  12: { '产品名称': /支管座/, '证书出厂编号': 'JT202507186-01', '材质': /20#/, '规格型号': /DN80.*CL3000.*SW/, '制造厂家': '江阴金童石化装备有限公司', '单位': /个|件/, '数量': '2' },
  13: { '产品名称': '闸阀', '证书出厂编号': 'WZXS26011160002', '材质': /A182-F11/, '规格型号': /Z41Y-100.*DN25/, '制造厂家': '五洲阀门股份有限公司', '单位': '台', '数量': '20' },
  14: { '产品名称': /管箍/, '证书出厂编号': 'LTD/HG-25-39-224-A001', '材质': /F304/, '规格型号': /DN40.*CL3000.*SW/, '制造厂家': '沧州隆泰迪管道科技有限公司', '单位': '件', '数量': '1' },
  15: { '产品名称': '对焊法兰', '证书出厂编号': '2508089D-28', '材质': 'A105', '规格型号': /CL150.*DN150.*SCH40.*RF/, '制造厂家': '无锡市星达石化配件有限公司', '单位': '片', '数量': '5' },
  16: { '产品名称': /弯头/, '证书出厂编号': 'FQ260513-573-34', '材质': 'WPB', '规格型号': /DN400.*STD/, '制造厂家': '河北方泉管道装备有限公司', '单位': '件', '数量': '3' },
  17: { '产品名称': /大小头/, '证书出厂编号': '2605-106-5', '材质': /15CrMo/, '规格型号': /DN80.*DN50.*SCH40/, '制造厂家': '合肥实华管件有限责任公司', '单位': '件', '数量': '5' },
  18: { '产品名称': '闸阀', '证书出厂编号': '20250905D-006', '材质': 'WCB', '规格型号': /CL600.*DN50/, '制造厂家': '凯喜姆阀门有限公司', '单位': '台', '数量': '27' },
  19: { '产品名称': /三通/, '证书出厂编号': '25278-2', '材质': /06Cr18Ni11Ti/, '规格型号': /DN200.*SCH120/, '制造厂家': '辽阳石化机械设计制造有限公司', '单位': '件', '数量': '1' },
  20: { '产品名称': '管帽', '证书出厂编号': 'MTC20260302-008A', '材质': /F316/, '规格型号': /DN15.*CL3000.*RC/, '制造厂家': '江苏海达管件集团有限公司', '单位': '件', '数量': '40' },
  21: { '产品名称': /异径管/, '证书出厂编号': 'XYRK033#26032610', '材质': /06Cr19Ni10/, '规格型号': /DN40.*DN25.*SCH40S/, '制造厂家': '江苏兴洋管业股份有限公司', '单位': '件', '数量': '6' },
  22: { '产品名称': '对焊法兰', '证书出厂编号': '26-06-3092', '材质': 'A105', '规格型号': /WN350.*150LB.*RF.*SCH30/, '制造厂家': '常州市常武欣摄石化配件有限公司', '单位': '片', '数量': '8' },
};

// ===== 文件映射 =====
const fileMapping = [
  { file: '序号1.json', expectedIds: [1] },
  { file: '序号2.json', expectedIds: [2] },
  { file: '序号3.json', expectedIds: [3] },
  { file: '序号4.json', expectedIds: [4] },
  { file: '序号5-8.json', expectedIds: [5, 6, 7, 8] },
  { file: '序号9.json', expectedIds: [9] },
  { file: '序号10.json', expectedIds: [10] },
  { file: '序号11.json', expectedIds: [11] },
  { file: '序号12-14第一二页.json', expectedIds: [14, 12] },
  { file: '序号13.json', expectedIds: [13] },
  { file: '序号15第四页.json', expectedIds: [15], findByName: { field: '产品名称', value: '对焊法兰' } },
  { file: '序号16-18.json', expectedIds: [16, 17, 18] },
  { file: '序号19.json', expectedIds: [19] },
  { file: '序号20.json', expectedIds: [20] },
  { file: '序号21.json', expectedIds: [21], findByName: { field: '产品名称', value: '异径管' } },
  { file: '序号22.json', expectedIds: [22] },
];

// ===== 加载V7.3 HTML并提取函数 =====
const htmlPath = path.join(__dirname, '材料录入桥接工具_v7.3.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 用JSDOM运行HTML中的script
const dom = new JSDOM(htmlContent, {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  url: 'http://localhost',
});
const window = dom.window;

// 等待脚本加载完成（HTML中的script标签）
function waitForScripts() {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}

// 字段对比
function matchField(actual, expected) {
  if (expected instanceof RegExp) {
    return expected.test(actual || '');
  }
  if (typeof expected === 'string') {
    // 模糊匹配：expected 内容在 actual 中出现
    return (actual || '').indexOf(expected) >= 0;
  }
  return false;
}

function matchFieldExact(actual, expected) {
  if (expected instanceof RegExp) {
    return expected.test(actual || '');
  }
  return (actual || '').trim() === (expected || '').trim();
}

// 主测试函数
async function runTests() {
  await waitForScripts();

  // fixtures 在 tests/fixtures/ 目录（兼容旧路径）
  const jsDir = fs.existsSync(path.join(__dirname, 'tests', 'fixtures'))
    ? path.join(__dirname, 'tests', 'fixtures')
    : path.join(__dirname, '7.28悦悦反馈的质保书和规则更新', 'JS文件');
  const results = [];

  for (const mapping of fileMapping) {
    const filePath = path.join(jsDir, mapping.file);
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] ${mapping.file}: 文件不存在`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    try {
      const result = window.parseMinerUJson(jsonData);
      const records = result.records;

      console.log(`\n===== ${mapping.file} =====`);
      console.log(`解析条数: ${records.length}, 期望: ${mapping.expectedIds.length}`);
      console.log(`日志: ${result.log.join(' | ')}`);

      for (let i = 0; i < mapping.expectedIds.length; i++) {
        const id = mapping.expectedIds[i];
        const exp = expectedData[id];
        let rec = records[i];

        // 如果有findByName，在所有记录中查找匹配的
        if (mapping.findByName && i === 0) {
          const found = records.find(r => {
            const name = r[mapping.findByName.field] || '';
            return name.indexOf(mapping.findByName.value) >= 0;
          });
          if (found) rec = found;
        }

        if (!rec) {
          console.log(`\n  [序号${id}] ❌ 无记录（期望有）`);
          results.push({ id, status: 'MISSING', file: mapping.file });
          continue;
        }

        const diffs = [];
        const fields = ['产品名称', '证书出厂编号', '材质', '规格型号', '制造厂家', '单位', '数量'];
        for (const field of fields) {
          const actual = rec[field] || '';
          const expected = exp[field];
          const ok = matchField(actual, expected);
          if (!ok) {
            diffs.push(`    ${field}: 实际="${actual}" ≠ 期望="${expected}"`);
          }
        }

        if (diffs.length === 0) {
          console.log(`  [序号${id}] ✅ 全部正确`);
          results.push({ id, status: 'PASS', file: mapping.file });
        } else {
          console.log(`  [序号${id}] ⚠️ ${diffs.length}项偏差:`);
          diffs.forEach(d => console.log(d));
          results.push({ id, status: 'DIFF', file: mapping.file, diffs });
        }
      }

      // 检查多余记录
      if (records.length > mapping.expectedIds.length) {
        for (let i = mapping.expectedIds.length; i < records.length; i++) {
          const extra = records[i];
          console.log(`  [多余记录${i+1}] 产品名称="${extra['产品名称']||''}" 分类="${extra['物资分类']||''}"`);
        }
      }

    } catch (e) {
      console.log(`\n[ERROR] ${mapping.file}: ${e.message}`);
      results.push({ id: mapping.expectedIds[0], status: 'ERROR', file: mapping.file, error: e.message });
    }
  }

  // 汇总
  console.log('\n\n===== 汇总 =====');
  const pass = results.filter(r => r.status === 'PASS').length;
  const diff = results.filter(r => r.status === 'DIFF').length;
  const missing = results.filter(r => r.status === 'MISSING').length;
  const error = results.filter(r => r.status === 'ERROR').length;
  console.log(`通过: ${pass}, 偏差: ${diff}, 缺失: ${missing}, 错误: ${error}, 总计: ${results.length}`);

  // 输出需要修正的序号
  const needFix = results.filter(r => r.status !== 'PASS');
  if (needFix.length > 0) {
    console.log('\n需要修正的序号:');
    needFix.forEach(r => {
      console.log(`  序号${r.id} [${r.status}] ${r.file}${r.error ? ' - ' + r.error : ''}`);
    });
  }
}

runTests().catch(e => { console.error('Test failed:', e); process.exit(1); });
