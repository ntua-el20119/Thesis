"use client";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function TextArea({ value, onChange, onSubmit }: TextAreaProps) {
  return (
    <div className="mb-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Enter legal text here..."
        rows={5}
      />
      <button
        onClick={onSubmit}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Process Text
      </button>
    </div>
  );
}