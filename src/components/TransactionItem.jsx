export default function TransactionItem({ type, amount, date }) {
    return (
      <li className="border-b py-2">
        <div>{type}</div>
        <div>{amount.toLocaleString()}원</div>
        <div className="text-gray-500 text-sm">{date}</div>
      </li>
    );
  }
  