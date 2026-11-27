import { Plus, Trash2 } from 'lucide-react';

const EMPTY_PART = {
  partName: '',
  partCode: '',
  quantity: '1',
  unit: 'cái',
  unitCost: '0',
  supplier: '',
  documentNumber: '',
};

export default function PartUsageFields({ parts, onChange, disabled = false }) {
  const updatePart = (index, field, value) => {
    onChange(parts.map((part, partIndex) =>
      partIndex === index ? { ...part, [field]: value } : part
    ));
  };

  const removePart = (index) => {
    onChange(parts.filter((_, partIndex) => partIndex !== index));
  };

  return (
    <div className="part-usage-fields">
      {parts.map((part, index) => (
        <fieldset className="part-usage-row" key={`part-${index}`} disabled={disabled}>
          <div className="part-usage-row-heading">
            <strong>Linh kiện {index + 1}</strong>
            <button
              type="button"
              className="part-usage-remove"
              onClick={() => removePart(index)}
              aria-label={`Xóa linh kiện ${index + 1}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="part-usage-input-grid">
            <label>
              Tên linh kiện *
              <input
                className="form-input"
                value={part.partName}
                onChange={(event) => updatePart(index, 'partName', event.target.value)}
                maxLength={255}
                required
              />
            </label>
            <label>
              Mã linh kiện
              <input
                className="form-input"
                value={part.partCode}
                onChange={(event) => updatePart(index, 'partCode', event.target.value)}
                maxLength={100}
              />
            </label>
            <label>
              Số lượng *
              <input
                className="form-input"
                type="number"
                min="1"
                step="1"
                value={part.quantity}
                onChange={(event) => updatePart(index, 'quantity', event.target.value)}
                required
              />
            </label>
            <label>
              Đơn vị *
              <input
                className="form-input"
                value={part.unit}
                onChange={(event) => updatePart(index, 'unit', event.target.value)}
                maxLength={40}
                required
              />
            </label>
            <label>
              Đơn giá (VNĐ) *
              <input
                className="form-input"
                type="number"
                min="0"
                step="1000"
                value={part.unitCost}
                onChange={(event) => updatePart(index, 'unitCost', event.target.value)}
                required
              />
            </label>
            <label>
              Nhà cung cấp
              <input
                className="form-input"
                value={part.supplier}
                onChange={(event) => updatePart(index, 'supplier', event.target.value)}
                maxLength={255}
              />
            </label>
            <label className="part-usage-document">
              Số hóa đơn / chứng từ
              <input
                className="form-input"
                value={part.documentNumber}
                onChange={(event) => updatePart(index, 'documentNumber', event.target.value)}
                maxLength={100}
              />
            </label>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="part-usage-add"
        onClick={() => onChange([...parts, { ...EMPTY_PART }])}
        disabled={disabled}
      >
        <Plus size={15} />
        Thêm linh kiện
      </button>
    </div>
  );
}
