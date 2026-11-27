import { strToU8, zipSync } from 'fflate';

function escapeXml(value) {
  const validXmlText = Array.from(String(value ?? ''))
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint === 9 || codePoint === 10 || codePoint === 13 || codePoint >= 32;
    })
    .join('');
  return validXmlText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function excelColumn(index) {
  let value = index + 1;
  let label = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

function worksheetXml(rows) {
  const content = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const cellRef = `${excelColumn(columnIndex)}${rowIndex + 1}`;
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${cellRef}"><v>${value}</v></c>`;
      }
      return `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${content}</sheetData>
</worksheet>`;
}

function formatExportDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function moneyToCents(value) {
  return Math.round(Number(value || 0) * 100);
}

function getPartColumns(items) {
  const groupedParts = new Map();
  items.forEach((item) => {
    item.usages.forEach((usage) => {
      const partName = usage.partName || usage.partCode || '';
      const unit = usage.unit || '';
      const key = `${usage.partCode || partName}|${unit}`;
      const part = groupedParts.get(key) || {
        partName,
        unit,
        quantityMilliUnits: 0,
      };
      part.quantityMilliUnits += Math.round(Number(usage.quantity || 0) * 1000);
      groupedParts.set(key, part);
    });
  });

  if (groupedParts.size) {
    const parts = [...groupedParts.values()];
    const quantityFormatter = new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 3,
    });
    return {
      names: parts.map((part) =>
        part.unit ? `${part.partName} (${part.unit})` : part.partName
      ).join('; '),
      quantities: parts.map((part) =>
        quantityFormatter.format(part.quantityMilliUnits / 1000)
      ).join('; '),
    };
  }

  return {
    names: [...new Set(items.map((item) => item.replacedParts).filter(Boolean))]
      .join('; '),
    quantities: '',
  };
}

function workKey(sourceType, sourceId) {
  return `${sourceType}:${sourceId}`;
}

function createWorkbook(sheets) {
  const contentTypeOverrides = sheets.map((_, index) =>
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('');
  const workbookSheets = sheets.map((sheet, index) =>
    `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
  ).join('');
  const workbookRelationships = sheets.map((_, index) =>
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  ).join('');
  const files = {
    '[Content_Types].xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      contentTypeOverrides +
      '</Types>'
    ),
    '_rels/.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>'
    ),
    'xl/workbook.xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<sheets>${workbookSheets}</sheets></workbook>`
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      workbookRelationships +
      '</Relationships>'
    ),
  };
  sheets.forEach((sheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] =
      strToU8(worksheetXml(sheet.rows));
  });
  return zipSync(files, { level: 6 });
}

export function createMonthlyRepairWorkbook(workItems, usages) {
  const usagesByWork = new Map();
  usages.forEach((usage) => {
    const key = workKey(usage.sourceType, usage.sourceId);
    const current = usagesByWork.get(key) || [];
    current.push(usage);
    usagesByWork.set(key, current);
  });

  const itemsWithCosts = workItems.map((item) => {
    const itemUsages = usagesByWork.get(workKey(item.sourceType, item.sourceId)) || [];
    return {
      ...item,
      usages: itemUsages,
      totalCostCents: itemUsages.reduce(
        (sum, usage) => sum + moneyToCents(usage.totalCost), 0
      ),
    };
  });

  const equipmentGroups = new Map();
  itemsWithCosts.forEach((item) => {
    const key = item.equipmentCode || `${item.equipmentName}:${item.roomName}`;
    const group = equipmentGroups.get(key) || {
      equipmentCode: item.equipmentCode,
      equipmentName: item.equipmentName,
      roomName: item.roomName,
      items: [],
      totalCostCents: 0,
    };
    group.items.push(item);
    group.totalCostCents += item.totalCostCents;
    equipmentGroups.set(key, group);
  });

  const equipmentHeaders = [
    'Mã thiết bị',
    'Tên thiết bị',
    'Phòng',
    'Số lượt hoàn tất',
    'Ngày hoàn tất',
    'Loại công việc',
    'Nội dung công việc / sự cố',
    'KTV phụ trách',
    'Linh kiện',
    'Số lượng',
    'Tổng chi phí (VNĐ)',
    'Xác nhận',
  ];
  const equipmentRows = [...equipmentGroups.values()].map((group) => {
    const uniqueValues = (property) => [...new Set(
      group.items.map((item) => item[property]).filter(Boolean)
    )];
    const parts = getPartColumns(group.items);
    return [
      group.equipmentCode,
      group.equipmentName,
      group.roomName,
      group.items.length,
      uniqueValues('completedDate').join('; '),
      uniqueValues('workType').join('; '),
      uniqueValues('workDescription').join('; '),
      uniqueValues('technicianName').join('; '),
      parts.names,
      parts.quantities,
      group.totalCostCents / 100,
      '',
    ];
  });
  const totalCostCents = [...equipmentGroups.values()]
    .reduce((sum, group) => sum + group.totalCostCents, 0);
  equipmentRows.push([
    'TỔNG CỘNG',
    '',
    '',
    itemsWithCosts.length,
    '',
    '',
    '',
    '',
    '',
    '',
    totalCostCents / 100,
    '',
  ]);

  const workHeaders = [
    'Loại công việc',
    'Mã phiếu / lịch',
    'Ngày hoàn tất',
    'Mã thiết bị',
    'Tên thiết bị',
    'Phòng',
    'Mô tả công việc / sự cố',
    'Kết quả / cách xử lý',
    'Linh kiện',
    'Số lượng',
    'KTV phụ trách',
    'Số dòng linh kiện',
    'Chi phí linh kiện (VNĐ)',
  ];
  const workRows = itemsWithCosts.map((item) => {
    const parts = getPartColumns([item]);
    return [
      item.workType,
      item.sourceId,
      formatExportDate(item.completedDate),
      item.equipmentCode,
      item.equipmentName,
      item.roomName,
      item.workDescription,
      item.resultNotes,
      parts.names,
      parts.quantities,
      item.technicianName,
      item.usages.length,
      item.totalCostCents / 100,
    ];
  });
  workRows.push([
    'TỔNG CỘNG', '', '', '', '', '', '', '', '', '',
    itemsWithCosts.reduce((sum, item) => sum + item.usages.length, 0),
    totalCostCents / 100,
  ]);

  return createWorkbook([
    { name: 'Thiết bị đã sửa', rows: [equipmentHeaders, ...equipmentRows] },
    { name: 'Chi tiết công việc', rows: [workHeaders, ...workRows] },
  ]);
}
