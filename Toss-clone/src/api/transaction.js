export const getTransactions = async () => {
    const res = await fetch('/api/transactions');
    return res.json();
  };
  
  export const sendMoney = async (to, amount) => {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, amount })
    });
    return res.json();
  };
  