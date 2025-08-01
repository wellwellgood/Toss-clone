export const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 10);
  };
  