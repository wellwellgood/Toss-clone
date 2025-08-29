import { useState } from 'react';
import { useAccountStore } from '../store/accountStore';
import { sendMoney } from '../api/transaction';

export default function SendMoney() {
  const { balance, owner, setAccount } = useAccountStore();
  const [amount, setAmount] = useState(0);

  const handleSend = async () => {
    const data = await sendMoney('98765', amount);
    setAccount(data.newBalance, owner);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl">송금하기</h1>
      <input
        type="number"
        className="border p-2 mt-4 w-full"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="송금 금액 입력"
      />
      <button
        className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
        onClick={handleSend}
        disabled={amount <= 0 || amount > balance}
      >
        송금
      </button>
    </div>
  );
}
