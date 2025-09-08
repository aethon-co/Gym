const StatusDot = ({ status }: { status: 'Active' | 'Expired' | 'Suspended' }) => {
  const color = status === 'Active' ? 'bg-green-500' : status === 'Expired' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <span
      className={`h-3 w-3 rounded-full ${color} animate-pulse inline-block`}
    />
  );
};

export default StatusDot