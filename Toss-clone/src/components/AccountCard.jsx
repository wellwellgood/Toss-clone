export default function AccountCard({ owner, balance }) {
    return (
      <div className="p-4 border rounded">
        <h2 className="text-lg font-bold">{owner}님의 계좌</h2>
        <p className="text-2xl mt-2">{balance.toLocaleString()}원</p>
      </div>
    );
  }
  