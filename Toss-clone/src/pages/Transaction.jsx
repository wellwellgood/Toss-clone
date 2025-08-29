import { useTransactionStore } from '../store/transactionStore';
import { useTransactions } from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';

export default function Transaction() {
  const { transactions } = useTransactionStore();

  useTransactions();

  return (
    <div className="p-4">
      <h1 className="text-xl">거래 내역</h1>
      <ul className="mt-4">
        {transactions.map((t) => (
          <TransactionItem key={t.id} type={t.type} amount={t.amount} date={t.date} />
        ))}
      </ul>
    </div>
  );
}
