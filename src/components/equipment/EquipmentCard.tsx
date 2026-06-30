export default function EquipmentCard({ item }: any) {
  return (
    <div className="border rounded-xl p-4 shadow-sm">
      <div className="h-40 bg-gray-200 rounded mb-3" />

      <h2 className="text-lg font-semibold">
        {item.title}
      </h2>

      <p className="text-sm text-gray-500">
        {item.brand} • {item.model}
      </p>

      <p className="text-xl font-bold mt-2">
        £{item.price}
      </p>

      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
        {item.status}
      </span>
    </div>
  );
}