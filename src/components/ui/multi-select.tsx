import { Badge } from "@/components/ui/badge";

type MultiSelectProps = {
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
};

export function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  function toggleOption(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option)); // Remove if already selected
    } else {
      onChange([...value, option]); // Add if not selected
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Badge
          key={option}
          className={`cursor-pointer transition ${
            value.includes(option)
              ? "bg-blue-500 text-white" // Selected state
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => toggleOption(option)}
        >
          {option}
        </Badge>
      ))}
    </div>
  );
}
